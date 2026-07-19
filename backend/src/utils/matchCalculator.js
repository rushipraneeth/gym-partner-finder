export const calculateTimeOverlap = (user1, user2) => {
    const start1 = new Date(`1970-01-01T${user1.startTime}`);
    const start2 = new Date(`1970-01-01T${user2.startTime}`);

    const end1 = new Date(`1970-01-01T${user1.endTime}`);
    const end2 = new Date(`1970-01-01T${user2.endTime}`);

    const overlapStart = new Date(Math.max(start1, start2));
    const overlapEnd = new Date(Math.min(end1, end2));

    if (overlapEnd <= overlapStart) {
        return {
            overlapMinutes: 0,
            timeScore: 0,
        };
    }

    const overlapMilliSeconds = overlapEnd - overlapStart;
    const overlapMinutes = overlapMilliSeconds / (1000 * 60);

    const workoutDuration1 = (end1 - start1) / (1000 * 60);
    const workoutDuration2 = (end2 - start2) / (1000 * 60);

    const workoutDurationMinutes = Math.min(
        workoutDuration1,
        workoutDuration2
    );
    if (workoutDurationMinutes === 0) {
        return {
            overlapMinutes: 0,
            timeScore: 0,
        };
    }

    const timeScore = overlapMinutes / workoutDurationMinutes;

    return {
        overlapMinutes,
        timeScore,
    };
};

export const calculateDaySimilarity = (days1, days2) => {
    const days2Set = new Set(days2);

    const commonDays = days1.filter(day => days2Set.has(day));

    const commonDaysCount = commonDays.length;

    const uniqueDays = new Set([...days1,...days2]);
    
    const uniqueDaysCount = uniqueDays.size;

    const dayScore = commonDaysCount / uniqueDaysCount;

    return dayScore;
};


export const calculateWorkoutSimilarity = (workouts1, workouts2) => {
    const workouts2Set = new Set(workouts2);

    const commonWorkouts = workouts1.filter(workout =>
        workouts2Set.has(workout)
    );

    const commonWorkoutsCount = commonWorkouts.length;

    const uniqueWorkouts = new Set([...workouts1, ...workouts2]);
    const uniqueWorkoutsCount = uniqueWorkouts.size;

    const workoutScore =
        uniqueWorkoutsCount === 0
            ? 0
            : commonWorkoutsCount / uniqueWorkoutsCount;

    return {
        workoutScore,
        commonWorkouts,
        commonWorkoutsCount,
    };
};

export const calculateMatchScore = (user1Schedules, user2Schedules) => {

    const user2ScheduleMap = new Map();

    for (const schedule of user2Schedules) {
        user2ScheduleMap.set(schedule.day, schedule);
    }

    let totalTimeScore = 0;
    let totalWorkoutScore = 0;
    let totalOverlapMinutes = 0;
    const commonWorkoutGroups = new Set();
    let commonDaysCount = 0;
    const commonDays = [];

    for (const schedule1 of user1Schedules) {

    const schedule2 = user2ScheduleMap.get(schedule1.day);

    if (schedule2 === undefined) {
        continue;
    }

    const { overlapMinutes, timeScore } = calculateTimeOverlap(
        schedule1,
        schedule2
    );

    const workoutResult = calculateWorkoutSimilarity(
        schedule1.muscleGroups,
        schedule2.muscleGroups
    );

    const workoutScore = workoutResult.workoutScore;
    const commonGroups = workoutResult.commonWorkouts;

    commonGroups.forEach((group) => commonWorkoutGroups.add(group));

    totalTimeScore += timeScore;
    totalOverlapMinutes += overlapMinutes;
    totalWorkoutScore += workoutScore;
    commonDays.push(schedule1.day);
    commonDaysCount++;

    }
    if (commonDaysCount === 0) {
    return 0;
    }
    const user1Days = user1Schedules.map(
        schedule => schedule.day
    );

    const user2Days = user2Schedules.map(
        schedule => schedule.day
    );
    const dayScore = calculateDaySimilarity(
        user1Days,
        user2Days
    );
    const averageTimeScore =
        totalTimeScore / commonDaysCount;

    const averageWorkoutScore =
        totalWorkoutScore / commonDaysCount;
    const matchScore =
        (averageTimeScore * 0.40) +
        (dayScore * 0.30) +
        (averageWorkoutScore * 0.30);

    return {
        matchScore: Number(matchScore.toFixed(2)),
        timeScore: Number(averageTimeScore.toFixed(2)),
        dayScore: Number(dayScore.toFixed(2)),
        workoutScore: Number(averageWorkoutScore.toFixed(2)),
        overlapMinutes: totalOverlapMinutes,
        commonDays,
        commonWorkoutGroups: [...commonWorkoutGroups],
    };
};