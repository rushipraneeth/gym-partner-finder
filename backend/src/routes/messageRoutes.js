import express from "express";
import  protect  from "../middleware/authMiddleware.js";
import { getConversationMessages } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:conversationId", protect, getConversationMessages);

export default router;