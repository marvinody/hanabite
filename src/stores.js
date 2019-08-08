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

/* STATE/STORE holders,updaters*/
export const self = writable({
  id: 0,
  name: 'No-name McGee'
})

export const roomList = writable([])
export const room = writable({})
export const messages = writeableArray()

const socket = io();
socket.on('connect', () => {
  console.log('CONNECTED')
})

/* "THUNKS" for sockets */
export const fetchRoomList = () => {
  socket.emit('req_room_list')
}
socket.on('res_room_list', newRoomList => {
  newRoomList.loaded = true;
  roomList.set(newRoomList)
})

export const createRoom = roomData => {
  socket.emit('req_room_create', roomData)
}
socket.on('res_room_create', newRoom => {
  goto(`/rooms/${newRoom.id}`)
})

// this has no socket.on with it because everyone is updated of the msg
// one could update check and update locally to have better UI but
// dont want to in this case because a little more work and I'm lazy
export const sendMessage = msg => {
  socket.emit('req_room_message', msg)
}


export const joinRoom = id => {
  socket.emit('req_room_join', id)
}
socket.on('res_room_join', newRoom => {
  newRoom.loaded = true;
  room.set(newRoom)
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
