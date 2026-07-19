import User from "../models/User.js";
import WorkoutSchedule from "../models/WorkoutSchedule.js";

export const createUserProfile = async (req, res, next) => {
  try {
    const { gymId, goal, experienceLevel } = req.body;

    if (!gymId || !goal || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message: "Gym ID, goal and experience level are required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.gymId = gymId;
    user.goal = goal;
    user.experienceLevel = experienceLevel;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gymId: user.gymId,
        goal: user.goal,
        experienceLevel: user.experienceLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const selectGym = async (req, res, next) => {
  try {
    const { gymId } = req.body;

    if (!gymId) {
      return res.status(400).json({
        success: false,
        message: "Gym ID is required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.gymId = gymId;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Gym selected successfully",
      gymId: user.gymId,
    });
  } catch (error) {
    next(error);
  }
};
export const getMatchingProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const workouts = await WorkoutSchedule.find({
      userId: req.userId,
    });

    if (
      !user.gymId ||
      !user.goal ||
      !user.experienceLevel ||
      workouts.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Matching profile is incomplete",
      });
    }

    res.status(200).json({
      success: true,
      matchingProfile: {
        userId: user._id,
        username: user.username,
        gymId: user.gymId,
        goal: user.goal,
        experienceLevel: user.experienceLevel,
        workoutSchedule: workouts,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const updatePrivacySettings = async (req, res, next) => {
  try {
    const {
      profileVisibility,
      isMatchAvailable,
      showWorkoutTime,
      partnerRequestPermission,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (profileVisibility !== undefined) {
      user.profileVisibility = profileVisibility;
    }

    if (isMatchAvailable !== undefined) {
      user.isMatchAvailable = isMatchAvailable;
    }

    if (showWorkoutTime !== undefined) {
      user.showWorkoutTime = showWorkoutTime;
    }

    if (partnerRequestPermission !== undefined) {
      user.partnerRequestPermission = partnerRequestPermission;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Privacy settings updated successfully",
      privacySettings: {
        profileVisibility: user.profileVisibility,
        isMatchAvailable: user.isMatchAvailable,
        showWorkoutTime: user.showWorkoutTime,
        partnerRequestPermission: user.partnerRequestPermission,
      },
    });
  } catch (error) {
    next(error);
  }
};