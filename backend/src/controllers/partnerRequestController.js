import PartnerRequest from "../models/PartnerRequest.js";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import WorkoutSchedule from "../models/WorkoutSchedule.js";
import { calculateMatchScore } from "../utils/matchCalculator.js";
import Block from "../models/Block.js";

export const sendPartnerRequest = async (req, res, next) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.body;

    // Prevent sending request to yourself
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a partner request to yourself.",
      });
    }

    // Prevent partner requests between blocked users
    const blockExists = await Block.findOne({
      $or: [
        { blockerId: senderId, blockedId: receiverId },
        { blockerId: receiverId, blockedId: senderId },
      ],
    });

    if (blockExists) {
      return res.status(403).json({
        success: false,
        message: "Partner requests are not allowed between blocked users.",
      });
    }

    // Check receiver exists
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found.",
      });
    }

    // Check receiver's partner request permission
    if (receiver.partnerRequestPermission === "nobody") {
      return res.status(403).json({
        success: false,
        message: "This user is not accepting partner requests.",
      });
    }

    // If receiver accepts requests only from matches
    if (receiver.partnerRequestPermission === "matchesOnly") {
      const senderSchedule = await WorkoutSchedule.find({
        userId: senderId,
      });

      const receiverSchedule = await WorkoutSchedule.find({
        userId: receiverId,
      });

      const matchData = calculateMatchScore(
        senderSchedule,
        receiverSchedule
      );

      if (matchData.matchScore < 0.60) {
        return res.status(403).json({
          success: false,
          message: "This user only accepts requests from matched partners.",
        });
      }
    }

    // Check if the sender already has ANY partner
    const senderConnection = await Connection.findOne({
      $or: [{ user1: senderId }, { user2: senderId }]
    });

    if (senderConnection) {
      return res.status(403).json({
        success: false,
        message: "You already have a gym partner!",
      });
    }

    // Check if the receiver already has ANY partner
    const receiverConnection = await Connection.findOne({
      $or: [{ user1: receiverId }, { user2: receiverId }]
    });

    if (receiverConnection) {
      return res.status(403).json({
        success: false,
        message: "This user already has a gym partner.",
      });
    }

    // Prevent duplicate requests
    const existingRequest = await PartnerRequest.findOne({
      $or: [
        {
          senderId,
          receiverId,
        },
        {
          senderId: receiverId,
          receiverId: senderId,
        },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "A partner request already exists between these users.",
      });
    }

    // Create partner request
    const partnerRequest = await PartnerRequest.create({
      senderId,
      receiverId,
    });

    res.status(201).json({
      success: true,
      message: "Partner request sent successfully.",
      partnerRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getReceivedRequests = async (req, res, next) => {
  try {
    const receivedRequests = await PartnerRequest.find({
      receiverId: req.userId,
    }).populate("senderId", "username email");

    res.status(200).json({
      success: true,
      receivedRequests,
    });
  } catch (error) {
    next(error);
  }
};

export const getSentRequests = async (req, res, next) => {
  try {
    
    const sentRequests = await PartnerRequest.find({
      senderId: req.userId,
    }).populate("receiverId", "username email");


    res.status(200).json({
      success: true,
      sentRequests,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptPartnerRequest = async (req, res, next) => {
  try {
    const partnerRequest = await PartnerRequest.findById(req.params.id);

    // Request not found
    if (!partnerRequest) {
      return res.status(404).json({
        success: false,
        message: "Partner request not found.",
      });
    }

    // Authorization
    if (partnerRequest.receiverId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this request.",
      });
    }

    // Already processed
    if (partnerRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Partner request has already been ${partnerRequest.status}.`,
      });
    }

    // Prevent duplicate connections
    const existingConnection = await Connection.findOne({
      $or: [
        {
          user1: partnerRequest.senderId,
          user2: partnerRequest.receiverId,
        },
        {
          user1: partnerRequest.receiverId,
          user2: partnerRequest.senderId,
        },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: "Users are already connected.",
      });
    }

    // Accept request
    partnerRequest.status = "accepted";
    await partnerRequest.save();

    // Create connection
    await Connection.create({
      user1: partnerRequest.senderId,
      user2: partnerRequest.receiverId,
    });

    res.status(200).json({
      success: true,
      message: "Partner request accepted successfully.",
      partnerRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectPartnerRequest = async (req, res, next) => {
  try {
    const partnerRequest = await PartnerRequest.findById(req.params.id);

    // Request not found
    if (!partnerRequest) {
      return res.status(404).json({
        success: false,
        message: "Partner request not found.",
      });
    }

    // Authorization
    if (partnerRequest.receiverId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this request.",
      });
    }

    // Already processed
    if (partnerRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Partner request has already been ${partnerRequest.status}.`,
      });
    }

    // Reject request
    partnerRequest.status = "rejected";
    await partnerRequest.save();

    res.status(200).json({
      success: true,
      message: "Partner request rejected successfully.",
      partnerRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getConnectedPartners = async (req, res, next) => {
  try {
    const connections = await Connection.find({
      $or: [{ user1: req.userId }, { user2: req.userId }],
    })
      .populate("user1", "username email")
      .populate("user2", "username email");

    res.status(200).json({
      success: true,
      connections,
    });
  } catch (error) {
    next(error);
  }
};