import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getConversationMessages,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protect, sendMessage);

router.get("/:conversationId", protect, getConversationMessages);

export default router;