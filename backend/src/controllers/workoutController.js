import WorkoutSchedule from "../models/WorkoutSchedule.js";

export const getWorkouts = async (req, res, next) => {
  try {
    const workouts = await WorkoutSchedule.find({ userId: req.userId });
    res.status(200).json({
      success: true,
      workouts,
    });
  } catch (error) {
    next(error);
  }
};

export const addWorkout = async (req, res, next) => {
  try {
    const { day, startTime, endTime, muscleGroups } = req.body;

    if (
      !day ||
      !startTime ||
      !endTime ||
      !muscleGroups ||
      muscleGroups.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Day, start time, end time, and muscle groups are required",
      });
    }

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: "Invalid day",
      });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Time must be in HH:MM format",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }
    const existingWorkout = await WorkoutSchedule.findOne({
      userId: req.userId,
      day: day,
    });

    if (existingWorkout) {
      return res.status(400).json({
        success: false,
        message: `Workout for ${day} already exists`,
      });
    }

    const workout = await WorkoutSchedule.create({
      userId: req.userId,
      day,
      startTime,
      endTime,
      muscleGroups,
    });

    res.status(201).json({
      success: true,
      message: "Workout added successfully",
      workout,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { day, startTime, endTime, muscleGroups } = req.body;

    const workout = await WorkoutSchedule.findOne({ _id: id, userId: req.userId });
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    if (day) {
      const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      if (!validDays.includes(day)) {
        return res.status(400).json({
          success: false,
          message: "Invalid day",
        });
      }
      const existing = await WorkoutSchedule.findOne({
        userId: req.userId,
        day,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Workout for ${day} already exists`,
        });
      }
      workout.day = day;
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const newStart = startTime || workout.startTime;
    const newEnd = endTime || workout.endTime;

    if (!timeRegex.test(newStart) || !timeRegex.test(newEnd)) {
      return res.status(400).json({
        success: false,
        message: "Time must be in HH:MM format",
      });
    }

    if (newStart >= newEnd) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    workout.startTime = newStart;
    workout.endTime = newEnd;

    if (muscleGroups && Array.isArray(muscleGroups) && muscleGroups.length > 0) {
      workout.muscleGroups = muscleGroups;
    }

    await workout.save();

    res.status(200).json({
      success: true,
      message: "Workout updated successfully",
      workout,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workout = await WorkoutSchedule.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Workout deleted successfully",
      workoutId: id,
    });
  } catch (error) {
    next(error);
  }
};
