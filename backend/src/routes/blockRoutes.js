import express from "express";
import  protect  from "../middleware/authMiddleware.js";
import { blockUser } from "../controllers/blockController.js";

const router = express.Router();

router.post("/", protect, blockUser);

export default router;