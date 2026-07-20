import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import TodayWorkout from './src/models/TodayWorkout.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const users = await User.find({});
  const todays = await TodayWorkout.find({});
  
  console.log("Users:", users.map(u => ({ id: u._id, username: u.username, gymId: u.gymId })));
  console.log("TodayWorkouts:", todays.map(t => ({ userId: t.userId, gymId: t.gymId, date: t.date, startTime: t.startTime, endTime: t.endTime, muscleGroups: t.muscleGroups })));
  
  process.exit(0);
}

run();
