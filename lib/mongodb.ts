import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthscreen_ai';
const dbName = process.env.MONGODB_DB || 'healthscreen_ai';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // Allow global caching in development to prevent connections exhausted
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!process.env.MONGODB_URI && process.env.NODE_ENV !== 'production') {
    // Attempt local connection if in development
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, {
          serverSelectionTimeoutMS: 2000,
          connectTimeoutMS: 2000,
        });
        global._mongoClientPromise = client.connect();
      }
      return await global._mongoClientPromise;
    } else {
      if (!clientPromise) {
        client = new MongoClient(uri, {
          serverSelectionTimeoutMS: 3000,
        });
        clientPromise = client.connect();
      }
      return await clientPromise;
    }
  } catch (error) {
    console.warn('[MongoDB] MongoDB Atlas / Local not reachable, falling back to local memory store:', (error as Error).message);
    return null;
  }
}

export async function getDatabase(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  try {
    return client.db(dbName);
  } catch {
    return null;
  }
}

export async function checkMongoHealth(): Promise<{ connected: boolean; message: string }> {
  try {
    const client = await getMongoClient();
    if (!client) {
      return { connected: false, message: 'Offline / In-Memory Store Active (MongoDB not connected)' };
    }
    await client.db(dbName).command({ ping: 1 });
    return { connected: true, message: 'Connected to MongoDB Atlas' };
  } catch (err) {
    return { connected: false, message: `MongoDB unreachable: ${(err as Error).message}` };
  }
}
