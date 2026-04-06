import mongoose from "mongoose"

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | undefined
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  )
}

/**
 * Clean the MongoDB URI by removing unsupported options
 * Some MongoDB connection strings include options that aren't supported by mongoose
 */
function cleanMongoDBUri(uri: string): string {
  try {
    // First try URL-based cleaning
    const url = new URL(uri)
    // Remove unsupported options (case-insensitive)
    const unsupportedOptions = ['appname', 'appName', ' appname', ' appName']
    unsupportedOptions.forEach(opt => {
      url.searchParams.delete(opt.trim())
    })
    let cleanedUri = url.toString()
    
    // Also use regex to catch any edge cases with spaces or encoding issues
    // Remove appname parameter with various formats
    cleanedUri = cleanedUri.replace(/[?&]\s*appname=[^&]*/gi, match => {
      // If it starts with ?, we need to handle the next param
      return match.startsWith('?') ? '?' : ''
    })
    cleanedUri = cleanedUri.replace(/[?&]\s*appName=[^&]*/gi, match => {
      return match.startsWith('?') ? '?' : ''
    })
    
    // Clean up any double && or trailing ?
    cleanedUri = cleanedUri.replace(/&&/g, '&')
    cleanedUri = cleanedUri.replace(/\?&/g, '?')
    cleanedUri = cleanedUri.replace(/\?$/, '')
    cleanedUri = cleanedUri.replace(/&$/, '')
    
    return cleanedUri
  } catch {
    // If URL parsing fails, use regex fallback
    let cleanedUri = uri
    cleanedUri = cleanedUri.replace(/[?&]\s*appname=[^&]*/gi, match => {
      return match.startsWith('?') ? '?' : ''
    })
    cleanedUri = cleanedUri.replace(/[?&]\s*appName=[^&]*/gi, match => {
      return match.startsWith('?') ? '?' : ''
    })
    cleanedUri = cleanedUri.replace(/&&/g, '&')
    cleanedUri = cleanedUri.replace(/\?&/g, '?')
    cleanedUri = cleanedUri.replace(/\?$/, '')
    cleanedUri = cleanedUri.replace(/&$/, '')
    return cleanedUri
  }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached!.conn) {
    return cached!.conn
  }

  if (!cached!.promise) {
    const cleanedUri = cleanMongoDBUri(MONGODB_URI!)
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    }

    cached!.promise = mongoose.connect(cleanedUri, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    throw e
  }

  return cached!.conn
}

export default connectDB
