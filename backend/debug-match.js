import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import TodayWorkout from './src/models/TodayWorkout.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const users = await User.find({});
    console.log("USERS:");
    users.forEach(u => console.log(`- ${u.username} (${u._id}) | gymId: ${u.gymId}`));

    const todays = await TodayWorkout.find({});
    console.log("\nTODAY WORKOUTS:");
    todays.forEach(t => console.log(`- User: ${t.userId} | localDate: ${t.localDateString} | gymId: ${t.gymId} | times: ${t.startTime}-${t.endTime}`));
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
