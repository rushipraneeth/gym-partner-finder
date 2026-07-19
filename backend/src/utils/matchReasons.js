export const generateTimeReason = (overlapMinutes) => {
  if (overlapMinutes <= 0) {
    return "Your workout times do not overlap.";
  }

  return `Your workout times overlap by ${overlapMinutes} minutes.`;
};


export const generateCommonDaysReason = (commonDays) => {
    if (commonDays.length === 0) {
        return "You do not have any common workout days.";
    }

    return `You both train on ${commonDays.join(", ")}.`;
};

export const generateWorkoutReason = (commonWorkoutGroups) => {

    if (commonWorkoutGroups.length === 0) {
        return "You do not train the same muscle groups.";
    }

    return `You both train ${commonWorkoutGroups.join(", ")}.`;

};