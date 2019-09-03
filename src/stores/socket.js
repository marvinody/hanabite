import io from 'socket.io-client';

const socket = io();
socket.on('connect', () => {
  console.log('CONNECTED')
})

export default socket;
