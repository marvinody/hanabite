import { writeableArray } from './utils'
import socket from './socket'

export const messages = writeableArray()


// this has no socket.on with it because everyone is updated of the msg
// one could update check and update locally to have better UI but
// dont want to in this case because a little more work and I'm lazy
export const sendMessage = msg => {
  socket.emit('req_room_message', msg)
}

socket.on('room_message_single', msg => {
  messages.push(msg)
})

socket.on('room_message_all', msgs => {
  messages.set(msgs)
})
