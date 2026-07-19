import Block from "../models/Block.js";

export const blockUser = async (req, res, next) => {
  try {
    const blockerId = req.userId;
    const { blockedId } = req.body;

    // Prevent blocking yourself
    if (blockerId.toString() === blockedId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself.",
      });
    }

    // Prevent duplicate blocks
    const existingBlock = await Block.findOne({
      blockerId,
      blockedId,
    });

    if (existingBlock) {
      return res.status(400).json({
        success: false,
        message: "User is already blocked.",
      });
    }

    // Create block
    const block = await Block.create({
      blockerId,
      blockedId,
    });

    res.status(201).json({
      success: true,
      message: "User blocked successfully.",
      block,
    });
  } catch (error) {
    next(error);
  }
};