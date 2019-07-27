import RoomMaker from './Room';
export default function (io) {
  // let's "make" our roomlist constructor
  const { RoomList } = RoomMaker(io)
  // and now let's make a new room list to use for all our rooms
  const roomList = new RoomList();
  io.on('connection', socket => {
    console.log('connected: ' + socket.id)

    socket.on('req_room_list', () => {
      socket.emit('res_room_list', roomList.basicInfo())
    })

  })
}
