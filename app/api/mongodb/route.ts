// import { NextResponse } from "next/server";
// const os = require('os');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/'; // default uri for local instance

const client = new MongoClient(uri);

const DB = 'bible';

async function handler() {}
export { handler as GET, handler as POST };
