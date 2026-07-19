import express from "express";
import { addWorkout } from "../controllers/workoutController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addWorkout);

export default router;