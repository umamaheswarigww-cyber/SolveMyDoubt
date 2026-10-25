-- ====================================================================
-- DOUBTLOOP / SOLVEMYDOUBT: COMPREHENSIVE PRODUCTION DATABASE SCHEMA
-- Migration: 20261025000000_init_schema.sql
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to auth.users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  department text,
  year_of_study text,
  interests text[] DEFAULT '{}'::text[],
  reputation integer DEFAULT 0,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for searching and leaderboard
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_reputation ON public.profiles(reputation DESC);

-- --------------------------------------------------------------------
-- 2. USER ROLES TABLE (Controlled authorization: student, faculty, admin)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Helper security definer function to check role safely without recursion
CREATE OR REPLACE FUNCTION public.has_role(check_user_id uuid, check_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = check_role
  );
$$;

-- Helper security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$;

-- Helper security definer function to check if user is faculty
CREATE OR REPLACE FUNCTION public.is_faculty(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'faculty'
  );
$$;

-- --------------------------------------------------------------------
-- 3. COURSES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course_code text UNIQUE NOT NULL,
  description text,
  department text NOT NULL,
  is_active boolean DEFAULT true,
  color text DEFAULT '#4f46e5',
  icon text DEFAULT 'BookOpen',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_code ON public.courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_department ON public.courses(department);

-- --------------------------------------------------------------------
-- 4. TAGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  category text,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- --------------------------------------------------------------------
-- 5. QUESTIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Introductory', 'Intermediate', 'Advanced')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'resolved', 'closed')),
  attachment_url text,
  view_count integer DEFAULT 0,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  score integer DEFAULT 0,
  is_escalated boolean DEFAULT false,
  escalated_at timestamptz,
  escalated_to_faculty_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  escalation_reason text,
  rescue_priority text DEFAULT 'normal' CHECK (rescue_priority IN ('normal', 'urgent', 'critical')),
  accepted_answer_id uuid, -- FK added after answers table exists
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_author_id ON public.questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_course_id ON public.questions(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_score ON public.questions(score DESC);
CREATE INDEX IF NOT EXISTS idx_questions_is_escalated ON public.questions(is_escalated);

-- Full-text search index for questions
CREATE INDEX IF NOT EXISTS idx_questions_search ON public.questions
USING gin(to_tsvector('english', title || ' ' || body));

-- --------------------------------------------------------------------
-- 6. QUESTION TAGS (M2M)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_tags (
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_question_tags_tag_id ON public.question_tags(tag_id);

-- --------------------------------------------------------------------
-- 7. ANSWERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_accepted boolean DEFAULT false,
  accepted_at timestamptz,
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at timestamptz,
  faculty_feedback text,
  explanation_mode text DEFAULT 'standard' CHECK (explanation_mode IN ('standard', 'beginner', 'step-by-step', 'practical')),
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON public.answers(author_id);
CREATE INDEX IF NOT EXISTS idx_answers_is_accepted ON public.answers(is_accepted);
CREATE INDEX IF NOT EXISTS idx_answers_verified_by ON public.answers(verified_by);

-- Add accepted_answer_id FK to questions table
ALTER TABLE public.questions
  DROP CONSTRAINT IF EXISTS fk_questions_accepted_answer;
ALTER TABLE public.questions
  ADD CONSTRAINT fk_questions_accepted_answer
  FOREIGN KEY (accepted_answer_id) REFERENCES public.answers(id) ON DELETE SET NULL;

-- --------------------------------------------------------------------
-- 8. VOTES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('question', 'answer')),
  target_id uuid NOT NULL,
  vote_value integer NOT NULL CHECK (vote_value IN (1, -1)),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_target ON public.votes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON public.votes(user_id);

-- --------------------------------------------------------------------
-- 9. COMMENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_id uuid REFERENCES public.answers(id) ON DELETE CASCADE,
  body text NOT NULL,
  parent_comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL) OR
    (question_id IS NULL AND answer_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_comments_question_id ON public.comments(question_id);
CREATE INDEX IF NOT EXISTS idx_comments_answer_id ON public.comments(answer_id);

-- --------------------------------------------------------------------
-- 10. BOOKMARKS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- --------------------------------------------------------------------
-- 11. NOTIFICATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_id uuid REFERENCES public.answers(id) ON DELETE CASCADE,
  payload jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);

-- --------------------------------------------------------------------
-- 12. REPORTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('question', 'answer', 'comment', 'user')),
  target_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- --------------------------------------------------------------------
-- 13. FACULTY REVIEWS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faculty_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  faculty_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected', 'correction_added')),
  feedback text,
  official_explanation text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faculty_reviews_answer ON public.faculty_reviews(answer_id);
