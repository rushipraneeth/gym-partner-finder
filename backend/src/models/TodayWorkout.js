import mongoose from "mongoose";

const todayWorkoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    gymId: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    isLookingToday: {
      type: Boolean,
      default: false,
    },

    startTime: {
      type: String,
    },

    endTime: {
      type: String,
    },

    muscleGroups: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TodayWorkout", todayWorkoutSchema);