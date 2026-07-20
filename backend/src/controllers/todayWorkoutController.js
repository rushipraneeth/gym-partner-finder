import TodayWorkout from "../models/TodayWorkout.js";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import {
    calculateTimeOverlap,
    calculateWorkoutSimilarity,
} from "../utils/matchCalculator.js";

const getISTDateString = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

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

    // Get the current date string in IST (e.g. "2026-07-20")
    const todayStr = getISTDateString();

    // Check if already activated today in IST
    const existingStatus = await TodayWorkout.findOne({
      userId,
      localDateString: todayStr,
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
      date: new Date(),
      localDateString: todayStr,
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

    // Get today's IST string
    const todayStr = getISTDateString();

    // Find today's record
    const todayWorkout = await TodayWorkout.findOne({
      userId,
      localDateString: todayStr,
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

    // Get today's IST string
    const todayStr = getISTDateString();

    // Find today's record
    const todayWorkout = await TodayWorkout.findOne({
      userId,
      localDateString: todayStr,
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

    // Get today's IST string
    const todayStr = getISTDateString();

    // Find current user's active TodayWorkout
    const currentUserToday = await TodayWorkout.findOne({
      userId,
      localDateString: todayStr,
      isLookingToday: true,
    });

    if (!currentUserToday) {
      return res.status(404).json({
        success: false,
        message: "Please activate Looking Today first.",
      });
    }

    // Find all users who are already in a connection
    const allConnections = await Connection.find({});
    const connectedUserIds = [];
    allConnections.forEach(conn => {
      connectedUserIds.push(conn.user1.toString());
      connectedUserIds.push(conn.user2.toString());
    });

    // Escape regex characters in gymId just in case
    const escapedGymId = currentUserToday.gymId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    
    // Find all same-gym users (case insensitive) for today (IST) excluding connected users
    const todayMatches = await TodayWorkout.find({
      gymId: { $regex: new RegExp(`^${escapedGymId}$`, 'i') },
      localDateString: todayStr,
      isLookingToday: true,
      userId: { 
        $ne: userId,
        $nin: connectedUserIds
      },
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