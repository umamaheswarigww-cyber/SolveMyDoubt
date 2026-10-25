export type UserRole = 'student' | 'faculty' | 'admin';

export type QuestionDifficulty = 'Introductory' | 'Intermediate' | 'Advanced';

export type QuestionStatus = 'open' | 'answered' | 'resolved' | 'closed';

export type RescuePriority = 'normal' | 'urgent' | 'critical';

export type ExplanationMode = 'standard' | 'beginner' | 'step-by-step' | 'practical';

export interface Profile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  department: string | null;
  year_of_study: string | null;
  interests: string[];
  reputation: number;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  // Computed or joined
  role?: UserRole;
  is_faculty_verified_member?: boolean;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  assigned_by: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  course_code: string;
  description: string | null;
  department: string;
  is_active: boolean;
  color: string;
  icon: string;
  created_at: string;
  updated_at?: string;
  // Computed
  question_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  created_at: string;
  question_count?: number;
}

export interface Question {
  id: string;
  author_id: string;
  course_id: string;
  title: string;
  body: string;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  attachment_url: string | null;
  view_count: number;
  upvotes: number;
  downvotes: number;
  score: number;
  is_escalated: boolean;
  escalated_at: string | null;
  escalated_to_faculty_id: string | null;
  escalation_reason: string | null;
  rescue_priority: RescuePriority;
  accepted_answer_id: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  author?: Profile;
  course?: Course;
  tags?: Tag[];
  answers_count?: number;
  answers?: Answer[];
  user_vote?: number;
  is_bookmarked?: boolean;
}

export interface Answer {
  id: string;
  question_id: string;
  author_id: string;
  body: string;
  is_accepted: boolean;
  accepted_at: string | null;
  verified_by: string | null;
  verifier_name?: string | null;
  verified_at: string | null;
  faculty_feedback: string | null;
  explanation_mode: ExplanationMode;
  upvotes: number;
  downvotes: number;
  score: number;
  created_at: string;
  updated_at: string;

  // Joined relations
  author?: Profile;
  verifier?: Profile;
  comments?: Comment[];
  user_vote?: number;
}

export interface Vote {
  id: string;
  user_id: string;
  target_type: 'question' | 'answer';
  target_id: string;
  vote_value: number; // 1 or -1
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  author_id: string;
  question_id: string | null;
  answer_id: string | null;
  body: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Bookmark {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
  question?: Question;
}

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  event_type: 'new_answer' | 'answer_accepted' | 'faculty_verified' | 'question_escalated' | 'new_comment' | 'peer_match';
  question_id: string | null;
  answer_id: string | null;
  payload: Record<string, any>;
  read_at: string | null;
  created_at: string;
  actor?: Profile;
  question?: Question;
}

export interface FacultyReview {
  id: string;
  answer_id: string;
  faculty_id: string;
  decision: 'approved' | 'rejected' | 'correction_added';
  feedback: string | null;
  official_explanation: string | null;
  created_at: string;
  faculty?: Profile;
  answer?: Answer;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'question' | 'answer' | 'comment' | 'user';
  target_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter?: Profile;
}

export interface LeaderboardUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  department: string | null;
  reputation: number;
  accepted_answers_count: number;
  total_answers_count: number;
  verified_answers_count: number;
  rank: number;
  badge?: string;
  is_anonymous: boolean;
}
