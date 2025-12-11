// import { MongoClient } from "mongodb";

// const MONGO_URL = process.env.MONGO_URL;

// const client = new MongoClient(MONGO_URL);
// async function connectToDatabase() {
//   try {
//     await client.connect();
//     console.log("Connected successfully to server");
//     const db = client.db("innsightDB");
//   } catch (e) {
//     console.error(e.message);
//   } finally {
//   }
// }

// connectToDatabase();

// export const dbClient = client;
// export const dbName = "innsightDB";

import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URL;

if (!uri) {
  throw new Error("❌ Missing MONGO_URL in environment variables");
}

let client;
let dbClient;

// prevent creating many connections in dev hot reload
if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
dbClient = global._mongoClientPromise;

export default dbClient;
