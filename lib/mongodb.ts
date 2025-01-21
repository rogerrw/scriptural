import mongoose from 'mongoose';
require('dotenv').config();

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const url = process.env.MONGODB_URL;
  if (!url) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URL"');
  }

  const db = process.env.MONGODB_DATABASE;
  console.log(url + db);
  if (!db) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_DATABASE"');
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(url + db, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
