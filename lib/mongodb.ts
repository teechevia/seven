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
  // First decode any URL encoding to normalize the string
  let cleanedUri = uri
  try {
    cleanedUri = decodeURIComponent(uri)
  } catch {
    // If decoding fails, use original
  }
  
  // Remove all variations of appname/appName parameter using regex
  // This handles: appname, appName, %20appname, encoded spaces, etc.
  cleanedUri = cleanedUri.replace(/[?&]\s*app[nN]ame=[^&]*/gi, (match, offset, string) => {
    // Check if this is the first parameter (starts with ?)
    const charBefore = offset > 0 ? string[offset] : ''
    if (charBefore === '?') {
      // Check if there are more parameters after
      const afterMatch = string.substring(offset + match.length)
      if (afterMatch.startsWith('&')) {
        return '?'
      }
      return ''
    }
    return ''
  })
  
  // Also try with URL-encoded space (%20)
  cleanedUri = cleanedUri.replace(/[?&]%20*app[nN]ame=[^&]*/gi, (match) => {
    return match.startsWith('?') ? '?' : ''
  })
  
  // Clean up any double && or trailing ? or &
  cleanedUri = cleanedUri.replace(/&&+/g, '&')
  cleanedUri = cleanedUri.replace(/\?&/g, '?')
  cleanedUri = cleanedUri.replace(/\?$/g, '')
  cleanedUri = cleanedUri.replace(/&$/g, '')
  
  // Re-encode special characters if needed for MongoDB URI format
  // But keep the basic structure intact
  return cleanedUri
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
