import idGen from '../id';
import nameGen from './name';
import RoomMaker from './Room';
import { getUserData } from './utils';

export default function (io) {
  // let's "make" our roomlist constructor
  const { RoomList } = RoomMaker(io)
  // and now let's make a new room list to use for all our rooms
  const rooms = new RoomList();
  io.on('connection', socket => {
    socket.data = {
      id: idGen(),
      name: nameGen(),
    }
    console.log(`${socket.id} (${socket.data.name} - ${socket.data.id}) has connected`)
    socket.join('lobby')
    socket.emit('self_info', getUserData(socket))


    socket.on('req_room_list', () => {
      socket.emit('res_room_list', rooms.basicInfo())
    })

    socket.on('req_room_create', data => {
      const room = rooms.newRoom(data);
      socket.emit('res_room_create', room.basicInfo())
      io.to('lobby').emit('lobby_room_create', room.basicInfo())
    })

    socket.on('req_room_join', id => {
      const room = rooms.findById(id)
      if (!room) {
        // just send empty obj if 404
        socket.emit('res_room_join', {})
        return
      }
      room.addPlayer(socket)
      socket.emit('res_room_join', room.expandedInfo())
    })

    socket.on('req_room_message', msg => {
      // if user not part of room, don't bother doing anything
      if (!socket.data.room) {
        return
      }
      socket.data.room.addMessage(msg, socket.data.name)
    })

    socket.on('req_self_ready_set', ready => {
      // if user not part of room, don't bother doing anything
      if (!socket.data.room) {
        return
      }
      socket.data.ready = ready;
      socket.data.room.updatePlayer(socket)
    })

    socket.on('req_room_start', () => {
      // if user not part of room, don't bother doing anything
      if (!socket.data.room) {
        return;
      }
      socket.data.room.attemptToStart(socket);
    })

    socket.on('req_room_leave', () => {
      // if user not part of room, don't bother doing anything
      if (!socket.data.room) {
        return
      }
      rooms.removePlayer(socket, socket.data.room.id)
    })

    socket.on('disconnect', () => {
      if (socket.data.room) {
        rooms.removePlayer(socket, socket.data.room.id)
      }
    })
  })
}
