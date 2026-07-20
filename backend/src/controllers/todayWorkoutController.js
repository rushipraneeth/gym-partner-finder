import TodayWorkout from "../models/TodayWorkout.js";
import User from "../models/User.js";
import {
    calculateTimeOverlap,
    calculateWorkoutSimilarity,
} from "../utils/matchCalculator.js";

export const activateLookingToday = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Find the logged-in user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has selected a gym
    if (!user.gymId) {
      return res.status(400).json({
        success: false,
        message: "Please select a gym first.",
      });
    }

    // Time window for "Today" (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check if already activated in the last 24 hours
    const existingStatus = await TodayWorkout.findOne({
      userId,
      createdAt: { $gte: oneDayAgo },
    });

    if (existingStatus) {
      return res.status(400).json({
        success: false,
        message: "You have already activated Looking Today.",
      });
    }

    // Create today's record with default times so math doesn't fail
    const todayWorkout = await TodayWorkout.create({
      userId,
      gymId: user.gymId,
      date: new Date(), // Just store current time
      isLookingToday: true,
      startTime: "17:00",
      endTime: "18:30",
      muscleGroups: []
    });

    res.status(201).json({
      success: true,
      message: "Looking Today activated successfully.",
      todayWorkout,
    });
  } catch (error) {
    next(error);
  }
};


export const updateTodayWorkout = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { muscleGroups } = req.body;

    // Time window for "Today" (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find today's record
    const todayWorkout = await TodayWorkout.findOne({
      userId,
      createdAt: { $gte: oneDayAgo },
    });

    if (!todayWorkout) {
      return res.status(404).json({
        success: false,
        message: "Please activate Looking Today first.",
      });
    }

    // Update today's workout
    todayWorkout.muscleGroups = muscleGroups;

    await todayWorkout.save();

    res.status(200).json({
      success: true,
      message: "Today's workout updated successfully.",
      todayWorkout,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTodayWorkoutTime = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { startTime, endTime } = req.body;

    // Time window for "Today" (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find today's record
    const todayWorkout = await TodayWorkout.findOne({
      userId,
      createdAt: { $gte: oneDayAgo },
    });

    if (!todayWorkout) {
      return res.status(404).json({
        success: false,
        message: "Please activate Looking Today first.",
      });
    }

    // Update today's workout time
    todayWorkout.startTime = startTime;
    todayWorkout.endTime = endTime;

    await todayWorkout.save();

    res.status(200).json({
      success: true,
      message: "Today's workout time updated successfully.",
      todayWorkout,
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayMatches = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Time window for "Today" (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find current user's active TodayWorkout (within last 24h)
    const currentUserToday = await TodayWorkout.findOne({
      userId,
      createdAt: { $gte: oneDayAgo },
      isLookingToday: true,
    });

    if (!currentUserToday) {
      return res.status(404).json({
        success: false,
        message: "Please activate Looking Today first.",
      });
    }

    // Escape regex characters in gymId just in case
    const escapedGymId = currentUserToday.gymId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    
    // Find all same-gym users (case insensitive) within last 24h
    const todayMatches = await TodayWorkout.find({
      gymId: { $regex: new RegExp(`^${escapedGymId}$`, 'i') },
      createdAt: { $gte: oneDayAgo },
      isLookingToday: true,
      userId: { $ne: userId },
    }).populate(
      "userId",
      "username email gymId showWorkoutTime"
    );

    const eligibleMatches = [];

    for (const candidate of todayMatches) {
      const { overlapMinutes } = calculateTimeOverlap(
            currentUserToday,
            candidate
        );

        const {
            workoutScore,
            commonWorkouts,
            commonWorkoutsCount,
        } = calculateWorkoutSimilarity(
            currentUserToday.muscleGroups,
            candidate.muscleGroups
        );

        if (overlapMinutes >= 30) {

          const candidateToReturn = candidate.toObject();

          if (!candidate.userId.showWorkoutTime) {
            delete candidateToReturn.startTime;
            delete candidateToReturn.endTime;
          }
          delete candidateToReturn.userId.showWorkoutTime;

          eligibleMatches.push({
            candidate: candidateToReturn,
            overlapMinutes,
            workoutScore,
            commonWorkouts,
            commonWorkoutsCount,
          });
        }
    }
    eligibleMatches.sort((a, b) => {
        if (b.overlapMinutes !== a.overlapMinutes) {
            return b.overlapMinutes - a.overlapMinutes;
        }

        return b.workoutScore - a.workoutScore;
    });

    res.status(200).json({
      success: true,
      totalMatches: eligibleMatches.length,
      todayMatches: eligibleMatches,
    });
  } catch (error) {
    next(error);
  }
};