CREATE INDEX IF NOT EXISTS idx_faculty_reviews_faculty ON public.faculty_reviews(faculty_id);

-- --------------------------------------------------------------------
-- 14. REPUTATION EVENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reputation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  points integer NOT NULL,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reputation_user ON public.reputation_events(user_id);

-- --------------------------------------------------------------------
-- DATABASE FUNCTIONS & TRIGGERS
-- --------------------------------------------------------------------

-- Auto-create profile trigger on auth.users creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
  suffix int := 1;
  is_anon boolean := false;
BEGIN
  -- Check if user is anonymous
  IF (new.raw_app_meta_data->>'provider' = 'anonymous') OR (new.is_anonymous IS TRUE) THEN
    is_anon := true;
    base_username := 'guest_' || substr(new.id::text, 1, 8);
    final_username := base_username;
  ELSE
    base_username := coalesce(
      new.raw_user_meta_data->>'user_name',
      split_part(new.email, '@', 1),
      'learner_' || substr(new.id::text, 1, 6)
    );
    -- sanitize username
    base_username := regexp_replace(lower(base_username), '[^a-z0-9_]', '', 'g');
    IF length(base_username) < 3 THEN
      base_username := 'user_' || substr(new.id::text, 1, 6);
    END IF;
    final_username := base_username;
    -- Handle collisions
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
      final_username := base_username || '_' || suffix;
      suffix := suffix + 1;
    END LOOP;
  END IF;

  INSERT INTO public.profiles (
    id,
    display_name,
    username,
    avatar_url,
    bio,
    department,
    year_of_study,
    is_anonymous,
    reputation
  ) VALUES (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      CASE WHEN is_anon THEN 'Guest Learner' ELSE split_part(new.email, '@', 1) END
    ),
    final_username,
    new.raw_user_meta_data->>'avatar_url',
    CASE WHEN is_anon THEN 'Browsing as guest learner' ELSE 'Passionate student eager to learn and help peers.' END,
    'General Studies',
    '1st Year',
    is_anon,
    CASE WHEN is_anon THEN 0 ELSE 10 END
  );

  -- Assign default 'student' role if not anonymous
  IF NOT is_anon THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'student')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for Question & Answer Vote counts & Score updates
