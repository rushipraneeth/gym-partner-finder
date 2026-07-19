import Conversation from "../models/Conversation.js";
import Connection from "../models/Connection.js";

export const createOrGetConversation = async (req, res, next) => {
  try {
    const currentUserId = req.userId;
    const { otherUserId } = req.body;
    const connection = await Connection.findOne({
        $or: [
            {
            user1: currentUserId,
            user2: otherUserId,
            },
            {
            user1: otherUserId,
            user2: currentUserId,
            },
        ],
        });

        if (!connection) {
        return res.status(403).json({
            success: false,
            message: "You can only chat with connected partners.",
        });
        }

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Other user ID is required.",
      });
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [currentUserId, otherUserId],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, otherUserId],
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });

  } catch (error) {
    next(error);
  }
};