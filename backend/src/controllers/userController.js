import User from "../models/User.js";
import WorkoutSchedule from "../models/WorkoutSchedule.js";
import https from "https";

export const createUserProfile = async (req, res, next) => {
  try {
    const { gymId, goal, experienceLevel } = req.body;

    if (!gymId || !goal || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message: "Gym ID, goal and experience level are required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.gymId = gymId.trim();
    user.goal = goal;
    user.experienceLevel = experienceLevel;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gymId: user.gymId,
        goal: user.goal,
        experienceLevel: user.experienceLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const selectGym = async (req, res, next) => {
  try {
    const { gymId } = req.body;

    if (!gymId) {
      return res.status(400).json({
        success: false,
        message: "Gym ID is required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.gymId = gymId.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Gym selected successfully",
      gymId: user.gymId,
    });
  } catch (error) {
    next(error);
  }
};
export const getMatchingProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const workouts = await WorkoutSchedule.find({
      userId: req.userId,
    });

    if (
      !user.gymId ||
      !user.goal ||
      !user.experienceLevel ||
      workouts.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Matching profile is incomplete",
      });
    }

    res.status(200).json({
      success: true,
      matchingProfile: {
        userId: user._id,
        username: user.username,
        gymId: user.gymId,
        goal: user.goal,
        experienceLevel: user.experienceLevel,
        workoutSchedule: workouts,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const updatePrivacySettings = async (req, res, next) => {
  try {
    const {
      profileVisibility,
      isMatchAvailable,
      showWorkoutTime,
      partnerRequestPermission,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (profileVisibility !== undefined) {
      user.profileVisibility = profileVisibility;
    }

    if (isMatchAvailable !== undefined) {
      user.isMatchAvailable = isMatchAvailable;
    }

    if (showWorkoutTime !== undefined) {
      user.showWorkoutTime = showWorkoutTime;
    }

    if (partnerRequestPermission !== undefined) {
      user.partnerRequestPermission = partnerRequestPermission;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Privacy settings updated successfully",
      privacySettings: {
        profileVisibility: user.profileVisibility,
        isMatchAvailable: user.isMatchAvailable,
        showWorkoutTime: user.showWorkoutTime,
        partnerRequestPermission: user.partnerRequestPermission,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyGyms = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=gym+fitness&lat=${lat}&lon=${lon}&limit=20`;

    const options = {
      headers: {
        'User-Agent': 'GymPartnerFinder/1.0 (Contact: admin@example.com)'
      }
    };

    https.get(url, options, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        if (apiRes.statusCode !== 200) {
          console.error(`Nominatim API responded with status ${apiRes.statusCode}`);
          return next(new Error(`Nominatim API responded with status ${apiRes.statusCode}`));
        }
        
        try {
          const parsedData = JSON.parse(data);
          
          // Nominatim returns an array of places
          const gyms = parsedData
            .filter(el => el.name || el.display_name)
            .map(el => ({
              id: `nom-${el.place_id}`,
              name: el.name && el.name.toLowerCase() !== 'gym' ? el.name : (el.display_name.split(',')[0] || 'Local Gym')
            }));
            
          // Deduplicate by name
          const uniqueGyms = Array.from(new Map(gyms.map(item => [item.name, item])).values());
            
          res.status(200).json({
            success: true,
            gyms: uniqueGyms
          });
        } catch (parseError) {
          console.error("Error parsing Nominatim API response", parseError);
          next(parseError);
        }
      });
    }).on('error', (err) => {
      console.error("HTTPS request error to Nominatim:", err);
      next(err);
    });
  } catch (error) {
    console.error("Error fetching gyms from Overpass:", error);
    next(error);
  }
};