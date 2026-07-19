import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address."
    ]
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  gymId: {
    type: String,
  },

  goal: {
    type: String,
  },

  experienceLevel: {
    type: String,
  },

  isAvailable: {
    type: Boolean,
    default: true,
  },

  // Privacy Settings
  profileVisibility: {
    type: String,
    enum: ["everyone", "sameGym", "connections"],
    default: "everyone",
  },

  isMatchAvailable: {
    type: Boolean,
    default: true,
  },

  showWorkoutTime: {
    type: Boolean,
    default: true,
  },

  partnerRequestPermission: {
    type: String,
    enum: ["everyone", "matchesOnly", "nobody"],
    default: "everyone",
  },
});

const User = mongoose.model("User", userSchema);

export default User;