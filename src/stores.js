import io from 'socket.io-client';
import { writable } from 'svelte/store';
const socket = io();
socket.on('connect', () => {
  console.log('CONNECTED')
})

function createCount() {
  const { subscribe, set, update } = writable(0);

  return {
    subscribe,
    increment: () => update(n => n + 1),
    decrement: () => update(n => n - 1),
    reset: () => set(0)
  };
}

export const count = createCount();
