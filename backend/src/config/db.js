const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

let memoryServer = null;
let syncTimer = null;

function flush() {
  return mongoose.connection.db
    .admin()
    .command({ fsync: 1 })
    .catch(() => {});
}

async function connectDB() {
  mongoose.set('strictQuery', true);
  const uri = process.env.MONGO_URI && process.env.MONGO_URI.trim();

  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
      return;
    } catch (err) {
      console.warn(`Could not reach MONGO_URI (${err.message}). Using embedded MongoDB instead...`);
    }
  }

  // no MONGO_URI (or it failed), so start an in-memory MongoDB.
  // With EMBEDDED_DB_PERSIST=true the data is kept in backend/data/mongo between runs.
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const persist = String(process.env.EMBEDDED_DB_PERSIST).toLowerCase() === 'true';
  const instance = { dbName: 'adidas_dashboard' };
  if (persist) {
    instance.dbPath = path.join(__dirname, '..', '..', 'data', 'mongo');
    fs.mkdirSync(instance.dbPath, { recursive: true });
    instance.storageEngine = 'wiredTiger';
  }

  console.log('Starting embedded MongoDB (the first run downloads the binary, please wait)...');
  memoryServer = await MongoMemoryServer.create({ instance });
  await mongoose.connect(memoryServer.getUri('adidas_dashboard'));

  if (persist) {
    syncTimer = setInterval(flush, 3000);
    syncTimer.unref();
  }
  console.log(`Embedded MongoDB ready (${persist ? 'persistent' : 'fresh per run'})`);
}

async function closeDB() {
  if (syncTimer) {
    clearInterval(syncTimer);
  }
  if (memoryServer) {
    await flush();
  }
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = { connectDB, closeDB, flush };
