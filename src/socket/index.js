import idGen from '../id';
import nameGen from './name';
import RoomMaker from './Room';
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
    socket.emit('self_info', socket.data)


    socket.on('req_room_list', () => {
      socket.emit('res_room_list', rooms.basicInfo())
    })

    socket.on('req_room_create', data => {
      const room = rooms.newRoom(data);
      socket.emit('res_room_create', room.basicInfo())
    })

    socket.on('req_room_join', id => {
      console.log(`${socket.data.name} joining ${id}`)
      const room = rooms.findById(id)
      if (!room) {
        // just send empty obj if 404
        socket.emit('res_room_join', {})
        return
      }
      room.addPlayer(socket)
      console.log(room);
      socket.emit('res_room_join', room.expandedInfo())
    })

  })
}
