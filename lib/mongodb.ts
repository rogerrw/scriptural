import { MongoClient } from 'mongodb';
require('dotenv').config();
if (!process.env.MONGODB_URL) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URL"');
}

const url = process.env.MONGODB_URL;
const options = {};

let client: MongoClient;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(url, options);
  }
  client = globalWithMongo._mongoClient;
} else {
  client = new MongoClient(url, options);
}

export default client;
