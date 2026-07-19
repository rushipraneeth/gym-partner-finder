import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.userId;
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and text are required.",
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    if (
      !conversation.participants.some(
        (participant) => participant.toString() === senderId.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation.",
      });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      text,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate("senderId", "username email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      totalMessages: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};