import { loadingWritable } from './utils'
import socket from './socket'

export const game = loadingWritable({})

socket.on('game_public_info', publicInfo => {
  game.set(publicInfo)
})

