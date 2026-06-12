/**
 * mongodb.ts
 * اتصال به MongoDB Atlas
 * از متغیر محیطی MONGODB_URI استفاده می‌کند
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.warn("⚠️  MONGODB_URI is not set. Using fallback mode.");
}

// cache connection در dev mode
declare global {
  var _mongooseConn: typeof mongoose | null;
  var _mongoosePromise: Promise<typeof mongoose> | null;
}

let cached = global._mongooseConn;
let cachedPromise = global._mongoosePromise;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached) return cached;

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  try {
    cached = await cachedPromise;
    global._mongooseConn = cached;
  } catch (e) {
    cachedPromise = null;
    global._mongoosePromise = null;
    throw e;
  }

  return cached;
}
