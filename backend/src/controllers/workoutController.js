import WorkoutSchedule from "../models/WorkoutSchedule.js";

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