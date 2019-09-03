import { writable } from 'svelte/store';
import socket from './socket'

export const self = writable({
  id: 0,
  name: 'No-name McGee'
})

socket.on('self_info', newSelf => {
  self.set(newSelf)
})
