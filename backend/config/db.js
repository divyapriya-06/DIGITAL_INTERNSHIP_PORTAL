import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer = null;

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internship_portal';
  
  try {
    // Try connecting to provided/local MongoDB with a short timeout
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.log(`⚠️ Local MongoDB not found on ${primaryUri}. Initializing embedded MongoDB server...`);
    try {
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'internship_portal',
        }
      });
      const inMemoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✅ Embedded In-Memory MongoDB Initialized & Connected at ${inMemoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`❌ Failed to start embedded MongoDB server:`, memErr);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};
