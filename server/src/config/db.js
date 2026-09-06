import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.log('MONGODB_URI not provided. Running in memory mode.');
    return;
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.warn('MongoDB connection failed:', error.message);
    console.log('Continuing in memory mode.');
  }
};
