import Report from "../models/Report.js";

export const reportUser = async (req, res, next) => {
  try {
    const reporterId = req.userId;

    const { reportedUserId, reason, description } = req.body;

    // Prevent reporting yourself
    if (reporterId.toString() === reportedUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report yourself.",
      });
    }
        // Prevent duplicate reports
    const existingReport = await Report.findOne({
      reporterId,
      reportedUserId,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this user.",
      });
    }

    // Create report
    const report = await Report.create({
      reporterId,
      reportedUserId,
      reason,
      description,
    });

    res.status(201).json({
      success: true,
      message: "User reported successfully.",
      report,
    });

  } catch (error) {
    next(error);
  }
};