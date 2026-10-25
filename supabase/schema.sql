-- ====================================================================
-- SOLVEMYDOUBT (DOUBTLOOP) PRODUCTION DATABASE SCHEMA
-- RUN THIS IN SUPABASE SQL EDITOR:
-- URL: https://supabase.com/dashboard/project/sgyflrnosqeeulmlcaba/sql/new
-- ====================================================================

-- 1. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id text PRIMARY KEY,
  name text NOT NULL,
  course_code text UNIQUE NOT NULL,
  description text,
  department text NOT NULL,
  is_active boolean DEFAULT true,
  color text DEFAULT '#6366f1',
  icon text DEFAULT 'BookOpen',
  question_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. TAGS TABLE
CREATE TABLE IF NOT EXISTS public.tags (
  id text PRIMARY KEY,
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  category text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  username text UNIQUE,
  avatar_url text,
  bio text,
  department text,
  year_of_study text,
  reputation integer DEFAULT 25,
  is_anonymous boolean DEFAULT false,
  role text DEFAULT 'student',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. QUESTIONS TABLE (Accessible worldwide to all learners)
CREATE TABLE IF NOT EXISTS public.questions (
  id text PRIMARY KEY,
  author_id text,
  author_name text DEFAULT 'Academic Learner',
  author_avatar text,
  author_role text DEFAULT 'student',
  course_id text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Intermediate',
  status text NOT NULL DEFAULT 'open',
  attachment_url text,
  view_count integer DEFAULT 1,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  score integer DEFAULT 0,
  is_escalated boolean DEFAULT false,
  escalated_at timestamptz,
  escalated_to_faculty_id text,
  escalation_reason text,
  rescue_priority text DEFAULT 'normal',
  accepted_answer_id text,
  resolved_at timestamptz,
  tag_ids text[] DEFAULT '{}'::text[],
  tags_json jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.answers (
  id text PRIMARY KEY,
  question_id text NOT NULL,
  author_id text,
  author_name text DEFAULT 'Scholar Contributor',
  author_avatar text,
  author_role text DEFAULT 'student',
  body text NOT NULL,
  is_accepted boolean DEFAULT false,
  accepted_at timestamptz,
  verified_by text,
  verifier_name text,
  verified_at timestamptz,
  faculty_feedback text,
  explanation_mode text DEFAULT 'standard',
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. VOTES TABLE
CREATE TABLE IF NOT EXISTS public.votes (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  vote_value integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

-- --------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY & OPEN POLICIES FOR WORLDWIDE ACCESS
-- --------------------------------------------------------------------
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Courses read policy
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert courses" ON public.courses;
CREATE POLICY "Public insert courses" ON public.courses FOR INSERT WITH CHECK (true);

-- Tags read policy
DROP POLICY IF EXISTS "Public read tags" ON public.tags;
CREATE POLICY "Public read tags" ON public.tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert tags" ON public.tags;
CREATE POLICY "Public insert tags" ON public.tags FOR INSERT WITH CHECK (true);

-- Profiles policies
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert profiles" ON public.profiles;
CREATE POLICY "Public insert profiles" ON public.profiles FOR ALL USING (true);

-- Questions policies (Allows ANY user worldwide to view, post, and update questions)
DROP POLICY IF EXISTS "Anyone can read questions" ON public.questions;
CREATE POLICY "Anyone can read questions" ON public.questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert questions" ON public.questions;
CREATE POLICY "Anyone can insert questions" ON public.questions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update questions" ON public.questions;
CREATE POLICY "Anyone can update questions" ON public.questions FOR UPDATE USING (true);

-- Answers policies (Allows ANY user worldwide to view, post, and accept answers)
DROP POLICY IF EXISTS "Anyone can read answers" ON public.answers;
CREATE POLICY "Anyone can read answers" ON public.answers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert answers" ON public.answers;
CREATE POLICY "Anyone can insert answers" ON public.answers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update answers" ON public.answers;
CREATE POLICY "Anyone can update answers" ON public.answers FOR UPDATE USING (true);

-- Votes policies
DROP POLICY IF EXISTS "Anyone can read votes" ON public.votes;
CREATE POLICY "Anyone can read votes" ON public.votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can cast votes" ON public.votes;
CREATE POLICY "Anyone can cast votes" ON public.votes FOR ALL USING (true);

-- --------------------------------------------------------------------
-- ENABLE SUPABASE REALTIME (INSTANT LIVE BROADCAST TO ALL CONNECTED DEVICES)
-- --------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- --------------------------------------------------------------------
-- SEED INITIAL COURSES
-- --------------------------------------------------------------------
INSERT INTO public.courses (id, name, course_code, description, department, is_active, color, icon, question_count)
VALUES
  ('course-cs101', 'Data Structures & Algorithms', 'CS-201', 'Asymptotic complexity, trees, heaps, dynamic programming, graph algorithms, and algorithmic paradigm design.', 'Computer Science', true, '#6366f1', 'Binary', 42),
  ('course-ai301', 'Machine Learning & Neural Foundations', 'AI-301', 'Gradient descent, backpropagation, regularization, loss formulations, PyTorch fundamentals, and transformers.', 'Artificial Intelligence', true, '#8b5cf6', 'BrainCircuit', 29),
  ('course-os202', 'Operating Systems & Concurrency', 'CS-204', 'Processes, threads, synchronization primitives, memory paging, virtual memory, and file systems.', 'Computer Science', true, '#06b6d4', 'Cpu', 35),
  ('course-math102', 'Linear Algebra & Matrix Decompositions', 'MATH-102', 'Vector spaces, eigenvalues, singular value decomposition (SVD), orthonormal projections, and quadratic forms.', 'Mathematics', true, '#10b981', 'Sigma', 24),
  ('course-db303', 'Database Management Systems & Internals', 'CS-303', 'Relational algebra, B+ trees, ACID transactions, WAL logging, MVCC, and query optimization.', 'Computer Science', true, '#f59e0b', 'Database', 19),
  ('course-ee101', 'Signals, Systems & Transform Calculus', 'EE-101', 'Continuous and discrete convolution, Fourier transforms, Laplace domains, and linear time-invariant filters.', 'Electrical Engineering', true, '#ec4899', 'Activity', 16)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, course_code = EXCLUDED.course_code;

-- --------------------------------------------------------------------
-- SEED POPULAR TOPIC TAGS
-- --------------------------------------------------------------------
INSERT INTO public.tags (id, name, slug, category, description)
VALUES
  ('tag-loss', 'loss-functions', 'loss-functions', 'Machine Learning', 'Formulation of objective functions, cross-entropy, and MSE penalty dynamics.'),
  ('tag-dp', 'dynamic-programming', 'dynamic-programming', 'Algorithms', 'Memoization, optimal substructure, and state recurrence formulation.'),
  ('tag-graphs', 'graph-theory', 'graph-theory', 'Algorithms', 'Shortest paths, minimum spanning trees, and network flow algorithms.'),
  ('tag-svd', 'matrix-svd', 'matrix-svd', 'Mathematics', 'Singular value decomposition, low-rank approximations, and spectral analysis.'),
  ('tag-concurrency', 'multithreading', 'multithreading', 'Operating Systems', 'Race conditions, mutex locks, semaphores, and lock-free concurrency.'),
  ('tag-acid', 'acid-properties', 'acid-properties', 'Databases', 'Atomicity, consistency, isolation levels, and durability guarantees.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- --------------------------------------------------------------------
-- SEED INITIAL PROFILES
-- --------------------------------------------------------------------
INSERT INTO public.profiles (id, display_name, username, avatar_url, bio, department, year_of_study, reputation, is_anonymous, role)
VALUES
  ('user-faculty-1', 'Dr. Marcus Vance', 'prof_vance', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Associate Professor of Computer Science & Algorithms.', 'Computer Science & Engineering', 'Faculty Member', 2450, false, 'faculty'),
  ('user-faculty-2', 'Dr. Aris Thorne', 'dr_thorne', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Lead Instructor for Artificial Intelligence & Deep Learning.', 'Artificial Intelligence & Data Science', 'Faculty Member', 3120, false, 'faculty'),
  ('user-student-1', 'Sophia Patel', 'sophiacodes', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Junior CS major obsessed with competitive programming.', 'Computer Science', '3rd Year', 890, false, 'student')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- SEED SHOWCASE ACADEMIC DOUBTS (RICH LATEX + PYTHON CODE)
-- --------------------------------------------------------------------
INSERT INTO public.questions (id, author_id, author_name, author_avatar, author_role, course_id, title, body, difficulty, status, view_count, upvotes, downvotes, score, is_escalated, rescue_priority, tag_ids, tags_json, created_at)
VALUES
  (
    'q-cross-entropy',
    'user-student-1',
    'Sophia Patel',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'student',
    'course-ai301',
    'Why does cross-entropy penalize confident wrong predictions more severely than Mean Squared Error (MSE)?',
    'In classification tasks using softmax activations, we frequently choose categorical cross-entropy over Mean Squared Error. The formula for cross-entropy is:

$$L_{CE} = - \sum_{i=1}^{C} y_i \log(\hat{y}_i)$$

Where $y$ is the one-hot target vector and $\hat{y}$ is predicted probability. If our true label is $y_k = 1$ and the model assigns a tiny probability $\hat{y}_k \to 0$, then:

$$\lim_{\hat{y}_k \to 0^+} -\log(\hat{y}_k) = +\infty$$

Can someone demonstrate mathematically why the gradient of MSE saturates when paired with sigmoid/softmax, whereas cross-entropy maintains strong error signals?',
    'Intermediate',
    'answered',
    342,
    48,
    2,
    46,
    false,
    'normal',
    ARRAY['tag-loss'],
    '[{"id":"tag-loss","name":"loss-functions","slug":"loss-functions"}]'::jsonb,
    now() - interval '2 hours'
  ),
  (
    'q-johnson-algo',
    'user-student-2',
    'Liam Zhang',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'student',
    'course-cs101',
    'Rigorous proof for Johnson''s Algorithm edge reweighting preserving shortest paths',
    'Johnson''s algorithm solves all-pairs shortest paths on directed graphs with potential negative edge weights by transforming weights using a potential function $h(u)$ obtained from Bellman-Ford:

$$\hat{w}(u, v) = w(u, v) + h(u) - h(v)$$

I need a rigorous proof showing that for any path $p = \langle v_0, v_1, \dots, v_k \rangle$, the difference in path weights between the original graph and reweighted graph is strictly independent of the intermediate vertices.',
    'Advanced',
    'resolved',
    512,
    64,
    1,
    63,
    false,
    'normal',
    ARRAY['tag-graphs'],
    '[{"id":"tag-graphs","name":"graph-theory","slug":"graph-theory"}]'::jsonb,
    now() - interval '6 hours'
  ),
  (
    'q-matrix-svd',
    'user-student-3',
    'Maya Al-Mansoor',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'student',
    'course-math102',
    'Intuition behind Eckart-Young-Mirsky Theorem in Low-Rank SVD Approximation',
    'Given matrix $A \in \mathbb{R}^{m \times n}$ with singular value decomposition $A = U \Sigma V^T$, the best rank-$k$ approximation under Frobenius and spectral norms is truncated sum:

$$A_k = \sum_{i=1}^{k} \sigma_i u_i v_i^T$$

Why is the error exactly $\sigma_{k+1}$ in the spectral norm $\|A - A_k\|_2$?',
    'Advanced',
    'open',
    184,
    31,
    0,
    31,
    true,
    'critical',
    ARRAY['tag-svd'],
    '[{"id":"tag-svd","name":"matrix-svd","slug":"matrix-svd"}]'::jsonb,
    now() - interval '14 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- SEED INITIAL ACCEPTED & FACULTY-VERIFIED ANSWERS
-- --------------------------------------------------------------------
INSERT INTO public.answers (id, question_id, author_id, author_name, author_avatar, author_role, body, is_accepted, verified_by, verifier_name, verified_at, faculty_feedback, explanation_mode, upvotes, downvotes, score, created_at)
VALUES
  (
    'ans-cross-entropy-1',
    'q-cross-entropy',
    'user-student-3',
    'Maya Al-Mansoor',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'student',
    '### Mathematical Proof of Gradient Saturation vs Steep Penalty

Consider a single sigmoid neuron outputting $a = \sigma(z)$ where $z = w \cdot x + b$.

#### 1. Mean Squared Error Gradient
$$L_{MSE} = \frac{1}{2}(y - a)^2$$
Taking derivative with respect to weight $w_j$:
$$\frac{\partial L_{MSE}}{\partial w_j} = (a - y) \cdot \sigma''(z) \cdot x_j$$

Because $\sigma''(z) = a(1 - a)$, when the model is confidently wrong (e.g. $y=1$ but $a \approx 0$), $a(1-a) \approx 0$, causing **gradient saturation**. The weights barely update!

#### 2. Cross-Entropy Gradient
$$L_{CE} = -[y \ln a + (1-y)\ln(1-a)]$$
Taking the derivative:
$$\frac{\partial L_{CE}}{\partial w_j} = (a - y) \cdot x_j$$

Notice the $\sigma''(z)$ term cancels out entirely! The error gradient is directly proportional to $(a - y)$, providing steep, aggressive corrective step even when predictions are heavily displaced.',
    true,
    'user-faculty-2',
    'Dr. Aris Thorne',
    now() - interval '1 hour',
    'Exceptional derivation. Mathematically sound proof of derivative cancellation in exponential family losses.',
    'step-by-step',
    42,
    1,
    41,
    now() - interval '1 hour'
  ),
  (
    'ans-johnson-algo-1',
    'q-johnson-algo',
    'user-faculty-1',
    'Dr. Marcus Vance',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'faculty',
    '### Proof of Telescoping Invariant in Johnson''s Reweighting

Let $p = \langle v_0, v_1, \dots, v_k \rangle$ be any path from $v_0$ to $v_k$ in $G$.

The weight of path $p$ under modified weight function $\hat{w}$ is:
$$\hat{w}(p) = \sum_{i=1}^{k} \hat{w}(v_{i-1}, v_i) = \sum_{i=1}^{k} [w(v_{i-1}, v_i) + h(v_{i-1}) - h(v_i)]$$

Expanding the summation gives a **telescoping sum**:
$$\hat{w}(p) = \sum_{i=1}^{k} w(v_{i-1}, v_i) + [h(v_0) - h(v_1) + h(v_1) - h(v_2) + \dots + h(v_{k-1}) - h(v_k)]$$

All intermediate potential terms $h(v_1), h(v_2), \dots, h(v_{k-1})$ cancel out exactly:
$$\hat{w}(p) = w(p) + h(v_0) - h(v_k)$$

Because $h(v_0) - h(v_k)$ is a constant depending only on endpoints $v_0$ and $v_k$, any path that minimizes $\hat{w}(p)$ simultaneously minimizes $w(p)$. $\blacksquare$',
    true,
    'user-faculty-1',
    'Dr. Marcus Vance',
    now() - interval '4 hours',
    'Official faculty endorsement: Telescoping expansion verified with complete mathematical rigor.',
    'standard',
    58,
    0,
    58,
    now() - interval '4 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- Update accepted_answer_id on questions
UPDATE public.questions SET accepted_answer_id = 'ans-cross-entropy-1' WHERE id = 'q-cross-entropy';
UPDATE public.questions SET accepted_answer_id = 'ans-johnson-algo-1', resolved_at = now() - interval '4 hours' WHERE id = 'q-johnson-algo';
