import express from "express";
import errorHandler from "./middleware/errorHandler.js";
import User from "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import partnerRequestRoutes from "./routes/partnerRequestRoutes.js";
import todayWorkoutRoutes from "./routes/todayWorkoutRoutes.js";
import blockRoutes from "./routes/blockRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cors from "cors";

const app = express();

// Enable CORS for all origins
app.use(cors());

// Allows Express to read JSON data from req.body
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// User profile routes
app.use("/api/users", userRoutes);

app.use("/api/workouts", workoutRoutes);

app.use("/api/matches", matchRoutes);

app.use("/api/partner-requests", partnerRequestRoutes);

app.use("/api/today", todayWorkoutRoutes);

app.use("/api/blocks", blockRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/conversations", conversationRoutes);

app.use("/api/messages", messageRoutes);

// Test route
app.get("/test", (req, res) => {
  res.json({
    message: "Gym Partner Finder backend is working",
  });
});

// 4.4 — Create a user
app.post("/test-user", async (req, res, next) => {
  try {
    const user = await User.create({
      username: "rushi",
      email: "rushi@gmail.com",
      password: "123456",
      gymId: "gym123",
      goal: "Muscle Gain",
      experienceLevel: "Intermediate",
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// 4.5 — Read all users
app.get("/test-user", async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// 4.6 — Update one user
app.patch("/test-user/:id", async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        goal: "Weight Loss",
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// 4.7 — Delete one user
app.delete("/test-user/:id", async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: deletedUser,
    });
  } catch (error) {
    next(error);
  }
});

// Error-handling middleware must always stay last
app.use(errorHandler);

export default app;