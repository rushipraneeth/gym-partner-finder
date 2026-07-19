import express from "express";
import protect  from "../middleware/authMiddleware.js";
import {
  activateLookingToday,
  updateTodayWorkout,
  updateTodayWorkoutTime,
  getTodayMatches,
} from "../controllers/todayWorkoutController.js";

const router = express.Router();

router.post("/activate", protect, activateLookingToday);

router.put("/workout", protect, updateTodayWorkout);

router.put("/time", protect, updateTodayWorkoutTime);

router.get("/matches", protect, getTodayMatches);
export default router;