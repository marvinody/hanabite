import { writable } from 'svelte/store';

const initialState = {
  id: -1,
  idx: -1,
}

// I'll be the first to admit that this could use a better name
// but at this point, I may as well stick with it.
export const selectedCard = writable(initialState)

export const toggleCardSelect = (id, idx) => {
  selectedCard.update((old) => {
    console.log('toggling card', id, idx, old)
    // if the stuff matches, then let's set it back to nothing
    if (old.id === id && old.idx === idx) {
      return initialState
    }
    // otherwise, it's a new card so let's just select it
    return { id, idx }
  })
}
