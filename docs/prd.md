# AlgoScope — Product Requirements Document (PRD)

> **Version:** 1.1
> **Date:** 2026-10-11
> **Author:** Malay (Product Owner) + AI Assistant (Facilitator)
> **Status:** Refined & Aligned — Ready for Epic Decomposition & Architecture

---

## 1. Executive Summary

**AlgoScope** is a personal DSA (Data Structures & Algorithms) learning platform that materializes algorithm implementations into interactive visualizations, animations, and mini-applications. Unlike traditional coding challenge platforms (LeetCode, HackerRank), AlgoScope focuses on **pattern recognition** across DSA topics by making algorithms tangible and visual.

The platform serves as both a comprehensive learning tool and a full-stack engineering workout — the owner builds the platform themselves. Agentic AI generates scaffolding, styling, and base layout while leaving deliberate **TODO blocks** for the owner to implement both:

1. **Python Backend Logic:** DSA algorithms, step/frame generator yields, test suites, and data models.
2. **TypeScript Frontend Logic:** Animation hooks, canvas render adapters (translating backend frames to visual state), state machines, and typed API contracts.

DSA problem-solving happens in the Python backend; the TypeScript frontend brings those algorithms to life, giving the owner hands-on experience in both ecosystems.

---

## 2. Problem Statement

### The Pain

- DSA study feels abstract and disconnected from real software engineering
- Pattern recognition across topics (sliding window, two pointers, BFS/DFS, etc.) doesn't develop through isolated problem-solving
- Existing platforms (LeetCode, NeetCode) focus on "solve and move on" — no visualization of what algorithms actually do
- No before/after measurement of understanding improvement
- Learning TypeScript, Python, and DSA simultaneously lacks a unifying project

### The Opportunity

Build a platform where:

1. **Every DSA concept has a visual output** — implementing Dijkstra's means seeing pathfinding animate on a grid
2. **Pattern recognition is the primary goal** — not just solving problems, but recognizing which pattern to apply
3. **The building process itself is the learning** — TypeScript for frontend, Python for backend, DSA for algorithm logic
4. **Progress is measurable** — before/after assessments for each topic

---

## 3. Target User

**Primary:** The project owner (Malay) — single user, personal learning tool.

**User Profile:**

- Comfortable with Python basics, wants to advance to intermediate/advanced (generators, decorators, dataclasses, type hints, collections)
- Strong JavaScript knowledge, new to TypeScript — wants to learn TS patterns through real usage
- Intermediate DSA — can solve easy/medium problems but struggles with cross-topic pattern recognition
- Wants structured, measurable progress tracking
- Prefers guided learning (hints, not solutions) over passive consumption

---

## 4. Core Features

### 4.1 Topic Hub (Home)

- Landing page with 14 DSA topic cards
- Topics sorted by difficulty
- Visual progress indicators per topic (not started → in progress → mastered)
- Quick-access to dashboard

### 4.2 Dashboard

- Progress overview across all topics
- Pre-exercise vs post-exercise score comparisons
- Practice streak tracking
- Pattern recognition rate over time
- Code quality trend
- Topic mastery levels (beginner → intermediate → advanced)
- Complexity analysis accuracy trend

### 4.3 Topic Pages (14 topics)

Each topic has a tailored mix of the following sub-pages:

#### 4.3.1 Overview / Inspiration

- Where this pattern/data structure appears in real systems
- Interactive diagrams explaining the concept
- No coding required — purely educational
- Examples: "How Redis uses LRU caches", "How Google Maps finds shortest paths"

#### 4.3.2 Interactive Demos

- **Owner implements the algorithm on the backend** (TODO blocks in Python)
- Frontend visualizes the algorithm's execution
- Examples: Dijkstra's pathfinding grid, tree traversal animation, sorting algorithm race
- Visualization libraries: React Flow (graphs), D3.js (data viz), Framer Motion (animations)

#### 4.3.3 Mini-Projects

- Full functional mini-applications powered by DSA concepts
- Frontend is fully built; backend has TODO logic
- Examples: Task scheduler (priority queues), autocomplete search (tries), social network feed (graphs)

#### 4.3.4 Pattern Cheat Sheet

