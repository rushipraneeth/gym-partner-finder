import express from "express";
import {
    getEligibleCandidates,
    getMatchDetails,
} from "../controllers/matchController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getEligibleCandidates);

router.get("/:candidateId", protect, getMatchDetails);
export default router;