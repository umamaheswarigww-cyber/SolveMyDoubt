import { Course, Tag, Profile, Question, Answer, LeaderboardUser, RescueMetrics } from '../types/index';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-faculty-1',
    display_name: 'Dr. Marcus Vance',
    username: 'prof_vance',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Associate Professor of Computer Science & Algorithms. Research in distributed graph algorithms and cache-oblivious data structures.',
    department: 'Computer Science & Engineering',
    year_of_study: 'Faculty Member',
    interests: ['Algorithms', 'Data Structures', 'Graph Theory', 'Distributed Systems'],
    reputation: 2450,
    is_anonymous: false,
    role: 'faculty',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-faculty-2',
    display_name: 'Dr. Aris Thorne',
    username: 'dr_thorne',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead Instructor for Artificial Intelligence & Deep Learning. IEEE Senior Member.',
    department: 'Artificial Intelligence & Data Science',
    year_of_study: 'Faculty Member',
    interests: ['Machine Learning', 'Linear Algebra', 'Neural Networks', 'Optimization'],
    reputation: 3120,
    is_anonymous: false,
    role: 'faculty',
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-student-1',
    display_name: 'Sophia Patel',
    username: 'sophiacodes',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Junior CS major obsessed with competitive programming and database engine internals.',
    department: 'Computer Science',
    year_of_study: '3rd Year',
    interests: ['Algorithms', 'Dynamic Programming', 'PostgreSQL', 'Operating Systems'],
    reputation: 890,
    is_anonymous: false,
    role: 'student',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-student-2',
    display_name: 'Liam Zhang',
    username: 'liam_z',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Math & CS sophomore. Trying to intuitively understand backprop and convex analysis.',
    department: 'Mathematics & Computing',
    year_of_study: '2nd Year',
    interests: ['Linear Algebra', 'Calculus', 'Probability', 'Optimization'],
    reputation: 540,
    is_anonymous: false,
    role: 'student',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-student-3',
    display_name: 'Maya Al-Mansoor',
    username: 'maya_systems',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Systems geek, Linux enthusiast, Rust learner.',
    department: 'Computer Engineering',
    year_of_study: '4th Year',
    interests: ['Operating Systems', 'Concurrency', 'Networking', 'Compilers'],
    reputation: 1120,
    is_anonymous: false,
    role: 'student',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-cs101',
    name: 'Data Structures & Algorithms',
    course_code: 'CS-201',
    description: 'Asymptotic complexity, trees, heaps, dynamic programming, graph algorithms, and algorithmic paradigm design.',
    department: 'Computer Science',
    is_active: true,
    color: '#6366f1',
    icon: 'Binary',
    question_count: 42,
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
  },
  {
    id: 'course-ai301',
    name: 'Machine Learning & Neural Foundations',
    course_code: 'AI-301',
    description: 'Gradient descent, backpropagation, regularization, loss formulations, PyTorch fundamentals, and transformers.',
    department: 'Artificial Intelligence',
    is_active: true,
    color: '#8b5cf6',
    icon: 'BrainCircuit',
    question_count: 29,
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
  },
  {
    id: 'course-os202',
    name: 'Operating Systems & Concurrency',
    course_code: 'CS-204',
    description: 'Processes, threads, synchronization primitives, memory paging, virtual memory, and file systems.',
    department: 'Computer Science',
    is_active: true,
    color: '#06b6d4',
    icon: 'Cpu',
    question_count: 35,
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
  },
  {
    id: 'course-math102',
    name: 'Linear Algebra & Matrix Decompositions',
    course_code: 'MATH-102',
    description: 'Vector spaces, eigenvalues, eigenvectors, SVD, orthogonal projections, and principal components.',
    department: 'Mathematics',
    is_active: true,
    color: '#f59e0b',
    icon: 'Sigma',
    question_count: 24,
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
  },
  {
    id: 'course-db205',
    name: 'Database Engineering & ACID Internals',
    course_code: 'CS-305',
    description: 'Relational calculus, B-Tree indexes, WAL logging, MVCC, query optimization, and isolation levels.',
    department: 'Computer Science',
    is_active: true,
    color: '#10b981',
    icon: 'Database',
    question_count: 18,
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
  },
];

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag-1', name: 'Dynamic Programming', slug: 'dynamic-programming', category: 'Algorithms', description: 'Overlapping subproblems and optimal substructure problems', created_at: new Date().toISOString(), question_count: 16 },
  { id: 'tag-2', name: 'Graph Theory', slug: 'graph-theory', category: 'Algorithms', description: 'Trees, shortest paths, DAGs, cycle detection', created_at: new Date().toISOString(), question_count: 14 },
  { id: 'tag-3', name: 'Backpropagation', slug: 'backpropagation', category: 'Machine Learning', description: 'Chain rule computational graphs and gradients', created_at: new Date().toISOString(), question_count: 11 },
  { id: 'tag-4', name: 'PyTorch', slug: 'pytorch', category: 'Machine Learning', description: 'Tensors, autograd, custom layers, optimizers', created_at: new Date().toISOString(), question_count: 9 },
  { id: 'tag-5', name: 'Deadlocks', slug: 'deadlocks', category: 'Operating Systems', description: 'Mutexes, semaphores, race conditions, dining philosophers', created_at: new Date().toISOString(), question_count: 8 },
  { id: 'tag-6', name: 'Virtual Memory', slug: 'virtual-memory', category: 'Operating Systems', description: 'Page tables, TLB hits/misses, LRU page faults', created_at: new Date().toISOString(), question_count: 10 },
  { id: 'tag-7', name: 'Eigenvalues', slug: 'eigenvalues', category: 'Mathematics', description: 'Characteristic polynomials, spectral theorem, diagonalization', created_at: new Date().toISOString(), question_count: 7 },
  { id: 'tag-8', name: 'B-Tree Indexing', slug: 'b-tree-indexing', category: 'Databases', description: 'Clustered indexes, node splits, query plan scans', created_at: new Date().toISOString(), question_count: 6 },
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-rescue-urgent',
    author_id: 'user-student-2',
    course_id: 'course-ai301',
    title: 'Why does Cross-Entropy loss penalize confident wrong predictions exponentially compared to MSE?',
    body: `I am training a classification network with softmax output $p_i = \\frac{e^{z_i}}{\\sum_j e^{z_j}}$. 

When calculating the gradient with respect to logits $z_i$, Cross-Entropy loss is formulated as:
$$\\mathcal{L}_{CE} = -\\sum_{k=1}^C y_k \\log(p_k)$$

Why does using Mean Squared Error:
$$\\mathcal{L}_{MSE} = \\frac{1}{2}\\sum_{k=1}^C (y_k - p_k)^2$$
cause vanishing gradients during early training when a prediction is confident but completely wrong ($p_k \\approx 0$ when $y_k = 1$)?

Looking for both the mathematical derivation of $\\frac{\\partial \\mathcal{L}}{\\partial z_k}$ and an intuitive geometric explanation.`,
    difficulty: 'Intermediate',
    status: 'open',
    attachment_url: null,
    view_count: 142,
    upvotes: 18,
    downvotes: 0,
    score: 18,
    is_escalated: true,
    escalated_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    escalated_to_faculty_id: 'user-faculty-2',
    escalation_reason: 'Unanswered for > 18 hours. Complex mathematical loss function derivation needed.',
    rescue_priority: 'critical',
    accepted_answer_id: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 22 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    answers_count: 0,
    tags: [INITIAL_TAGS[2], INITIAL_TAGS[3]],
    author: INITIAL_PROFILES[3],
    course: INITIAL_COURSES[1],
  },
  {
    id: 'q-faculty-verified',
    author_id: 'user-student-1',
    course_id: 'course-cs101',
    title: 'How does Dijkstra algorithm fail with negative edge weights, and why does Johnson algorithm use reweighting?',
    body: `I understand that Dijkstra's algorithm uses a greedy approach where once a node $u$ is extracted from the priority queue, its distance $d[u]$ is considered finalized:
$$d[u] = \\min_{v \\in Q} d[v]$$

Can someone show a minimal concrete counterexample where Dijkstra fails with a negative edge, and explain how Johnson's algorithm uses Bellman-Ford node potentials $h(u)$ to construct new non-negative edge weights:
$$\\hat{w}(u, v) = w(u, v) + h(u) - h(v) \\ge 0$$
without altering the shortest path between any two vertices?`,
    difficulty: 'Advanced',
    status: 'resolved',
    attachment_url: null,
    view_count: 388,
    upvotes: 34,
    downvotes: 1,
    score: 33,
    is_escalated: false,
    escalated_at: null,
    escalated_to_faculty_id: null,
    escalation_reason: null,
    rescue_priority: 'normal',
    accepted_answer_id: 'ans-verified-1',
    resolved_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    answers_count: 2,
    tags: [INITIAL_TAGS[1]],
    author: INITIAL_PROFILES[2],
    course: INITIAL_COURSES[0],
  },
  {
    id: 'q-accepted-peer',
    author_id: 'user-student-3',
    course_id: 'course-os202',
    title: 'Why is double-checked locking broken in Java/C++ without memory barriers or volatile/atomic semantics?',
    body: `In multi-threaded programming, the double-checked locking idiom is often written like this:

\`\`\`cpp
// Classic attempt at thread-safe singleton
Singleton* getInstance() {
    if (instance == nullptr) { // 1st check (no lock)
        std::lock_guard<std::mutex> lock(mtx);
        if (instance == nullptr) { // 2nd check (with lock)
            instance = new Singleton();
        }
    }
    return instance;
}
\`\`\`

Why can another thread observe \`instance != nullptr\` while the object is only half-constructed? What instruction reordering happens at the CPU or compiler level, and how does \`std::atomic\` or Java \`volatile\` prevent this?`,
    difficulty: 'Intermediate',
    status: 'resolved',
    attachment_url: null,
    view_count: 215,
    upvotes: 27,
    downvotes: 0,
    score: 27,
    is_escalated: false,
    escalated_at: null,
    escalated_to_faculty_id: null,
    escalation_reason: null,
    rescue_priority: 'normal',
    accepted_answer_id: 'ans-peer-accepted',
    resolved_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    answers_count: 1,
    tags: [INITIAL_TAGS[4]],
    author: INITIAL_PROFILES[4],
    course: INITIAL_COURSES[2],
  },
  {
    id: 'q-rescue-urgent-2',
    author_id: 'user-student-2',
    course_id: 'course-db205',
    title: 'How does MVCC (Multi-Version Concurrency Control) handle Phantom Reads under Repeatable Read isolation?',
    body: `In PostgreSQL and MySQL InnoDB, Repeatable Read isolation prevents non-repeatable reads by taking a snapshot.

However, the SQL standard states that Repeatable Read may still allow **Phantom Reads** (where an insert by another transaction becomes visible in a range query):
$$\\text{Query 1: } \\text{SELECT } * \\text{ FROM students WHERE gpa} > 3.8;$$

Does Postgres use snapshot isolation to prevent phantoms completely under Repeatable Read, and why does MySQL require Next-Key Locks (Gap Locks)?`,
    difficulty: 'Advanced',
    status: 'open',
    attachment_url: null,
    view_count: 98,
    upvotes: 12,
    downvotes: 0,
    score: 12,
    is_escalated: true,
    escalated_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    escalated_to_faculty_id: null,
    escalation_reason: 'No responses within 14 hours. High academic value.',
    rescue_priority: 'urgent',
    accepted_answer_id: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    answers_count: 0,
    tags: [INITIAL_TAGS[7]],
    author: INITIAL_PROFILES[3],
    course: INITIAL_COURSES[4],
  },
];

