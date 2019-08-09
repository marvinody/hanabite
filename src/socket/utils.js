export const getUserData = socket => ({
  id: socket.data.id,
  name: socket.data.name,
  ready: socket.data.ready
})
