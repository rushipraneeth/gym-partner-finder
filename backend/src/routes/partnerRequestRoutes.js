import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  sendPartnerRequest,
  getReceivedRequests,
  getSentRequests,
  acceptPartnerRequest,
  rejectPartnerRequest,
  getConnectedPartners,
} from "../controllers/partnerRequestController.js";

const router = express.Router();


router.patch("/:id/accept", protect, acceptPartnerRequest);

router.post("/", protect, sendPartnerRequest);

router.get("/received", protect, getReceivedRequests);

router.get("/sent", protect, getSentRequests);
router.patch("/:id/reject", protect, rejectPartnerRequest);
router.get("/connections", protect, getConnectedPartners);

export default router;