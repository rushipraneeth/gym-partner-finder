import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import TodayWorkout from './src/models/TodayWorkout.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    // Find ookine
    const user = await User.findOne({ username: 'ookine' });
    const getISTDateString = () => {
      return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    };
    
    const todayStr = getISTDateString();
    
    const currentUserToday = await TodayWorkout.findOne({
      userId: user._id,
      localDateString: todayStr,
      isLookingToday: true,
    });
    
    console.log("currentUserToday:", currentUserToday);
    
    if (!currentUserToday) {
       console.log("No current user today!");
       return;
    }
    
    const escapedGymId = currentUserToday.gymId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    
    const todayMatches = await TodayWorkout.find({
      gymId: { $regex: new RegExp(`^${escapedGymId}$`, 'i') },
      localDateString: todayStr,
      isLookingToday: true,
      userId: { $ne: user._id },
    }).populate("userId", "username email gymId showWorkoutTime");
    
    console.log("Found raw todayMatches:", todayMatches.length);
    
    const eligibleMatches = [];
    
    // simulate matching logic...
    for (const candidate of todayMatches) {
       console.log(`Candidate: ${candidate.userId.username} | times: ${candidate.startTime}-${candidate.endTime}`);
    }
    
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    process.exit(0);
  }
}

run();
