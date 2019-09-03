import { writable } from 'svelte/store';

export function writeableArray() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    push: (el) => update(n => [...n, el]),
    set,
  };
}

export function loadingWritable(initial) {
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
