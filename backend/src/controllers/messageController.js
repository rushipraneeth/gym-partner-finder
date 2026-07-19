import Message from "../models/Message.js";

export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversationId,
    })
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