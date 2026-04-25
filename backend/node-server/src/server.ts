import { createServer } from 'http'
import { createApp } from './app'
import { connectToDatabase } from './config/db'
import { env } from './config/env'
import { setupSocketServer } from './socket/setupSocket'

async function bootstrap(): Promise<void> {
  await connectToDatabase(env.MONGODB_URI)

  const app = createApp()
  const httpServer = createServer(app)
  setupSocketServer(httpServer)

  httpServer.listen(env.PORT, () => {
    console.info(`Backend running on port ${env.PORT}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
