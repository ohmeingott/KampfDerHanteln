import type { Session, PersonStats } from '../types';
import { STREAK_MAX_GAP_DAYS, POINTS_PER_SESSION, STREAK_BONUS } from '../types';

export function calculatePersonStats(
  personId: string,
  displayName: string,
  sessions: Session[]
): PersonStats {
  const participated = sessions
    .filter((s) => s.completed && s.participants.includes(personId))
    .sort((a, b) => a.date - b.date);

  const totalSessions = participated.length;

  if (totalSessions === 0) {
    return {
      personId,
      displayName,
      totalSessions: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPoints: 0,
      lastSessionDate: null,
    };
  }

  // Calculate streaks
  const maxGapMs = STREAK_MAX_GAP_DAYS * 24 * 60 * 60 * 1000;
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < participated.length; i++) {
    const gap = participated[i].date - participated[i - 1].date;
    if (gap <= maxGapMs) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }
  currentStreak = tempStreak;

  // Check if current streak is still active (last session within gap)
  const now = Date.now();
  const lastDate = participated[participated.length - 1].date;
  if (now - lastDate > maxGapMs) {
    currentStreak = 0;
  }

  // Calculate points
  let totalPoints = 0;
  let streak = 0;
  for (let i = 0; i < participated.length; i++) {
    totalPoints += POINTS_PER_SESSION;
    if (i > 0) {
      const gap = participated[i].date - participated[i - 1].date;
      if (gap <= maxGapMs) {
        streak++;
        if (streak >= 2) {
          totalPoints += STREAK_BONUS;
        }
      } else {
        streak = 0;
      }
    }
  }

  return {
    personId,
    displayName,
    totalSessions,
    currentStreak,
    longestStreak,
    totalPoints,
    lastSessionDate: lastDate,
  };
}