CREATE OR REPLACE FUNCTION public.handle_vote_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  rep_change integer := 0;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'question' THEN
      UPDATE public.questions
      SET
        upvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'question' AND target_id = NEW.target_id AND vote_value = 1),
        downvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'question' AND target_id = NEW.target_id AND vote_value = -1),
        score = (SELECT coalesce(sum(vote_value), 0) FROM public.votes WHERE target_type = 'question' AND target_id = NEW.target_id)
      WHERE id = NEW.target_id;

      SELECT author_id INTO target_user_id FROM public.questions WHERE id = NEW.target_id;
      rep_change := CASE WHEN NEW.vote_value = 1 THEN 5 ELSE -2 END;
    ELSIF NEW.target_type = 'answer' THEN
      UPDATE public.answers
      SET
        upvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'answer' AND target_id = NEW.target_id AND vote_value = 1),
        downvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'answer' AND target_id = NEW.target_id AND vote_value = -1),
        score = (SELECT coalesce(sum(vote_value), 0) FROM public.votes WHERE target_type = 'answer' AND target_id = NEW.target_id)
      WHERE id = NEW.target_id;

      SELECT author_id INTO target_user_id FROM public.answers WHERE id = NEW.target_id;
      rep_change := CASE WHEN NEW.vote_value = 1 THEN 10 ELSE -2 END;
    END IF;

    -- Award/deduct reputation to target author (if not self-vote)
    IF target_user_id IS NOT NULL AND target_user_id <> NEW.user_id THEN
      UPDATE public.profiles
      SET reputation = greatest(0, reputation + rep_change)
      WHERE id = target_user_id;

      INSERT INTO public.reputation_events (user_id, event_type, points, reference_id)
      VALUES (target_user_id, 'vote_' || NEW.target_type, rep_change, NEW.target_id);
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.target_type = 'question' THEN
      UPDATE public.questions
      SET
        upvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'question' AND target_id = NEW.target_id AND vote_value = 1),
        downvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'question' AND target_id = NEW.target_id AND vote_value = -1),
        score = (SELECT coalesce(sum(vote_value), 0) FROM public.votes WHERE target_type = 'question' AND target_id = NEW.target_id)
      WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'answer' THEN
      UPDATE public.answers
      SET
        upvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'answer' AND target_id = NEW.target_id AND vote_value = 1),
        downvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'answer' AND target_id = NEW.target_id AND vote_value = -1),
        score = (SELECT coalesce(sum(vote_value), 0) FROM public.votes WHERE target_type = 'answer' AND target_id = NEW.target_id)
      WHERE id = NEW.target_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'question' THEN
      UPDATE public.questions
      SET
        upvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'question' AND target_id = OLD.target_id AND vote_value = 1),
        downvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'question' AND target_id = OLD.target_id AND vote_value = -1),
        score = (SELECT coalesce(sum(vote_value), 0) FROM public.votes WHERE target_type = 'question' AND target_id = OLD.target_id)
      WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'answer' THEN
      UPDATE public.answers
      SET
        upvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'answer' AND target_id = OLD.target_id AND vote_value = 1),
        downvotes = (SELECT count(*) FROM public.votes WHERE target_type = 'answer' AND target_id = OLD.target_id AND vote_value = -1),
        score = (SELECT coalesce(sum(vote_value), 0) FROM public.votes WHERE target_type = 'answer' AND target_id = OLD.target_id)
      WHERE id = OLD.target_id;
    END IF;
  END IF;

  RETURN coalesce(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_vote_mutation ON public.votes;
CREATE TRIGGER on_vote_mutation
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_vote_change();

-- Secure function to Cast or Toggle Vote
CREATE OR REPLACE FUNCTION public.cast_vote(
  p_target_type text,
  p_target_id uuid,
  p_vote_value integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_existing_value integer;
  v_author_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to vote';
  END IF;

  -- Disallow guest voting
  IF (SELECT is_anonymous FROM public.profiles WHERE id = v_user_id) IS TRUE THEN
    RAISE EXCEPTION 'Guest learners cannot cast votes. Please sign in to vote.';
  END IF;

  -- Validate target
  IF p_target_type = 'question' THEN
    SELECT author_id INTO v_author_id FROM public.questions WHERE id = p_target_id;
  ELSIF p_target_type = 'answer' THEN
    SELECT author_id INTO v_author_id FROM public.answers WHERE id = p_target_id;
  ELSE
    RAISE EXCEPTION 'Invalid target type';
  END IF;

  IF v_author_id IS NULL THEN
    RAISE EXCEPTION 'Target not found';
  END IF;

  IF v_author_id = v_user_id THEN
    RAISE EXCEPTION 'Self-voting is not permitted';
  END IF;

  -- Check existing vote
  SELECT vote_value INTO v_existing_value
  FROM public.votes
  WHERE user_id = v_user_id AND target_type = p_target_type AND target_id = p_target_id;

  IF v_existing_value IS NULL THEN
    -- Insert new vote
    INSERT INTO public.votes (user_id, target_type, target_id, vote_value)
    VALUES (v_user_id, p_target_type, p_target_id, p_vote_value);
    RETURN jsonb_build_object('status', 'inserted', 'value', p_vote_value);
  ELSIF v_existing_value = p_vote_value THEN
    -- Cancel vote on double click
    DELETE FROM public.votes
    WHERE user_id = v_user_id AND target_type = p_target_type AND target_id = p_target_id;
    RETURN jsonb_build_object('status', 'cancelled', 'value', 0);
  ELSE
    -- Change vote direction
    UPDATE public.votes
    SET vote_value = p_vote_value, updated_at = now()
    WHERE user_id = v_user_id AND target_type = p_target_type AND target_id = p_target_id;
    RETURN jsonb_build_object('status', 'updated', 'value', p_vote_value);
  END IF;
END;
$$;

-- Secure function for question owner to Accept/Unaccept answer
CREATE OR REPLACE FUNCTION public.toggle_accept_answer(
  p_answer_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_question_id uuid;
  v_question_author_id uuid;
  v_answer_author_id uuid;
  v_current_accepted boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT question_id, author_id, is_accepted
  INTO v_question_id, v_answer_author_id, v_current_accepted
  FROM public.answers
  WHERE id = p_answer_id;

  IF v_question_id IS NULL THEN
    RAISE EXCEPTION 'Answer not found';
  END IF;

  SELECT author_id INTO v_question_author_id
  FROM public.questions
  WHERE id = v_question_id;

  IF v_question_author_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the question author can accept an answer';
  END IF;

  IF v_current_accepted THEN
    -- Unaccept
    UPDATE public.answers
    SET is_accepted = false, accepted_at = NULL
    WHERE id = p_answer_id;

    UPDATE public.questions
    SET accepted_answer_id = NULL, status = 'open'
    WHERE id = v_question_id;

    -- Deduct reputation
    UPDATE public.profiles
    SET reputation = greatest(0, reputation - 15)
    WHERE id = v_answer_author_id;

    RETURN jsonb_build_object('is_accepted', false);
  ELSE
    -- Unaccept previously accepted answer for this question
    UPDATE public.answers
    SET is_accepted = false, accepted_at = NULL
    WHERE question_id = v_question_id AND is_accepted = true;

    -- Accept this answer
    UPDATE public.answers
    SET is_accepted = true, accepted_at = now()
    WHERE id = p_answer_id;

    UPDATE public.questions
    SET accepted_answer_id = p_answer_id, status = 'resolved', resolved_at = now()
    WHERE id = v_question_id;

    -- Award reputation
    UPDATE public.profiles
    SET reputation = reputation + 15
    WHERE id = v_answer_author_id;

    INSERT INTO public.reputation_events (user_id, event_type, points, reference_id)
    VALUES (v_answer_author_id, 'answer_accepted', 15, p_answer_id);

    -- Notify answer author
    INSERT INTO public.notifications (recipient_id, actor_id, event_type, question_id, answer_id, payload)
    VALUES (
      v_answer_author_id,
      v_user_id,
      'answer_accepted',
      v_question_id,
      p_answer_id,
      jsonb_build_object('message', 'Your answer was marked as accepted!')
    );

    RETURN jsonb_build_object('is_accepted', true);
  END IF;
END;
$$;

-- Secure function for authorized Faculty to verify answer
CREATE OR REPLACE FUNCTION public.faculty_verify_answer(
  p_answer_id uuid,
  p_decision text, -- 'approved', 'rejected', 'correction_added'
  p_feedback text DEFAULT NULL,
  p_official_explanation text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_faculty_id uuid;
  v_is_fac boolean;
  v_is_adm boolean;
  v_answer_author_id uuid;
  v_question_id uuid;
BEGIN
  v_faculty_id := auth.uid();
  IF v_faculty_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT public.is_faculty(v_faculty_id) INTO v_is_fac;
  SELECT public.is_admin(v_faculty_id) INTO v_is_adm;

  IF NOT (v_is_fac OR v_is_adm) THEN
    RAISE EXCEPTION 'Unauthorized: only approved faculty members or administrators can verify answers';
  END IF;

  SELECT author_id, question_id
  INTO v_answer_author_id, v_question_id
  FROM public.answers
  WHERE id = p_answer_id;

  IF v_answer_author_id IS NULL THEN
    RAISE EXCEPTION 'Answer not found';
  END IF;

  IF p_decision = 'approved' THEN
    UPDATE public.answers
    SET
      verified_by = v_faculty_id,
      verified_at = now(),
      faculty_feedback = p_feedback
    WHERE id = p_answer_id;

    -- Record review history
    INSERT INTO public.faculty_reviews (answer_id, faculty_id, decision, feedback, official_explanation)
    VALUES (p_answer_id, v_faculty_id, p_decision, p_feedback, p_official_explanation);

    -- Award high reputation for faculty-verified answer
    UPDATE public.profiles
    SET reputation = reputation + 25
    WHERE id = v_answer_author_id;

    INSERT INTO public.reputation_events (user_id, event_type, points, reference_id)
    VALUES (v_answer_author_id, 'faculty_verified', 25, p_answer_id);

    -- Notify answer author
    INSERT INTO public.notifications (recipient_id, actor_id, event_type, question_id, answer_id, payload)
    VALUES (
      v_answer_author_id,
      v_faculty_id,
      'faculty_verified',
      v_question_id,
      p_answer_id,
      jsonb_build_object('message', 'Congratulations! Your explanation was verified by faculty.')
    );

    RETURN jsonb_build_object('verified', true, 'verified_at', now());
  ELSE
    -- Rejected or correction requested
    UPDATE public.answers
    SET
      verified_by = NULL,
      verified_at = NULL,
      faculty_feedback = p_feedback
    WHERE id = p_answer_id;

    INSERT INTO public.faculty_reviews (answer_id, faculty_id, decision, feedback, official_explanation)
    VALUES (p_answer_id, v_faculty_id, p_decision, p_feedback, p_official_explanation);

    -- Notify answer author of feedback
    INSERT INTO public.notifications (recipient_id, actor_id, event_type, question_id, answer_id, payload)
    VALUES (
      v_answer_author_id,
      v_faculty_id,
      'faculty_feedback',
      v_question_id,
      p_answer_id,
      jsonb_build_object('decision', p_decision, 'feedback', p_feedback)
    );

    RETURN jsonb_build_object('verified', false, 'decision', p_decision);
  END IF;
END;
$$;

-- Secure function to Escalate question to Faculty
CREATE OR REPLACE FUNCTION public.escalate_question_to_faculty(
  p_question_id uuid,
  p_reason text,
  p_faculty_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_author_id uuid;
  v_status text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT author_id, status INTO v_author_id, v_status
  FROM public.questions
  WHERE id = p_question_id;

  IF v_author_id IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  -- Only author, faculty, or admin can escalate
  IF v_author_id <> v_user_id AND NOT public.is_faculty(v_user_id) AND NOT public.is_admin(v_user_id) THEN
    RAISE EXCEPTION 'Unauthorized to escalate this question';
  END IF;

  UPDATE public.questions
  SET
    is_escalated = true,
    escalated_at = now(),
    escalation_reason = p_reason,
    escalated_to_faculty_id = p_faculty_id,
    rescue_priority = 'urgent'
  WHERE id = p_question_id;

  -- Notify target faculty if specified, otherwise alert active faculty
  IF p_faculty_id IS NOT NULL THEN
    INSERT INTO public.notifications (recipient_id, actor_id, event_type, question_id, payload)
    VALUES (
      p_faculty_id,
      v_user_id,
      'question_escalated',
      p_question_id,
      jsonb_build_object('reason', p_reason, 'message', 'A doubt has been directly escalated for your expert review.')
    );
  END IF;

  RETURN jsonb_build_object('escalated', true, 'priority', 'urgent');
END;
$$;

-- --------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile permitted fields" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- USER ROLES RLS
CREATE POLICY "Public read user roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Only admin can insert user roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Only admin can update user roles" ON public.user_roles
  FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Only admin can delete user roles" ON public.user_roles
  FOR DELETE USING (public.is_admin(auth.uid()));

-- COURSES RLS
CREATE POLICY "Public read active courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins manage courses" ON public.courses
  FOR ALL USING (public.is_admin(auth.uid()));

-- TAGS RLS
CREATE POLICY "Public read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admins or faculty manage tags" ON public.tags
  FOR ALL USING (public.is_admin(auth.uid()) OR public.is_faculty(auth.uid()));

-- QUESTIONS RLS
CREATE POLICY "Public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users and guests create questions" ON public.questions
  FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors or admins update questions" ON public.questions
  FOR UPDATE USING (auth.uid() = author_id OR public.is_admin(auth.uid()));
CREATE POLICY "Authors or admins delete questions" ON public.questions
  FOR DELETE USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

-- QUESTION TAGS RLS
CREATE POLICY "Public read question tags" ON public.question_tags FOR SELECT USING (true);
CREATE POLICY "Authors insert question tags" ON public.question_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.questions WHERE id = question_id AND author_id = auth.uid())
  );
CREATE POLICY "Authors delete question tags" ON public.question_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.questions WHERE id = question_id AND author_id = auth.uid())
  );

-- ANSWERS RLS
CREATE POLICY "Public read answers" ON public.answers FOR SELECT USING (true);
CREATE POLICY "Authenticated users insert answers" ON public.answers
  FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors or admins update answers" ON public.answers
  FOR UPDATE USING (auth.uid() = author_id OR public.is_admin(auth.uid()));
CREATE POLICY "Authors or admins delete answers" ON public.answers
  FOR DELETE USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

-- VOTES RLS
CREATE POLICY "Public read votes count" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Members cast own vote" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members update own vote" ON public.votes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Members delete own vote" ON public.votes
  FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS RLS
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users insert comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors or admins update comments" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id OR public.is_admin(auth.uid()));
CREATE POLICY "Authors or admins delete comments" ON public.comments
  FOR DELETE USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

-- BOOKMARKS RLS
CREATE POLICY "Users read own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS RLS
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- REPORTS RLS
CREATE POLICY "Users read own reports or admin all" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id OR public.is_admin(auth.uid()));
CREATE POLICY "Authenticated users submit report" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins manage reports" ON public.reports
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- FACULTY REVIEWS RLS
CREATE POLICY "Public read faculty reviews" ON public.faculty_reviews FOR SELECT USING (true);
CREATE POLICY "Faculty create reviews" ON public.faculty_reviews
  FOR INSERT WITH CHECK (public.is_faculty(auth.uid()) OR public.is_admin(auth.uid()));

-- REPUTATION EVENTS RLS
CREATE POLICY "Users read reputation events" ON public.reputation_events FOR SELECT USING (true);

-- --------------------------------------------------------------------
-- STORAGE BUCKETS CONFIGURATION (Avatars & Question Attachments)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users upload avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public read attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Authenticated users upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'attachments' AND auth.uid() IS NOT NULL);
