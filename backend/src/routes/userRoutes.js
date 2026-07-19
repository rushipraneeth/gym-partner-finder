import express from "express";
import {
  createUserProfile,
  selectGym,
  getMatchingProfile,
  updatePrivacySettings,
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/profile", protect, createUserProfile);

router.patch("/gym", protect, selectGym);

router.get("/matching-profile", protect, getMatchingProfile);

router.patch("/privacy", protect, updatePrivacySettings);

export default router;