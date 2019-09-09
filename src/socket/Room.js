const MIN_PLAYERS = 1
const MAX_PLAYERS = 4
const MAX_CHARS_FOR_MSG = 160 // screw twitter
import genId from '../id';
import gameFactory from './Game';
import { getUserData } from './utils';

const ROOM_PREGAME = 'ROOM_PREGAME'
const ROOM_INGAME = 'ROOM_INGAME'

export default function (io) {
  const Game = gameFactory(io);
  class Room {
    constructor(name, size = MIN_PLAYERS) {
      this.host = {}; // socket obj
      this.players = {} // map of [socket.id] -> socket
      this.spectators = {} // map of [socket.id] -> socket
      this.name = name // user chosen room identifier
      this.id = genId() // unique number to identify room
      this.size = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, size))
      this.uniqueName = `room-#${this.id}` // string for sockets to join
      this.messages = [] // array of message objects
      this.state = ROOM_PREGAME

      this.curPlayer = 0 // idx for who's turn it is
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
      const isHost = this.host.data.id === socket.data.id;
      if (isPlayer) { // we might need to swap people in
        delete this.players[socket.id]
        const newPlayer = this.upgradeSpectator()
        // if ingame, then let's see how to modify the player
        if (this.state === ROOM_INGAME) {
          // if we have a player, then let's swap them
          if (newPlayer !== undefined) {
            this.game.swapPlayers(socket, newPlayer)
          } else { // else, just remove and let game use AI
            this.game.removePlayer(socket)
          }
        }
        // if host is leaving, we need to fix that too
        if (isHost) {
          this.upgradeHost();
        }
      } else if (isSpectator) { // don't care about these guys
        delete this.spectators[socket.id]
      }
      socket.leave(this.uniqueName)
      socket.join('lobby')
      delete socket.data.room
      delete socket.data.timeJoinedRoom
      // tell everyone else that room has changed
      socket.to(this.uniqueName).emit('room_player_update', this.playerInfo())
      io.to('lobby').emit('lobby_room_update', this.basicInfo())
      return Object.keys(this.players).length === 0
    }

    updatePlayer(socket) {
      const userData = getUserData(socket)
      socket.emit('self_info', userData)
      io.to(this.uniqueName).emit('room_player_state_update', userData)
    }
    // will try to begin the game.
    attemptToStart(socket) {
      // can only start a game if it's in the pregame state
      if (this.state !== ROOM_PREGAME) {
        return
      }
      // only the host can start the game
      if (this.host.data.id !== socket.data.id) {
        return
      }
      const allReady = Object.values(this.players).every(s => s.data.ready)
      // can only start if everyone ready
      if (!allReady) {
        return
      }

      this.state = ROOM_INGAME
      io.to(this.uniqueName).emit('room_state_update', {
        state: this.state,
      })
      this.game = new Game(this.players, this.size, this.uniqueName, this)
      io.to('lobby').emit('lobby_room_update', this.basicInfo())


    }

    // this should only be called when a player leaves
    // will return the socket that was upgraded if any
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
      oldestSpectator.data.ready = false;
      this.players[oldestSpectator.id] = oldestSpectator
      return oldestSpectator
    }
    upgradeHost() {
      const playerKeys = Object.keys(this.players);
      if (playerKeys.length === 0) {
        // no players to change into host, room will get deleted
        return;
      }
      const oldestPlayer = playerKeys
        .map(k => this.players[k])
        .sort((a, b) => a.data.timeJoinedRoom - b.data.timeJoinedRoom)[0]
      // host is always ready
      oldestPlayer.data.ready = true;
      this.host = oldestPlayer
    }

    expandedInfo() {
      return {
        id: this.id,
        name: this.name,
        state: this.state,
        size: this.size,
        curPlayer: this.curPlayer,
        ...this.playerInfo(),
      }
    }

    playerInfo() {
      return {
        players: Object.values(this.players).map(getUserData),
        spectators: Object.keys(this.spectators).map(k => ({
          name: this.spectators[k].data.name,
          id: this.spectators[k].data.id
        })),
        host: {
          name: this.host.data.name,
          id: this.host.data.id
        },
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
