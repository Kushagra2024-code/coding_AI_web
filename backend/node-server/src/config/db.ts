import mongoose from 'mongoose'

export async function connectToDatabase(uri?: string): Promise<void> {
  if (!uri) {
    console.warn('MONGODB_URI not provided; running without DB connection in local scaffold mode')
    return
  }

  await mongoose.connect(uri)
  console.info('MongoDB connected')
}
