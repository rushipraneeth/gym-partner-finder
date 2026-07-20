import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import TodayWorkout from './src/models/TodayWorkout.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    // Find mourya
    const user = await User.findOne({ username: 'mourya' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentUserToday = await TodayWorkout.findOne({
      userId: user._id,
      date: today,
      isLookingToday: true,
    });
    
    console.log("Current user today:", currentUserToday);
    
    const escapedGymId = currentUserToday.gymId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    
    const todayMatches = await TodayWorkout.find({
      gymId: { $regex: new RegExp(`^${escapedGymId}$`, 'i') },
      date: today,
      isLookingToday: true,
      userId: { $ne: user._id },
    }).populate("userId", "username email gymId showWorkoutTime");
    
    console.log("Found matches:", todayMatches.length);
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    process.exit(0);
  }
}

run();
