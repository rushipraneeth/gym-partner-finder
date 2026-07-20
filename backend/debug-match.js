import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import WorkoutSchedule from './src/models/WorkoutSchedule.js';
import { calculateMatchScore } from './src/utils/matchCalculator.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const users = await User.find({});
  console.log("Users:", users.map(u => ({ username: u.username, gymId: u.gymId, isAvailable: u.isAvailable })));
  
  const schedules = await WorkoutSchedule.find({});
  console.log("Schedules:", schedules.map(s => ({ userId: s.userId, day: s.day, startTime: s.startTime, endTime: s.endTime, muscleGroups: s.muscleGroups })));
  
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const u1 = users[i];
      const u2 = users[j];
      const s1 = schedules.filter(s => s.userId.toString() === u1._id.toString());
      const s2 = schedules.filter(s => s.userId.toString() === u2._id.toString());
      
      if (s1.length > 0 && s2.length > 0) {
         const score = calculateMatchScore(s1, s2);
         console.log(`Score between ${u1.username} (Gym: ${u1.gymId}) and ${u2.username} (Gym: ${u2.gymId}): ${score.matchScore}`);
      }
    }
  }
  
  process.exit(0);
}

run();
