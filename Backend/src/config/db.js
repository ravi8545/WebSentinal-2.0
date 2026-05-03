const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing in environment');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('[MongoDB] connected');

  // Drop any legacy indexes from previous schemas (e.g. username_1 on users)
  try {
    const User = require('../models/User');
    await User.syncIndexes();
  } catch (err) {
    console.warn('[MongoDB] syncIndexes warning:', err.message);
  }
}

module.exports = connectDB;
