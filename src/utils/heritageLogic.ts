import { HeritageDestination, QuizQuestion, VerificationStatus } from '../types';

/**
 * Calculates straight line distance between two coordinates using the Haversine formula (km).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Evaluates quiz results, calculates percentage and assigns achievement badges.
 */
export interface QuizResultAssessment {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  earnedBadge?: {
    id: string;
    title: string;
    icon: string;
    description: string;
  };
}

export function assessQuizSubmission(
  answers: Record<string, number>,
  questions: QuizQuestion[]
): QuizResultAssessment {
  let score = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctIndex) {
      score += 1;
    }
  });

  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 60;

  let earnedBadge: QuizResultAssessment['earnedBadge'] = undefined;
  if (percentage === 100) {
    earnedBadge = {
      id: 'godavari_acharya',
      title: 'Godavari Maha Acharya',
      icon: 'Crown',
      description: 'Mastered 100% of Godavari Pushkaralu and Regional Heritage trivia!',
    };
  } else if (percentage >= 80) {
    earnedBadge = {
      id: 'heritage_scholar',
      title: 'Heritage Scholar',
      icon: 'Award',
      description: 'Demonstrated exceptional knowledge of regional art, temples, and history.',
    };
  } else if (passed) {
    earnedBadge = {
      id: 'river_explorer',
      title: 'Sacred River Explorer',
      icon: 'Compass',
      description: 'Successfully completed the Pushkaralu cultural heritage learning quiz.',
    };
  }

  return {
    score,
    total,
    percentage,
    passed,
    earnedBadge,
  };
}

/**
 * Filter destinations by category, search text, and verification status.
 */
export function filterDestinations(
  destinations: HeritageDestination[],
  filter: {
    category?: string;
    searchQuery?: string;
    status?: VerificationStatus | 'ALL';
  }
): HeritageDestination[] {
  return destinations.filter((dest) => {
    if (filter.category && filter.category !== 'all' && dest.category !== filter.category) {
      return false;
    }
    if (filter.status && filter.status !== 'ALL' && dest.verificationStatus !== filter.status) {
      return false;
    }
    if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
      const q = filter.searchQuery.toLowerCase().trim();
      const matchEn = dest.name.en.toLowerCase().includes(q) || dest.district.toLowerCase().includes(q);
      const matchTe = dest.name.te.toLowerCase().includes(q);
      const matchHi = dest.name.hi.toLowerCase().includes(q);
      const matchTags = dest.keyFeatures.some((tag) => tag.toLowerCase().includes(q));
      if (!matchEn && !matchTe && !matchHi && !matchTags) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Helper to ensure demonstration content notice compliance.
 */
export function isDemoRecord(record: { isDemo?: boolean; verificationStatus?: string }): boolean {
  return record.isDemo === true || record.verificationStatus === 'DEMO';
}
