import mongoose from 'mongoose';
import dbEngine from '../data/dbStore.js';

// Support MongoDB-style sort objects e.g. array.sort({ createdAt: -1 })
const originalArraySort = Array.prototype.sort;
Array.prototype.sort = function (compareFn) {
  if (compareFn && typeof compareFn === 'object' && !Array.isArray(compareFn)) {
    return originalArraySort.call(this, (a, b) => {
      for (const [key, dir] of Object.entries(compareFn)) {
        const valA = a ? a[key] : undefined;
        const valB = b ? b[key] : undefined;
        if (valA === undefined && valB === undefined) continue;
        if (valA < valB) return dir === -1 ? 1 : -1;
        if (valA > valB) return dir === -1 ? -1 : 1;
      }
      return 0;
    });
  }
  return originalArraySort.call(this, compareFn);
};

let isMongooseConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resqgrid';
  try {
    // Attempt Mongoose connection with 1.5s timeout so startup is instant if mongod is not running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
    });
    isMongooseConnected = true;
    console.log(`[DB] Connected to MongoDB at ${uri}`);
  } catch (err) {
    isMongooseConnected = false;
    console.log(`[DB] MongoDB daemon not running locally (${err.message}).`);
    console.log('[DB] Activating RESQ-GRID Zero-Config Persistent Document Engine (backend/src/data/resqgrid.db.json)');
    dbEngine.init();
  }
};

export const getCollection = (name) => {
  // If Mongoose is connected and has model, return mongoose model wrapper or fallback engine
  if (isMongooseConnected && mongoose.models[name]) {
    return mongoose.models[name];
  }
  return dbEngine.getCollection(name);
};

export const isMongoLive = () => isMongooseConnected;

export default { connectDB, getCollection, isMongoLive };