- Quick reference card for the topic's key patterns
- When to use each pattern
- Time/space complexity quick reference
- Common pitfalls

#### 4.3.5 Problems (sorted by difficulty)

- Individual problem pages within each topic
- Problems link between topics when patterns overlap
- Each problem has: description, real-world context, TODO backend logic, TODO tests

### 4.4 Assessment System

- **Pre-assessment grill** before each new topic (agent asks questions to gauge understanding)
- **Post-assessment** after completing a topic's implementations
- Metrics tracked: conceptual understanding, pattern recognition, complexity analysis accuracy
- Results stored for before/after comparison

### 4.5 Authentication (OAuth)

- Full OAuth integration (NextAuth.js)
- This is itself a **learning exercise** — owner implements it with guidance, not generated code
- Protects the personal instance

### 4.6 Future: Revision Catalogue

- Links to relevant LeetCode/NeetCode problems per pattern
- Serves as a revision tool after all topics are completed
- Not in initial scope — built last

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer          | Technology                           | Notes                           |
| -------------- | ------------------------------------ | ------------------------------- |
| Frontend       | Next.js + TypeScript                 | App Router, SSR/SSG             |
| UI Components  | shadcn/ui + Tailwind CSS             | Copy-paste, fully customizable  |
| Visualizations | React Flow + D3.js + Framer Motion   | Right tool per topic            |
| Backend        | FastAPI + Python                     | Async, type hints, OpenAPI docs |
| Database       | SQLite + SQLAlchemy                  | Zero-setup, file-based          |
| Auth           | NextAuth.js (OAuth)                  | Owner-implemented exercise      |
| Testing        | pytest (backend) + Vitest (frontend) | Test-first approach             |

### 5.2 Repository Structure

```
algoscope/                          # Monorepo root
├── .bmad-core/                     # BMAD method configuration
│   ├── docs/                       # PRD, architecture, briefs
│   └── stories/                    # Epic and story files
├── frontend/                       # Next.js + TypeScript
│   ├── app/                        # App Router pages
│   │   ├── page.tsx                # Landing / Topic Hub
│   │   ├── dashboard/
│   │   ├── topics/
│   │   │   └── [topicSlug]/
│   │   │       ├── page.tsx        # Topic overview
│   │   │       ├── demos/
│   │   │       ├── projects/
│   │   │       ├── patterns/
│   │   │       └── problems/
│   │   │           └── [problemSlug]/
│   │   └── api/                    # Next.js API routes (proxy)
│   ├── components/
│   │   ├── ui/                     # shadcn base components
│   │   ├── layout/                 # Nav, sidebar, footer
│   │   ├── dashboard/              # Dashboard widgets
│   │   └── visualizations/         # D3.js, React Flow, Framer Motion
│   ├── lib/                        # Utilities, API client, hooks
│   ├── types/                      # TypeScript type definitions
│   └── public/                     # Static assets
├── backend/                        # FastAPI + Python
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── api/                    # API route handlers
│   │   │   ├── topics.py
│   │   │   ├── problems.py
│   │   │   ├── assessments.py
│   │   │   └── progress.py
│   │   ├── core/                   # Config, security, dependencies
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── services/               # Business logic services
│   │   └── dsa/                    # DSA implementations (OWNER'S CODE)
│   │       ├── __init__.py
│   │       ├── arrays/             # Arrays & Strings problems
│   │       ├── hashing/            # Hashing & Sets problems
│   │       ├── linked_lists/
│   │       ├── stacks_queues/
│   │       ├── trees/
│   │       ├── graphs/
│   │       ├── dp/                 # Dynamic Programming
│   │       ├── greedy/
│   │       ├── binary_search/
│   │       ├── backtracking/
│   │       ├── heaps/
│   │       ├── tries/
│   │       ├── sorting/
│   │       └── bit_manipulation/
│   └── tests/                      # Test files (OWNER'S TESTS)
│       └── dsa/                    # Mirrors backend/app/dsa/
├── docs/                           # Project documentation
│   ├── prd.md                      # This file
│   ├── architecture.md             # Technical architecture doc
│   └── topic-plans/                # Per-topic content plans
├── package.json                    # Monorepo root config
└── README.md
```

### 5.3 API Design (High-Level)

