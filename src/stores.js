import io from 'socket.io-client';
import { writable } from 'svelte/store';


function createCount() {
  const { subscribe, set, update } = writable(0);

  return {
    subscribe,
    increment: () => update(n => n + 1),
    decrement: () => update(n => n - 1),
    reset: () => set(0)
  };
}

/* STATE/STORE holders,updaters*/
export const self = writable({
  id: 0,
  name: 'No-name McGee'
})

export const roomList = writable([])
export const room = writable({})

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


socket.on('self_info', newSelf => {
  self.set(newSelf)
})
