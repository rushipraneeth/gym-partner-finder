import express from "express";
import {
  createUserProfile,
  selectGym,
  getMatchingProfile,
  updatePrivacySettings,
  getNearbyGyms,
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/profile", protect, createUserProfile);

router.patch("/gym", protect, selectGym);

router.get("/matching-profile", protect, getMatchingProfile);

router.patch("/privacy", protect, updatePrivacySettings);

router.get("/nearby-gyms", protect, getNearbyGyms);

export default router;