# SolveMyDoubt (DoubtLoop)
> **Tagline:** Every doubt deserves an answer and Every Problem has a Solution.  
> **Mission:** Help students get reliable academic explanations from peers and certified faculty, outside classroom hours.

![DoubtLoop Banner](https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Product Highlights & Defining Features

- 🔄 **Unanswered Doubt Rescue System (Signature Feature):** Questions never rot in an abandoned forum feed. Questions unanswered after 6 hours surface to active peers; after 12 hours, questions automatically escalate to authorized faculty queues with **+15 contributor bounty points**.
- 🛡️ **Three Distinct Account & Verification Badges:**
  1. **Signed-in Member:** Small, elegant blue circular checkmark (`CheckCircle2`) beside the user's name.
  2. **Guest Learner:** Attributable anonymous guest session with neutral avatar and guest label. Cannot farm reputation, vote, or claim official badges.
  3. **Faculty Verified Answer:** Distinct prominent emerald/teal badge with the reviewing professor's name, timestamp, and official pedagogical comments.
- 📐 **Academic-Grade Mathematical & Code Typesetting:** Embedded KaTeX math formulas (`$E = mc^2$` and `$$\int f(x)dx$$`) and syntax-highlighted code fences.
- 🎯 **Doubt Quality Assistant:** Real-time pre-submission clarity meter checking title specificity, context depth, course curriculum association, and formula formatting.
- 📚 **Permanent Campus Knowledge Library:** Resolved and faculty-verified answers convert into reusable revision assets organized by university course codes (CS-201, AI-301, CS-204, etc.).
- 🏆 **Gamification & Leaderboard:** Weekly and all-time reputation tracking for verified peer support without spam incentives.
- ⚡ **Interactive Hackathon Persona Switcher:** Instant 1-click persona toggling in the navigation bar between **Student (Sophia Patel)**, **Faculty Reviewer (Dr. Marcus Vance)**, **Administrator**, and **Guest Learner**.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript 5, Vite 6
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Backend & Database:** Supabase PostgreSQL with complete Row Level Security (RLS) policies
- **Authentication:** Supabase Auth (Google OAuth, Email/Password, Anonymous Guest sessions)
- **Math Rendering:** KaTeX
- **Celebration Effects:** Canvas Confetti for accepted solution milestones
- **State & Data Caching:** TanStack Query & Context API
- **Testing:** Node.js native test runner & Vitest assertions

---

## 🚀 Quickstart & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/your-username/SolveMyDoubt.git
cd SolveMyDoubt
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your Supabase project keys (or leave blank to automatically run in local interactive demo sandbox mode):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Production Build & Tests
```bash
npm run build    # Compiles TypeScript and builds Vite bundle
npm test         # Runs automated acceptance test suite
```

---

## 🗄️ Database Architecture & Migrations

All database schemas, functions, triggers, and Row Level Security policies are located in:  
📁 `supabase/migrations/20261025000000_init_schema.sql`

### Tables Implemented
- `public.profiles`: User details, reputation score, bio, department, and anonymous guest flags.
- `public.user_roles`: Strictly protected authorization (`student`, `faculty`, `admin`).
- `public.courses`: Academic course metadata, department codes, and color tags.
- `public.tags`: Topic taxonomy (`Dynamic Programming`, `Graph Theory`, `Backpropagation`, `Deadlocks`).
- `public.questions`: Doubts with difficulty, view count, vote score, and rescue escalation priority.
- `public.answers`: Peer explanations with `is_accepted`, `verified_by`, `faculty_feedback`, and explanation mode.
- `public.votes`: Normalized atomic voting system preventing duplicate or self-voting.
- `public.comments`: Contextual threading on questions and answers.
- `public.bookmarks`: User-saved doubts.
- `public.notifications`: Event alerts for answers, acceptances, and faculty escalations.
- `public.faculty_reviews`: Historical review log of faculty decisions.
- `public.reputation_events`: Auditable reputation point awards.

### Security Definer Database Functions
- `cast_vote(p_target_type, p_target_id, p_vote_value)`: Safe atomic vote mutation with self-voting prevention and guest restrictions.
- `toggle_accept_answer(p_answer_id)`: Enforces question owner authorization, updates question resolution state, and awards +15 reputation.
- `faculty_verify_answer(p_answer_id, p_decision, p_feedback)`: Restricts answer verification exclusively to approved faculty or administrators.
- `escalate_question_to_faculty(p_question_id, p_reason)`: Elevates unanswered doubts to the faculty queue.

---

## 🔐 Google OAuth & Supabase Setup Guide

To link your live Supabase and Google Cloud credentials:

1. **Create Supabase Project:** Visit [supabase.com](https://supabase.com) and create a new project.
2. **Execute Schema Migration:** Open the Supabase SQL Editor and run `supabase/migrations/20261025000000_init_schema.sql`.
3. **Configure Google Cloud Console:**
   - Go to Google Cloud Console → *APIs & Services* → *Credentials*.
   - Create an **OAuth 2.0 Client ID** (Web Application).
   - In **Authorized redirect URIs**, enter:
     `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
4. **Enable Google Provider in Supabase:**
   - In Supabase Dashboard → *Authentication* → *Providers* → *Google*.
   - Toggle to Enable and paste your **Client ID** and **Client Secret**.
5. **Set Redirect URLs in Supabase:**
   - Under *Authentication* → *URL Configuration*:
   - Set Site URL to `http://localhost:5173` (or production domain).
   - Add `http://localhost:5173/**` to *Redirect URLs*.
6. **Enable Anonymous Sign-ins:**
   - Under *Authentication* → *Sign In / Up*, enable **Anonymous Sign-ins** to support guest exploration.
7. **Set Client Environment Variables:**
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in your `.env`.

---

## 🏅 Hackathon Demonstration Walkthrough

1. **Landing Page:** Start as a signed-out visitor at `/`. Notice the product value proposition, live telemetry, and interactive preview.
2. **Guest Exploration:** Click **"Continue as Guest"**. Explore the feed, search by keyword (`Dijkstra`, `Cross-Entropy`), and notice the neutral **Guest learner** badge without the blue member checkmark.
3. **Persona Switcher:** Open the **"Persona"** dropdown in the top navigation:
   - Select **Sophia Patel (Student)**: Notice the blue circular member checkmark (`CheckCircle2`). Post a doubt or accept an answer with celebratory confetti.
   - Select **Dr. Marcus Vance (Faculty)**: Open the **Faculty Review Queue** (`/faculty`). Inspect unverified peer answers, click **"Review & Certify"**, add official feedback, and watch the emerald **Faculty Verified** badge appear!
4. **Unanswered Doubt Rescue:** Navigate to `/rescue`. View questions flagged with critical priority that escalated past the 12-hour mark, and observe the +15 reputation bounty.
5. **Knowledge Library:** Navigate to `/library` to explore permanent, categorized academic explanations.

---

## 📄 License
MIT License. Crafted for academic excellence and peer collaborative problem-solving.
