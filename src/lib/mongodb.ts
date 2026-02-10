import dns from "node:dns/promises";
import { MongoClient } from "mongodb";

dns.setServers(["1.1.1.1"]);

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not set.");
}

let cachedClient: MongoClient | null = null;

export async function getMongoClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri, { family: 4 });
  await client.connect();
  cachedClient = client;
  return client;
}
