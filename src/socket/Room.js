const MIN_PLAYERS = 1
const MAX_PLAYERS = 4
const MAX_CHARS_FOR_MSG = 160 // screw twitter
import genId from '../id';

export default function (io) {
  class Room {
    constructor(name, size = MIN_PLAYERS) {
      this.players = {}
      this.spectators = {}
      this.name = name
      this.id = genId()
      this.size = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, size))
      this.uniqueName = `room-#${this.id}`
      this.messages = []
      this.state = 'ROOM_PREGAME'

      this.curPlayer = 0 // idx for who's turn it is
    }

    startGame() {
      this.state = 'ROOM_INGAME'
      this.curPlayer = 0
      io.to(this.uniqueName).emit('room_state_update', this.expandedInfo())
    }

    addMessage(message, from = null) {
      if (message.length === 0 || message.length > MAX_CHARS_FOR_MSG) {
        return
      }
      const msg = {
        message,
        from,
        id: genId(),
        time: Date.now()
      }
      this.messages.push(msg)
      io.to(this.uniqueName).emit('room_message_single', msg)
    }


    sendAllMessagesTo(socket) {
      socket.emit('room_message_all', this.messages)
    }

    addPlayer(socket) {
      // TODO this needs to change if entering a game midway. should be true in that case
      socket.data.ready = false;
      const numPlayers = Object.keys(this.players).length
      if (numPlayers === 0) {
        this.host = socket
        this.players[socket.id] = socket
        // the host will always be ready by default
        socket.data.ready = true;
      } else if (numPlayers === this.size) {
        this.spectators[socket.id] = socket
      } else {
        this.players[socket.id] = socket
      }
      // some socket stuff for the original person
      socket.leave('lobby')
      socket.join(this.uniqueName)
      socket.data.room = this
      socket.data.timeJoinedRoom = Date.now()
      socket.emit('res_room_join', this.expandedInfo())
      // now everyone else in the room can know
      socket.to(this.uniqueName).emit('room_player_join', this.expandedInfo())
      // and the lobby
      io.to('lobby').emit('lobby_room_update', this.basicInfo())
      // and we'll add a message and share that. but socket needs them all
      this.sendAllMessagesTo(socket)
      this.addMessage(`${socket.data.name} has joined!`)
    }

    // returns true if no more players in room
    // false otherwise
    // if empty, need to be deleted manually and everyone informed
    // this only informs if >0 players in room
    // TODO choose new host also
    removePlayer(socket) {
      const isPlayer = this.players[socket.id] !== undefined
      const isSpectator = this.spectators[socket.id] !== undefined
      if (isPlayer) {
        delete this.players[socket.id]
        this.upgradeSpectator()
        // if ingame, then let's see how to modify the player idx
        if (this.state === 'ROOM_INGAME') {
          // if the usercount is the same, we don't care
          // but if we got less AND the count is on the last player
          // shift it to 0. because that makes sense.
          const numPlayers = Object.keys(this.players).length
          if (numPlayers === this.curPlayer) {
            this.curPlayer = 0
          }
        }
      } else if (isSpectator) {
        delete this.spectators[socket.id]
      }
      socket.leave(this.uniqueName)
      socket.join('lobby')
      delete socket.data.room
      delete socket.data.timeJoinedRoom
      // tell everyone else that room has changed
      socket.to(this.uniqueName).emit('room_player_update', this.expandedInfo())
      io.to('lobby').emit('lobby_room_update', this.basicInfo())
      return Object.keys(this.players).length === 0
    }

    // this should only be called when a player leaves
    upgradeSpectator() {
      const spectKeys = Object.keys(this.spectators)
      if (spectKeys.length === 0) {
        // nothing to do
        return
      }
      const oldestSpectator = spectKeys
        .map(k => this.spectators[k])
        .sort((a, b) => a.data.timeJoinedRoom - b.data.timeJoinedRoom)[0]

      delete this.spectators[oldestSpectator.id]
      this.players[oldestSpectator.id] = oldestSpectator
    }

    expandedInfo() {
      return {
        id: this.id,
        name: this.name,
        state: this.state,
        host: {
          name: this.host.data.name,
          id: this.host.data.id
        },
        size: this.size,
        curPlayer: this.curPlayer,
        players: Object.keys(this.players).map(k => ({
          name: this.players[k].data.name,
          id: this.players[k].data.id,
          ready: this.players[k].data.ready
        })),
        spectators: Object.keys(this.spectators).map(k => ({
          name: this.spectators[k].data.name,
          id: this.spectators[k].data.id
        }))
      }
    }

    basicInfo() {
      return {
        id: this.id,
        name: this.name,
        state: this.state,
        size: this.size,
        playerCount: Object.keys(this.players).length,
        spectatorCount: Object.keys(this.spectators).length
      }
    }
  }

  class RoomList {
    constructor() {
      this.rooms = {}
    }

    basicInfo() {
      return Object.keys(this.rooms).map(k => this.rooms[k].basicInfo())
    }

    newRoom(info) {
      const room = new Room(info.name, info.size)
      this.rooms[room.id] = room
      return room
    }

    findById(id) {
      return this.rooms[id]
    }

    removeRoom(id) {
      delete this.rooms[id]
      io.to('lobby').emit('lobby_room_remove', id)
    }

    // utility to remove and delete room if needed
    removePlayer(socket, id) {
      const room = this.findById(id)
      if (!room) {
        return socket.emit(
          'err',
          'Could not leave requested room because it doesn not exist'
        )
      }
      const isEmpty = room.removePlayer(socket)

      if (isEmpty) {
        this.removeRoom(room.id)
      }
    }
  }
  return {
    Room,
    RoomList
  }
}
