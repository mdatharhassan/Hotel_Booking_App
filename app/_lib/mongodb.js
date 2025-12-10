import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL;

const client = new MongoClient(MONGO_URL);
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db("innsightDB");
  } catch (e) {
    console.error(e.message);
  } finally {
  }
}

connectToDatabase();

export const dbClient = client;
export const dbName = "innsightDB";