export const INITIAL_ANSWERS: Answer[] = [
  {
    id: 'ans-verified-1',
    question_id: 'q-faculty-verified',
    author_id: 'user-student-3',
    body: `### 1. Minimal Counterexample for Dijkstra with Negative Weights

Consider 3 vertices $A, B, C$:
- Edge $(A, B)$ with weight $3$
- Edge $(A, C)$ with weight $5$
- Edge $(B, C)$ with weight $-4$

Starting at $A$:
1. $d[A] = 0, d[B] = \\infty, d[C] = \\infty$.
2. Pop $A$. Relax neighbors: $d[B] = 3$, $d[C] = 5$.
3. Next minimum in priority queue is $B$ with distance $3$. Pop $B$ and mark it **finalized**. Relax $(B, C)$: $d[C] = \\min(5, 3 + (-4)) = -1$.
4. Next minimum is $C$ with distance $-1$. Pop $C$.

Now imagine there was also an edge from $C$ back to some previously visited node with a very negative weight. Dijkstra's greedy invariant that "the first time a node is extracted from $Q$, its distance is optimal" holds **only** if edge weights are non-negative ($w(u, v) \\ge 0$). With negative edges, a future path could reduce the cost of an already finalized vertex!

### 2. Johnson's Algorithm Reweighting Intuition

Johnson's algorithm introduces an auxiliary node $s$ connected to all vertices with edge weight $0$. It runs Bellman-Ford once from $s$ to compute potential function $h(v) = \\delta(s, v)$ for each vertex $v$.

By triangle inequality, for every edge $(u, v)$:
$$h(v) \\le h(u) + w(u, v) \\implies w(u, v) + h(u) - h(v) \\ge 0$$

Define new edge weights:
$$\\hat{w}(u, v) = w(u, v) + h(u) - h(v)$$

For any path $p = \\langle v_0, v_1, \\dots, v_k \\rangle$:
$$\\hat{w}(p) = \\sum_{i=1}^k \\left( w(v_{i-1}, v_i) + h(v_{i-1}) - h(v_i) \\right) = w(p) + h(v_0) - h(v_k)$$

Notice that $h(v_0) - h(v_k)$ is a telescoping sum that depends **only on the start and end vertices**! Therefore, any path that minimizes $\\hat{w}(p)$ also minimizes $w(p)$! All edge weights $\\hat{w}$ are non-negative, allowing all-pairs shortest paths using Dijkstra $|V|$ times in $O(V^2 \\log V + VE)$ time!`,
    is_accepted: true,
    accepted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    verified_by: 'user-faculty-1',
    verified_at: new Date(Date.now() - 1.5 * 86400000).toISOString(),
    faculty_feedback: 'Outstanding explanation. The telescoping sum demonstration is rigorous and provides clear intuition for students preparing for algorithmic exams.',
    explanation_mode: 'step-by-step',
    upvotes: 41,
    downvotes: 0,
    score: 41,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1.5 * 86400000).toISOString(),
    author: INITIAL_PROFILES[4],
    verifier: INITIAL_PROFILES[0],
    comments: [
      {
        id: 'comm-1',
        author_id: 'user-student-1',
        question_id: null,
        answer_id: 'ans-verified-1',
        body: 'The telescoping sum explanation made Johnson algorithm click instantly for me! Thank you!',
        parent_comment_id: null,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        author: INITIAL_PROFILES[2],
      }
    ]
  },
  {
    id: 'ans-peer-accepted',
    question_id: 'q-accepted-peer',
    author_id: 'user-student-1',
    body: `### Why Double-Checked Locking is Broken Without Memory Fences

The fundamental issue is that object allocation is **not atomic**.

When you write:
\`\`\`cpp
instance = new Singleton();
\`\`\`

The compiler and processor execute three distinct steps:
1. **Allocate raw memory** for \`Singleton\` (e.g. at address \`0x1000\`).
2. **Execute constructor** \`Singleton::Singleton()\` to initialize fields in memory.
3. **Assign pointer** \`instance = 0x1000\`.

#### The Reordering Hazard
Modern CPUs and optimizing compilers are permitted to reorder instructions as long as single-threaded observable behavior doesn't change! They can reorder steps 2 and 3:
1. Allocate memory.
2. Assign \`instance = 0x1000\` (**instance is now non-null!**).
3. Execute constructor.

If Thread B calls \`getInstance()\` right after step 2, the first check \`instance == nullptr\` evaluates to **false** without acquiring the lock! Thread B immediately returns \`instance\` and attempts to read its member variables **while Thread A is still executing the constructor**!

#### The Fix in Modern C++ (C++11+)
In modern C++, static local initialization is guaranteed to be thread-safe by the standard ("Meyers' Singleton"):
\`\`\`cpp
Singleton& getInstance() {
    static Singleton instance; // Thread-safe guaranteed by C++11 runtime
    return instance;
}
\`\`\`

Or using \`std::atomic<Singleton*>\` with acquire-release memory orders:
\`\`\`cpp
std::atomic<Singleton*> instance{nullptr};
std::mutex mtx;

Singleton* getInstance() {
    Singleton* p = instance.load(std::memory_order_acquire);
    if (!p) {
        std::lock_guard<std::mutex> lock(mtx);
        p = instance.load(std::memory_order_relaxed);
        if (!p) {
            p = new Singleton();
            instance.store(p, std::memory_order_release);
        }
    }
    return p;
}
\`\`\`
The \`release\` store ensures that the constructor writes become visible before the pointer update!`,
    is_accepted: true,
    accepted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    verified_by: null,
    verified_at: null,
    faculty_feedback: null,
    explanation_mode: 'practical',
    upvotes: 22,
    downvotes: 0,
    score: 22,
    created_at: new Date(Date.now() - 2.5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    author: INITIAL_PROFILES[2],
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  {
    id: 'user-faculty-2',
    display_name: 'Dr. Aris Thorne',
    username: 'dr_thorne',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Artificial Intelligence & Data Science',
    reputation: 3120,
    accepted_answers_count: 58,
    total_answers_count: 74,
    verified_answers_count: 46,
    rank: 1,
    badge: 'Master Scholar',
    is_anonymous: false,
  },
  {
    id: 'user-faculty-1',
    display_name: 'Dr. Marcus Vance',
    username: 'prof_vance',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    reputation: 2450,
    accepted_answers_count: 42,
    total_answers_count: 55,
    verified_answers_count: 38,
    rank: 2,
    badge: 'Senior Faculty',
    is_anonymous: false,
  },
  {
    id: 'user-student-3',
    display_name: 'Maya Al-Mansoor',
    username: 'maya_systems',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Engineering',
    reputation: 1120,
    accepted_answers_count: 19,
    total_answers_count: 28,
    verified_answers_count: 8,
    rank: 3,
    badge: 'Distinguished Peer',
    is_anonymous: false,
  },
  {
    id: 'user-student-1',
    display_name: 'Sophia Patel',
    username: 'sophiacodes',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science',
    reputation: 890,
    accepted_answers_count: 14,
    total_answers_count: 22,
    verified_answers_count: 5,
    rank: 4,
    badge: 'Top Contributor',
    is_anonymous: false,
  },
  {
    id: 'user-student-2',
    display_name: 'Liam Zhang',
    username: 'liam_z',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Mathematics & Computing',
    reputation: 540,
    accepted_answers_count: 8,
    total_answers_count: 15,
    verified_answers_count: 2,
    rank: 5,
    badge: 'Rising Star',
    is_anonymous: false,
  },
];

export const INITIAL_RESCUE_METRICS: RescueMetrics = {
  totalUnanswered: 8,
  urgentCount: 3,
  criticalCount: 2,
  escalatedToFaculty: 4,
  avgResolutionTimeHours: 3.4,
  rescueSuccessRatePercent: 91.2,
};
