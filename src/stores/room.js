import { goto } from '@sapper/app';
import socket from './socket';
import { loadingWritable } from './utils';


export const room = loadingWritable({})


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
