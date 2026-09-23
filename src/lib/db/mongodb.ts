import mongoose from "mongoose";
import { mockDB } from "./mock-store";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<{ isLiveMongo: boolean }> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes("username:password") || process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    // Graceful fallback to persistent mock in-memory DB
    return { isLiveMongo: false };
  }

  if (cached.conn) {
    return { isLiveMongo: true };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB_NAME || "focusforge",
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    return { isLiveMongo: true };
  } catch (err) {
    console.warn("MongoDB connection failed, falling back to in-memory store:", err);
    cached.promise = null;
    return { isLiveMongo: false };
  }
}

export { mockDB };
