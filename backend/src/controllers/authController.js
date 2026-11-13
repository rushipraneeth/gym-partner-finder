import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register user
const registeredUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // 5.3 — Validate registration data
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // 5.4 — Check duplicate email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        // 5.5 — Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to MongoDB
        const user = await User.create({
            username: name,
            email,
            password: hashedPassword
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                gymId: user.gymId,
                goal: user.goal,
                experienceLevel: user.experienceLevel,
                isAvailable: user.isAvailable,
                profileVisibility: user.profileVisibility,
                isMatchAvailable: user.isMatchAvailable,
                showWorkoutTime: user.showWorkoutTime,
                partnerRequestPermission: user.partnerRequestPermission
            }
        });

    } catch (error) {
        next(error);
    }
};

// Login user
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check missing fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const emailTrimmed = email.trim().toLowerCase();

        // Find user by email (case-insensitive)
        let user = await User.findOne({ 
            email: { $regex: new RegExp(`^${emailTrimmed}$`, 'i') } 
        });

        // Support demo/recruiter credentials seamlessly across all environments
        const isDemoRushi = (
            emailTrimmed === 's.rushipraneeth@gmail.com' && 
            password === 'Rushi@123'
        );
        const isDemoGeneric = (
            emailTrimmed === 'demo@gympartner.com' && 
            password === 'password123'
        );
        const isDemoAccount = isDemoRushi || isDemoGeneric;

        // Auto-provision demo user if deploying to new or unseeded cloud database
        if (!user && isDemoAccount) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                username: isDemoRushi ? 'Rushi Praneeth' : 'Demo Athlete',
                email: emailTrimmed,
                password: hashedPassword,
                gymLocation: 'Equinox Sports Club',
                goal: 'Muscle Gain',
                experienceLevel: 'Intermediate',
                isAvailable: true,
                lookingToday: false,
                profileVisibility: 'everyone',
                isMatchAvailable: true,
                showWorkoutTime: true,
                partnerRequestPermission: 'everyone'
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare entered password with stored hash
        let isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        // If authenticating with valid demo credentials, automatically sync hash
        if (!isPasswordCorrect && isDemoAccount) {
            user.password = await bcrypt.hash(password, 10);
            await user.save();
            isPasswordCorrect = true;
        }

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        // Login successful
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                gymId: user.gymId,
                goal: user.goal,
                experienceLevel: user.experienceLevel,
                isAvailable: user.isAvailable,
                profileVisibility: user.profileVisibility,
                isMatchAvailable: user.isMatchAvailable,
                showWorkoutTime: user.showWorkoutTime,
                partnerRequestPermission: user.partnerRequestPermission
            }
        });

    } catch (error) {
        next(error);
    }
};

const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                gymId: user.gymId,
                goal: user.goal,
                experienceLevel: user.experienceLevel,
                isAvailable: user.isAvailable,
                profileVisibility: user.profileVisibility,
                isMatchAvailable: user.isMatchAvailable,
                showWorkoutTime: user.showWorkoutTime,
                partnerRequestPermission: user.partnerRequestPermission
            }
        });
    } catch (error) {
        next(error);
    }
};
export { registeredUser, loginUser, getCurrentUser };