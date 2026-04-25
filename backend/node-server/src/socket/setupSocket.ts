import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { env } from '../config/env'

export function setupSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    socket.emit('server:ready', { message: 'Socket connected' })

    socket.on('disconnect', () => {
      // Intentionally no-op for initial scaffold.
    })
  })

  return io
}
