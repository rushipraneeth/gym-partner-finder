import User from "../models/User.js";
import WorkoutSchedule from "../models/WorkoutSchedule.js";
import Block from "../models/Block.js";
import Connection from "../models/Connection.js";
import { calculateMatchScore } from "../utils/matchCalculator.js";
import {
    generateTimeReason,
    generateCommonDaysReason,
    generateWorkoutReason,
} from "../utils/matchReasons.js";

export const getEligibleCandidates = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.userId).select("gymId");
    const currentUserSchedule = await WorkoutSchedule.find({
      userId: req.userId,
    });

    const blockedUsers = await Block.find({
      blockerId: req.userId,
    });

    const blockedByUsers = await Block.find({
      blockedId: req.userId,
    });

    const blockedUserIds = blockedUsers.map(
      (block) => block.blockedId
    );

    const blockedByUserIds = blockedByUsers.map(
      (block) => block.blockerId
    );

    // Find all users who are already in a connection
    const allConnections = await Connection.find({});
    const connectedUserIds = [];
    allConnections.forEach(conn => {
      connectedUserIds.push(conn.user1.toString());
      connectedUserIds.push(conn.user2.toString());
    });

    const escapedGymId = currentUser.gymId ? currentUser.gymId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : '';

    const candidates = await User.find({
      gymId: escapedGymId ? { $regex: new RegExp(`^${escapedGymId}$`, 'i') } : currentUser.gymId,
      _id: {
        $ne: req.userId,
        $nin: [...blockedUserIds, ...blockedByUserIds, ...connectedUserIds],
      },
      isAvailable: true,
      isMatchAvailable: true,
    });


    const candidatesWithSchedules = await Promise.all(
      candidates.map(async (candidate) => {
        const schedule = await WorkoutSchedule.find({
          userId: candidate._id,
        });

        return {
          candidate,
          schedule,
        };
      })
    );

    const validCandidates = candidatesWithSchedules.filter((item) => {
      return item.schedule.some(
        (workout) =>
          workout.day &&
          workout.startTime &&
          workout.endTime &&
          workout.muscleGroups.length > 0
      );
    });


    const matchedCandidates = [];

    for (const item of validCandidates) {
      const matchData = calculateMatchScore(
        currentUserSchedule,
        item.schedule
      );

      const scheduleToReturn = item.candidate.showWorkoutTime
          ? item.schedule
          : item.schedule.map((workout) => ({
              day: workout.day,
              muscleGroups: workout.muscleGroups,
          }));

      if (matchData.matchScore >= 0.60) {
        const candidateToReturn = item.candidate.toObject();

        delete candidateToReturn.showWorkoutTime;
        delete candidateToReturn.isMatchAvailable;
        delete candidateToReturn.partnerRequestPermission;

        matchedCandidates.push({
            candidate: candidateToReturn,
            schedule: scheduleToReturn,

            matchScore: matchData.matchScore,

            matchPercentage: `${(matchData.matchScore * 100).toFixed(2)}%`,

            scoreBreakdown: {
                timeScore: `${(matchData.timeScore * 100).toFixed(2)}%`,
                dayScore: `${(matchData.dayScore * 100).toFixed(2)}%`,
                workoutScore: `${(matchData.workoutScore * 100).toFixed(2)}%`,
            },

            matchReasons: [
                generateTimeReason(matchData.overlapMinutes),
                generateCommonDaysReason(matchData.commonDays),
                generateWorkoutReason(matchData.commonWorkoutGroups),
            ],
        });
      }
    }

    matchedCandidates.sort(
      (a, b) => b.matchScore - a.matchScore
    );
    matchedCandidates.forEach((candidate) => {
    delete candidate.matchScore;
    });

    res.status(200).json({
      success: true,
      eligibleCandidates: matchedCandidates,
    });

  } catch (error) {
    next(error);
  }
};

export const getMatchDetails = async (req, res, next) => {
    try {

        const currentUser = await User.findById(req.userId);

        const candidate = await User.findById(req.params.candidateId);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found",
            });
        }

        const currentUserSchedule = await WorkoutSchedule.find({
            userId: req.userId,
        });

        const candidateSchedule = await WorkoutSchedule.find({
            userId: req.params.candidateId,
        });

        const matchData = calculateMatchScore(
            currentUserSchedule,
            candidateSchedule
        );
        const scheduleToReturn = candidate.showWorkoutTime
          ? candidateSchedule
          : candidateSchedule.map((workout) => ({
              day: workout.day,
              muscleGroups: workout.muscleGroups,
          }));
          const candidateToReturn = candidate.toObject();

          delete candidateToReturn.showWorkoutTime;
          delete candidateToReturn.isMatchAvailable;
          delete candidateToReturn.partnerRequestPermission;

        res.status(200).json({
            success: true,
            matchDetails: {
                candidate: candidateToReturn,
                schedule: scheduleToReturn,

                matchPercentage: `${(matchData.matchScore * 100).toFixed(2)}%`,

                scoreBreakdown: {
                  timeScore: `${(matchData.timeScore * 100).toFixed(2)}%`,
                  dayScore: `${(matchData.dayScore * 100).toFixed(2)}%`,
                  workoutScore: `${(matchData.workoutScore * 100).toFixed(2)}%`,
              },

                matchReasons: [
                    generateTimeReason(matchData.overlapMinutes),
                    generateCommonDaysReason(matchData.commonDays),
                    generateWorkoutReason(matchData.commonWorkoutGroups),
                ],
            },
        });

    } catch (error) {
        next(error);
    }
};