```
# Topics
GET    /api/topics                     # List all topics with progress
GET    /api/topics/{slug}              # Topic detail with sub-pages
GET    /api/topics/{slug}/problems     # Problems for a topic

# Problems
GET    /api/problems/{id}              # Problem detail
POST   /api/problems/{id}/run          # Execute solution against tests
POST   /api/problems/{id}/validate     # Validate solution correctness

# DSA Execution
POST   /api/dsa/{topic}/{problem}/execute  # Run DSA algorithm, return visualization data

# Progress & Assessment
GET    /api/progress                   # Overall progress dashboard data
GET    /api/progress/{topic}           # Topic-specific progress
POST   /api/assessments                # Submit assessment results
GET    /api/assessments/{topic}        # Get assessment history for topic

# Auth
GET    /api/auth/[...nextauth]         # NextAuth.js handlers
```

### 5.4 Database Schema (High-Level)

```
topics
  - id, slug, name, description, difficulty_order, icon

problems
  - id, topic_id, slug, title, description, difficulty, pattern_tags
  - real_world_context, hints (JSON), solution_template

progress
  - id, topic_id, problem_id, status, attempts, hints_used
  - time_spent, completed_at

assessments
  - id, topic_id, type (pre/post), scores (JSON)
  - pattern_recognition_score, complexity_accuracy_score
  - conceptual_understanding_score, created_at

streaks
  - id, date, problems_completed, topics_worked_on
```

---

## 6. Agent Interaction Model

### 6.1 What the Agent Generates (Boilerplate & Scaffolding)

- Project structure, configs, package files, linters (`ruff`, `eslint`, `prettier`)
- Base layout, responsive containers, standard UI controls (buttons, modals, sliders, toolbars, playback controls)
- API client transport boilerplate and FastAPI route signatures
- Database models and Alembic migrations
- Canvas boilerplate (rendering container shells, SVG/Canvas viewports)
- Test harness structure and pre-assessment question bank

### 6.2 What the Owner Implements (TODO Blocks)

The owner practices **both Python and TypeScript engineering** across every topic:

#### A. Backend (Python):

- **All DSA algorithm logic** (core pattern solution)
- **Step/Frame Yields** — instrumenting algorithms to yield execution states (`Frame(state=..., highlights=..., log=...)`)
- **Pytest unit & edge-case test suites** (test-first discipline)
- **Data models & schemas** where marked for type exploration

#### B. Frontend (TypeScript):

- **Frame Consumption & State Reducers**: Writing the TS reducer/hook (e.g. `useAlgorithmPlayback`) mapping backend frame events into visual component state.
- **Canvas Render Logic & Adapters**: Implementing the component logic that transforms frame data into D3 SVG elements, Framer Motion animators, or React Flow nodes/edges.
- **TypeScript Domain Types & Discriminated Unions**: Defining strict type contracts for topic-specific frames, actions, and event states (e.g., `type AlgorithmFrame = WindowFrame | TreeFrame | GraphFrame`).
- **Mini-App Interactive Feature Logic**: Core client-side interactions (e.g., queue dispatchers, priority event listeners, grid click interactions).
- **OAuth integration** — guided, not generated; foundational auth learning exercise.

### 6.3 Agent Behavior During Learning

1. **Grill-first**: Before generating ANY code for a new topic, assess understanding through questions
2. **Guide, don't solve**: When stuck, help the owner figure it out themselves
3. **Dual-Stack Review**: After implementation, review both Python backend code and TypeScript frontend components for correctness, idiomatic patterns, type safety, and clean separation of concerns
4. **Suggest experiments**: After scaffolding, suggest ways to experiment with the generated code
5. **Track everything**: Record all assessments, reviews, and progress to files in the repo

### 6.4 TODO Block Format (Configurable — TBD after first attempt)

Options to try:

- **Full skeleton**: Types, function signatures, docstrings, test structure, `# TODO` blocks
- **Minimal stubs**: Just function name and one-line comment
- **Guided TODO**: Hints about pattern, complexity targets, edge cases
- **Progressive reveal**: Start minimal, request hints at levels

---

## 7. DSA Topics & Difficulty Order

