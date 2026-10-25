import { Profile, UserRole, QuestionDifficulty, QuestionStatus, RescuePriority } from './database';

export * from './database';

export interface AuthUser {
  id: string;
  email?: string;
  is_anonymous: boolean;
  profile?: Profile;
  roles: UserRole[];
}

export interface QuestionFilters {
  searchQuery: string;
  courseId: string | 'all';
  tagSlug: string | 'all';
  department: string | 'all';
  difficulty: QuestionDifficulty | 'all';
  status: QuestionStatus | 'all';
  sortBy: 'newest' | 'most_voted' | 'most_answered' | 'unanswered' | 'recently_active';
  rescueOnly?: boolean;
}

export interface RescueMetrics {
  totalUnanswered: number;
  urgentCount: number;
  criticalCount: number;
  escalatedToFaculty: number;
  avgResolutionTimeHours: number;
  rescueSuccessRatePercent: number;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}
