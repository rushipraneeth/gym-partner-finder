import { calculateTimeOverlap, calculateDaySimilarity,calculateWorkoutSimilarity, calculateMatchScore } from "./src/utils/matchCalculator.js";

const user1 = {
    startTime: "18:00",
    endTime: "20:00",
    days: ["Monday", "Wednesday", "Friday"],
    workouts: ["Chest", "Back", "Legs"]
};

const user2 = {
    startTime: "19:00",
    endTime: "21:00",
    days: ["Monday", "Friday", "Saturday"],
    workouts: ["Chest", "Legs", "Shoulders"]
};

console.log(calculateMatchScore(user1, user2));