| Order | Topic                     | Difficulty | Key Patterns                                                          |
| ----- | ------------------------- | ---------- | --------------------------------------------------------------------- |
| 1     | Arrays & Strings          | ⭐         | Sliding window, two pointers, prefix sums, Kadane's                   |
| 2     | Hashing & Sets            | ⭐         | Frequency maps, anagram detection, two-sum patterns                   |
| 3     | Binary Search             | ⭐⭐       | On answer, rotated arrays, search space reduction                     |
| 4     | Sorting & Searching       | ⭐⭐       | Merge sort applications, quickselect                                  |
| 5     | Linked Lists              | ⭐⭐       | Fast/slow pointers, reversal, merge patterns                          |
| 6     | Stacks & Queues           | ⭐⭐       | Monotonic stack, next greater element, BFS patterns                   |
| 7     | Heaps & Priority Queues   | ⭐⭐       | Top-K, merge K sorted, median finding                                 |
| 8     | Recursion & Backtracking  | ⭐⭐⭐     | Permutations, subsets, N-queens, constraint satisfaction              |
| 9     | Trees & BSTs              | ⭐⭐⭐     | DFS, BFS, path problems, LCA, serialization                           |
| 10    | Greedy Algorithms         | ⭐⭐⭐     | Interval scheduling, Huffman, activity selection                      |
| 11    | Graphs                    | ⭐⭐⭐⭐   | BFS/DFS, topological sort, shortest path, union-find, cycle detection |
| 12    | Tries & String Algorithms | ⭐⭐⭐⭐   | Prefix matching, KMP, Rabin-Karp                                      |
| 13    | Dynamic Programming       | ⭐⭐⭐⭐⭐ | 1D, 2D, knapsack, LCS, interval DP, bitmask DP                        |
| 14    | Bit Manipulation          | ⭐⭐⭐     | XOR tricks, bitmasks, power of 2 patterns                             |

---

## 8. Content Type Matrix & Topic Blueprint

Every one of the 14 DSA topics features a complete quad-layer curriculum, ensuring both Python algorithmic depth and TypeScript visualization mastery:

| Content Type                  | Description                                                                        | Frontend Architecture                                                                 | Backend Architecture                          | Ownership Split                                       |
| ----------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| **Educational & Inspiration** | Real-world applications, historical context, interactive diagrams                  | Agent-built Markdown + SVG diagrams                                                   | Minimal static metadata API                   | Agent: 90% / Owner: 10% (Exploration)                 |
| **Interactive Demo**          | Algorithmic step-by-step frame visualizer                                          | Agent provides canvas shell; **Owner implements TS frame adapter/hook**               | **Owner implements algorithm + yield frames** | **Owner: Dual-Stack (Python algo + TS adapter)**      |
| **Mini-App**                  | Functional application powered by DSA (e.g. LRU cache, OS scheduler, Autocomplete) | Agent provides app shell & layout; **Owner implements TS client state & UI triggers** | **Owner implements backend DSA service**      | **Owner: Dual-Stack (Python service + TS app logic)** |
| **Pattern Cheat Sheet**       | Quick reference of patterns, constraints, complexities, pitfalls                   | Agent-built interactive cards                                                         | Static content API                            | Agent: 100%                                           |
| **Curated Problems (3-5)**    | Problems ranging Easy to Hard with edge cases                                      | Agent provides runner UI & test reporter                                              | **Owner implements solution + pytest suites** | **Owner: 100% Code & Test**                           |

### 8.1 The 14 Topics Matrix & Mini-App Blueprint

