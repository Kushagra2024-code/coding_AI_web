import morgan from 'morgan'
import { env } from '../config/env'

// For production, we would use winston, but here we'll create a 
// structured console logger that works well with Render/Railway logs.
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), message, ...meta }))
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({ 
      level: 'error', 
      timestamp: new Date().toISOString(), 
      message, 
      stack: error instanceof Error ? error.stack : undefined,
      ...error 
    }))
  },
  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify({ level: 'warn', timestamp: new Date().toISOString(), message, ...meta }))
  }
}

// Morgan stream for express logging
export const logStream = {
  write: (message: string) => {
    // Morgan adds a newline, we strip it for JSON formatting
    logger.info('HTTP Request', { detail: message.trim() })
  }
}

export const requestLogger = morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: env.NODE_ENV === 'production' ? logStream : undefined
})
