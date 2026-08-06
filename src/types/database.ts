// ========================================================
// Le Major — Database Types
// Mirrors the Supabase schema defined in schema.sql
// ========================================================

// -- Enums --

export type UserRole = 'student' | 'admin';
export type ContentType = 'lesson' | 'summary' | 'resource';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type DifficultyLevel = 'easy' | 'intermediate' | 'hard';
export type ActivationStatus = 'available' | 'activated' | 'expired' | 'revoked';
export type ExamStatus = 'in_progress' | 'completed' | 'evaluated';

// -- Table row types --

export interface University {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Formation {
  id: string;
  university_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Level {
  id: string;
  formation_id: string;
  name: string;
  slug: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Edition {
  id: string;
  level_id: string;
  academic_year: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: string;
  edition_id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  semester_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order_index: number;
  coefficient: number;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  chapter_id: string;
  title: string;
  slug: string;
  type: ContentType;
  body: string;
  status: ContentStatus;
  order_index: number;
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  chapter_id: string;
  title: string;
  slug: string;
  statement: string;
  correction: string;
  difficulty: DifficultyLevel;
  points: number;
  status: ContentStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Series {
  id: string;
  subject_id: string;
  title: string;
  slug: string;
  description: string | null;
  status: ContentStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SeriesExercise {
  id: string;
  series_id: string;
  exercise_id: string;
  order_index: number;
}

export interface Exam {
  id: string;
  subject_id: string;
  title: string;
  slug: string;
  academic_year: string | null;
  session: string | null;
  statement: string;
  correction: string;
  duration_minutes: number | null;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface ExamChapter {
  id: string;
  exam_id: string;
  chapter_id: string;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageSubject {
  id: string;
  package_id: string;
  subject_id: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  package_id: string;
  status: ActivationStatus;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  university_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentActivation {
  id: string;
  user_id: string;
  activation_code_id: string;
  package_id: string;
  activated_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface ChapterProgress {
  id: string;
  user_id: string;
  chapter_id: string;
  completed_contents: number;
  total_contents: number;
  last_accessed_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseProgress {
  id: string;
  user_id: string;
  exercise_id: string;
  viewed_at: string;
  viewed_correction: boolean;
  self_rating: number | null;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  subject_id: string;
  difficulty: DifficultyLevel;
  duration_minutes: number;
  status: ExamStatus;
  questions: ExamQuestion[];
  score: number | null;
  total_points: number | null;
  started_at: string;
  finished_at: string | null;
  evaluated_at: string | null;
  created_at: string;
}

export interface ExamQuestion {
  exercise_id: string;
  chapter_id: string;
  chapter_title: string;
  points: number;
  order: number;
}

export interface ExamQuestionEvaluation {
  id: string;
  attempt_id: string;
  exercise_id: string;
  max_points: number;
  self_score: number | null;
  evaluated_at: string | null;
}

// -- Composite types for UI --

export interface SubjectWithProgress extends Subject {
  chapters: Chapter[];
  chaptersCompleted: number;
  totalChapters: number;
  progressPercent: number;
}

export interface ChapterWithContents extends Chapter {
  contents: Content[];
  exercises: Exercise[];
  progress?: ChapterProgress;
}

export interface ExamAttemptWithEvaluations extends ExamAttempt {
  evaluations: ExamQuestionEvaluation[];
  subject: Pick<Subject, 'name' | 'slug'>;
}