| Order | Topic                         | Difficulty | Key Patterns                                                  | Primary Visualization Style & Tech                            | Dedicated Mini-App Concept                                                                  |
| ----- | ----------------------------- | ---------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1     | **Arrays & Strings**          | ⭐         | Sliding window, two pointers, prefix sums, Kadane's           | Pointer cursors, window bounds _(Framer Motion)_              | **Traffic Anomaly Monitor**: Sliding window rate-limiter & max surge detector               |
| 2     | **Hashing & Sets**            | ⭐         | Frequency maps, anagram detection, two-sum, bucket collisions | Hash bucket grid, collision chains _(SVG / D3)_               | **In-Memory Cache & TTL Store**: Visual key-value store with LRU eviction                   |
| 3     | **Binary Search**             | ⭐⭐       | Search on answer, rotated arrays, space reduction             | Interval elimination curtain _(Framer Motion)_                | **Financial Tick Root Finder**: Boundary condition locator in order book ticks              |
| 4     | **Sorting & Searching**       | ⭐⭐       | Merge sort, quickselect, partition pivots                     | Height comparison race, partition stack _(D3.js)_             | **Live Leaderboard Ranker**: Real-time streaming score sorter & percentile calculator       |
| 5     | **Linked Lists**              | ⭐⭐       | Fast/slow pointers, reversal, merge patterns                  | Pointer relinking animation, race track _(React Flow)_        | **Undo/Redo History Ribbon**: Editor transaction ribbon with cycle detection                |
| 6     | **Stacks & Queues**           | ⭐⭐       | Monotonic stack, next greater element, BFS queues             | Monotonic histogram bars, cylinder chambers _(Framer Motion)_ | **Expression Calculator & Bracket Linter**: Real-time math syntax tree evaluator            |
| 7     | **Heaps & Priority Queues**   | ⭐⭐       | Top-K, merge K sorted, median finding                         | Binary tree synced with array indices _(React Flow + D3)_     | **OS Job Scheduler**: Real-time CPU task priority dispatcher                                |
| 8     | **Recursion & Backtracking**  | ⭐⭐⭐     | Permutations, subsets, N-queens, pruning                      | Decision tree with branch scissor-cut _(React Flow)_          | **Interactive Sudoku & Maze Solver**: Visual state-space search with constraint propagation |
| 9     | **Trees & BSTs**              | ⭐⭐⭐     | DFS pre/in/post, BFS level order, LCA, serialization          | Tree traversal highlight waves _(React Flow)_                 | **Hierarchical File Size Visualizer**: Disk space analyzer with tree rebalancing            |
| 10    | **Greedy Algorithms**         | ⭐⭐⭐     | Interval scheduling, Huffman, activity selection              | Gantt timeline conflict bars, fractional filling _(D3 Gantt)_ | **Meeting Room Booking Engine**: Visual conference scheduler maximizing bookings            |
| 11    | **Graphs**                    | ⭐⭐⭐⭐   | BFS/DFS, topological sort, Dijkstra, Union-Find               | Node-link graph with wavefront expansion _(React Flow)_       | **Transit Route Pathfinder**: Subway route planner with live delays & transfers             |
| 12    | **Tries & String Algorithms** | ⭐⭐⭐⭐   | Prefix matching, KMP, Rabin-Karp                              | Prefix radial tree, cursor step-through _(React Flow / D3)_   | **Typeahead Autocomplete & Spellchecker**: Predictive search box with trie lookup           |
| 13    | **Dynamic Programming**       | ⭐⭐⭐⭐⭐ | 1D, 2D, knapsack, LCS, interval DP                            | 2D memo grid with cell pull arrows _(Custom Grid + Framer)_   | **Cart Discount Optimizer**: Knapsack coupon optimizer with path recovery                   |
| 14    | **Bit Manipulation**          | ⭐⭐⭐     | Bitmasking, XOR cancellation, power of 2                      | Interactive register bit-switches _(Tailwind + Framer)_       | **RPG Permission Bitmask Matrix**: Player role capabilities & buff/debuff manager           |

---

## 9. Progress Metrics Specification

### 9.1 Pre/Post Assessment Scores (per topic)

- **Conceptual Understanding** (0-10): Can you explain the data structure / algorithm?
- **Pattern Recognition** (0-10): Can you identify which pattern to use for a problem?
- **Complexity Analysis** (0-10): Can you correctly state time/space complexity?

### 9.2 Per-Problem Metrics

- Hints needed (count)
- Attempts before correct solution (count)
- Code quality score (agent review: 0-10)

### 9.3 Aggregate Metrics

- Practice streak (consecutive days)
- Topic mastery level (beginner → intermediate → advanced)
- Overall pattern recognition accuracy (% correct first-attempt pattern identification)

---

## 10. Development Phases

### Phase 1: Foundation

**Goal:** Project setup, basic navigation, OAuth (owner exercise)

