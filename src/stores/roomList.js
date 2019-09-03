import { loadingWritable } from './utils'
import socket from './socket'

export const roomList = loadingWritable([])


export const fetchRoomList = () => {
  socket.emit('req_room_list')
}


socket.on('res_room_list', newRoomList => {
  roomList.set(newRoomList)
})

socket.on('lobby_room_create', newRoom => {
  roomList.update(l => [newRoom, ...l])
})

socket.on('lobby_room_update', updatedRoom => {
  roomList.update(l => l.map(curRoom => {
    if (curRoom.id === updatedRoom.id) {
      return updatedRoom;
    }
    return curRoom;
  }))
})

socket.on('lobby_room_remove', id => {
  roomList.update(l => l.filter(curRoom => curRoom.id !== id))
})
