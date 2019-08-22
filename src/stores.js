import { goto } from '@sapper/app';
import io from 'socket.io-client';
import { writable } from 'svelte/store';

function writeableArray() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    push: (el) => update(n => [...n, el]),
    set,
  };
}

function loadingWritable(initial) {
  const { subscribe, set: originalSet, update: originalUpdate } = writable(initial);
  return {
    subscribe,
    set: state => {
      state.loaded = true;
      originalSet(state)
    },
    update: fn => {
      originalUpdate(state => {
        const newState = fn(state)
        newState.loaded = true;
        return newState
      })
    }
  }
}


/* STATE/STORE holders,updaters*/
export const self = writable({
  id: 0,
  name: 'No-name McGee'
})

export const roomList = loadingWritable([])
export const room = loadingWritable({})
export const messages = writeableArray()

export const game = writable({})

const socket = io();
socket.on('connect', () => {
  console.log('CONNECTED')
})

/* "THUNKS" for sockets */
export const fetchRoomList = () => {
  socket.emit('req_room_list')
}
socket.on('res_room_list', newRoomList => {
  roomList.set(newRoomList)
})

export const createRoom = roomData => {
  socket.emit('req_room_create', roomData)
}
socket.on('res_room_create', newRoom => {
  goto(`/rooms/${newRoom.id}`)
})

// this has no socket.on with it because the server sends a self_info and a room_player_state
export const setReadyState = ready => {
  socket.emit('req_self_ready_set', ready)
}


// this has no socket.on with it because everyone is updated of the msg
// one could update check and update locally to have better UI but
// dont want to in this case because a little more work and I'm lazy
export const sendMessage = msg => {
  socket.emit('req_room_message', msg)
}

// this has no .on because the whole lobby will be updated. Also, only the host will have any effect on triggering it
export const roomStart = () => {
  socket.emit('req_room_start')
}

export const joinRoom = id => {
  socket.emit('req_room_join', id)
}
socket.on('res_room_join', newRoom => {
  room.set(newRoom)
})

export const leaveRoom = () => {
  socket.emit('req_room_leave')
}
socket.on('res_room_leave', () => {
  goto('/rooms/')
})

socket.on('self_info', newSelf => {
  self.set(newSelf)
})


/* GENERAL EVENTS */

/* CHAT MSG EVENTS */
socket.on('room_message_single', msg => {
  messages.push(msg)
})

socket.on('room_message_all', msgs => {
  messages.set(msgs)
})

/* ROOM PREGAME EVENTS */
socket.on('room_player_join', newRoom => {
  room.set(newRoom)
})

socket.on('room_player_update', ({ players, spectators, host }) => {
  room.update(s => ({
    ...s,
    players,
    spectators,
    host,
  }))
})

/* LOBBY EVENTS */
socket.on('lobby_room_create', newRoom => {
  roomList.update(l => [newRoom, ...l])
})

socket.on('lobby_room_update', updatedRoom => {
  roomList.update(l => l.map(curRoom => {
    if (curRoom.id === updatedRoom.id) {
      return updatedRoom;
    }
    return curRoom;
  }))
})

socket.on('lobby_room_remove', id => {
  roomList.update(l => l.filter(curRoom => curRoom.id !== id))
})

socket.on('room_player_state_update', player => {
  room.update(state => ({
    ...state,
    players: state.players.map(curPlayer => {
      if (curPlayer.id === player.id) {
        return player;
      }
      return curPlayer;
    })
  }))
})

socket.on('room_state_update', newState => {
  room.update(state => ({
    ...state,
    ...newState,
  }))
})

/*GAME EVENTS*/
socket.on('game_public_info', publicInfo => {
  game.set(publicInfo)
  console.log(publicInfo)
})