- Monorepo structure (Next.js + FastAPI + SQLite)
- BMAD setup and configuration
- Landing page with topic hub (placeholder cards)
- Dashboard shell (empty, ready for data)
- OAuth integration (owner-implemented, guided)
- Database models and initial migration
- Basic API scaffolding

### Phase 2: First Topic — Arrays & Strings

**Goal:** Complete end-to-end flow for one topic

- Pre-assessment grill session
- Educational/inspirational page (agent-built)
- Generate scaffolding with TODO blocks for 3-5 problems
- Owner implements tests + algorithm logic
- Agent code review + improvement suggestions
- Interactive visualization (e.g., sliding window animation)
- Post-assessment + progress tracking
- Dashboard populated with real data

### Phase 2: Dual Archetypes — Arrays & Strings (Linear) + Graphs (Network)

**Goal:** Complete end-to-end flow for the two foundation archetypes:

1. **Topic 1 (Arrays & Strings)**: Linear canvas, sliding window animation, rate-limiter mini-app.
2. **Topic 11 (Graphs)**: Node-link canvas, BFS/DFS & Dijkstra wavefront, transit pathfinder mini-app.

- Pre-assessment grill session for each
- Educational/inspirational page (agent-built)
- Generate scaffolding with TODO blocks for 3-5 problems (Python logic + Pytest test suites)
- Frontend TODO blocks: TypeScript frame reducer + canvas render adapters
- Owner implements tests + algorithm logic + TypeScript adapters
- Agent dual-stack code review + improvement suggestions
- Interactive visualization & dedicated mini-app
- Post-assessment + progress tracking
- Dashboard populated with real multi-topic metrics

### Phase 3: Scale Remaining Topics

**Goal:** Build out remaining 12 topics

- Each follows the validated Phase 2 dual-stack cycle
- Progressive difficulty order
- Cross-topic pattern linking and comparative benchmarks

### Phase 4: Polish & Revision

**Goal:** Finalize platform

- Dashboard with full metrics + charts
- LeetCode/NeetCode link catalog per pattern
- Spaced repetition / revision scheduling
- UI polish and responsive design

---

## 11. Non-Functional Requirements

- **Performance:** Pages load under 2 seconds locally
- **Responsiveness:** Works on desktop (primary) and tablet
- **Accessibility:** Basic a11y (semantic HTML, keyboard navigation)
- **Code Quality:** ESLint + Prettier (frontend), Ruff (backend), strict TypeScript
- **Data Persistence:** All progress, assessments, code reviews stored in SQLite
- **Session Independence:** All context stored in repo files (BMAD artifacts, docs). No dependency on any single AI session's memory.

---

## 12. Success Criteria

1. Owner can complete all 14 DSA topics with measurable improvement in pattern recognition
2. Each topic has at least one interactive visualization and a dedicated mini-app driven by owner-implemented backend and frontend logic
3. Dashboard shows clear before/after improvement metrics
4. Owner gains practical TypeScript proficiency through custom hooks, state reducers, and canvas render adapters
5. Owner advances Python skills to intermediate level through generator-based frame yields, typing, and backend services
6. The entire process is documented in BMAD artifacts, reproducible across sessions

---

## 13. Resolved Architectural & Design Decisions

1. **Rollout Archetype Selection**: **Iterative (Option A)** — Phase 2 builds Topic 1 (Arrays & Strings: Linear Canvas) and Topic 11 (Graphs: React Flow Network Canvas) first as architectural reference implementations before scaling.
2. **Algorithm Execution Protocol**: **Deterministic HTTP Batch (Option A)** — Python algorithms yield `Frame` objects returned as a structured array (`Frame[]`) enabling smooth bi-directional timeline scrubbing and inspection.
3. **Mini-App Scope**: **All 14 Topics** get their own dedicated real-world mini-applications (e.g., Cache, Scheduler, Autocomplete, Pathfinder).
4. **Dual-Stack Learning Ownership**: The owner writes **both** Python backend algorithmic logic/tests AND TypeScript frontend frame reducers/canvas adapters/app triggers.
5. **Content Scope per Topic**: Standardized to 3-5 curated problems covering Easy, Medium, and edge-case variants.
6. **Assessment Authoring**: Agent dynamically creates and administers the pre/post grill assessment questions, logging results to SQLite.
