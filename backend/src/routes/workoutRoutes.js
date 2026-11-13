import express from "express";
import {
  getWorkouts,
  addWorkout,
  updateWorkout,
  deleteWorkout,
} from "../controllers/workoutController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getWorkouts);
router.post("/", protect, addWorkout);
router.patch("/:id", protect, updateWorkout);
router.delete("/:id", protect, deleteWorkout);

export default router;
