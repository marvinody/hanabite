import { loadingWritable } from './utils'
import socket from './socket'

// I'll be the first to admit that this could use a better name
// but at this point, I may as well stick with it.
export const hands = loadingWritable([])

socket.on('game_private_info', privateInfo => {
  hands.set(privateInfo)
})
