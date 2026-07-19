import mongoose from "mongoose";

const workoutScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  day: {
    type: String,
    required: true,
  },

  startTime: {
    type: String,
    required: true,
  },

  endTime: {
    type: String,
    required: true,
  },

  muscleGroups: {
    type: [String],
    required: true,
  },
});

const WorkoutSchedule = mongoose.model(
  "WorkoutSchedule",
  workoutScheduleSchema
);

export default WorkoutSchedule;