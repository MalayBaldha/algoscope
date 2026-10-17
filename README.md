<div align="center">

# ⚡ AlgoScope

**Materialize Data Structures & Algorithms into Living, Interactive Code**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy_2.0-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlalchemy.org/)

<p align="center">
  A full-stack learning platform bridging algorithmic problem solving with production engineering.<br />
  Turn abstract DSA concepts into deterministic step-by-step visualizations and real-world mini-applications.
</p>

</div>

---

## 🧭 Why AlgoScope?

Traditional coding challenge platforms (LeetCode, HackerRank) optimize for *"solve, submit, and move on"*, leaving algorithmic execution abstract and disconnected from tangible software systems.

**AlgoScope** rethinks how algorithms are mastered:
- 👁️ **Visual & Tangible**: Every algorithm yields an event-sourced timeline of step frames (`Frame[]`), powering interactive scrubbing, variable inspection, and animated visualizers.
- 🧩 **Pattern Recognition Over Memorization**: Focus on cross-topic patterns (two pointers, sliding windows, monotonic stacks, topological ordering, divide-and-conquer) rather than isolated trick questions.
- 💻 **Dual-Stack Engineering Workout**:
  - **Python Backend**: Solve algorithmic logic, yield execution step frames, and author strict unit/edge-case `pytest` suites.
  - **TypeScript Frontend**: Implement deterministic timeline playback hooks, canvas render adapters (SVG, Framer Motion, React Flow), and state reducers.
- 🚀 **14 Real-World Mini-Apps**: Every topic culminates in a practical, production-style mini-application powered by that data structure or algorithm.

---

## 🗺️ The 14 DSA Topics & Mini-App Blueprint

| # | Topic | Difficulty | Key Algorithmic Patterns | Dedicated Mini-App |
|:---:|---|:---:|---|---|
| **1** | **Arrays & Strings** | ⭐ | Sliding window, two pointers, prefix sums, Kadane's | **Traffic Anomaly Monitor** (rate limiter & surge detector) |
| **2** | **Hashing & Sets** | ⭐ | Frequency maps, collision chains, anagram detection | **In-Memory Cache & TTL Store** (LRU cache visualizer) |
| **3** | **Binary Search** | ⭐⭐ | Search on answer, rotated arrays, space reduction | **Order Book Peak Finder** (financial tick boundary locator) |
| **4** | **Sorting & Searching** | ⭐⭐ | Merge sort, quickselect, partition pivots | **Live Leaderboard Ranker** (streaming percentile tracker) |
| **5** | **Linked Lists** | ⭐⭐ | Fast/slow pointers, list reversal, merge patterns | **Undo/Redo History Ribbon** (editor transaction stack) |
| **6** | **Stacks & Queues** | ⭐⭐ | Monotonic stack, next greater element, BFS queues | **Expression Calculator** (syntax tree & bracket validator) |
| **7** | **Heaps & Priority Queues** | ⭐⭐ | Top-K, merge K sorted, running median | **OS Task Scheduler** (priority CPU dispatcher) |
| **8** | **Recursion & Backtracking** | ⭐⭐⭐ | Permutations, subsets, constraint pruning | **Interactive Sudoku & Maze Solver** (branch-pruning visualizer) |
| **9** | **Trees & BSTs** | ⭐⭐⭐ | DFS pre/in/post order, BFS level order, LCA | **Hierarchical File Size Analyzer** (tree rebalancer) |
| **10** | **Greedy Algorithms** | ⭐⭐⭐ | Interval scheduling, Huffman coding, activity selection | **Conference Room Booking Engine** (meeting timeline optimizer) |
| **11** | **Graphs** | ⭐⭐⭐⭐ | BFS/DFS, topological sort, Dijkstra, Union-Find | **Transit Route Pathfinder** (subway router with live delay costs) |
| **12** | **Tries & String Matching** | ⭐⭐⭐⭐ | Prefix search, KMP, Rabin-Karp | **Typeahead Autocomplete & Spellchecker** (predictive search box) |
| **13** | **Dynamic Programming** | ⭐⭐⭐⭐⭐ | 1D/2D memoization, knapsack, LCS, interval DP | **Checkout Discount Optimizer** (coupon knapsack with path recovery) |
| **14** | **Bit Manipulation** | ⭐⭐⭐ | Bitmasking, XOR cancellation, power of 2 flags | **RPG Permission Matrix** (character buff & role bitfield toggle) |

---

## 🏛️ System Architecture

AlgoScope is architected as an **Event-Sourced Batch Execution System**:

```
                       ┌────────────────────────────────────────┐
                       │          Next.js Frontend (TS)         │
                       │  - useAlgorithmPlayback state machine  │
                       │  - Canvas Adapters (Framer, ReactFlow) │
                       │  - Topic Hub & Personal Dashboard      │
                       └───────────────────▲────────────────────┘
                                           │
                                  HTTP Batch Response
                                  [Frame[], Metrics]
                                           │
                       ┌───────────────────┴────────────────────┐
                       │          FastAPI Backend (Py)          │
                       │  - Generator Functions: yield Frame    │
                       │  - Problem Validation & Pytest Suites  │
                       │  - SQLite / SQLAlchemy Persistence     │
                       └────────────────────────────────────────┘
```

### The `Frame` Protocol Contract
Algorithms do not write arbitrary animations. Instead, the Python backend yields an immutable sequence of step frames:

```json
{
  "step": 4,
  "phase": "shrink_window",
  "state": { "array": [2, 1, 5, 1, 3, 2], "current_sum": 7 },
  "pointers": { "left": 1, "right": 4 },
  "highlights": [{ "indices": [1, 2, 3, 4], "color": "primary", "label": "valid window" }],
  "explanation": "Sum exceeds threshold. Advancing left pointer to shrink window."
}
```

The frontend playback hook (`useAlgorithmPlayback`) consumes these frames, enabling deterministic play, pause, bi-directional stepping, speed throttling, and instant timeline scrubbing without animation lag.

---

## 📁 Repository Structure

```
algoscope/
├── package.json                    # Monorepo task orchestrator
├── docs/                           # Living PRD & technical architecture
│   ├── prd.md                      # Product Requirements Document (v1.1)
│   └── architecture.md             # Technical Architecture & Invariants
├── frontend/                       # Next.js 14 App Router + TypeScript
│   ├── app/                        # Route pages (Hub, Topics, Dashboard)
│   ├── components/                 # UI primitives, playback bars, visualizers
│   ├── hooks/                      # useAlgorithmPlayback state machine
│   ├── lib/                        # API clients and utilities
│   └── types/                      # Shared Frame and Execution type definitions
└── backend/                        # FastAPI + Python 3.12 (managed via uv)
    ├── pyproject.toml              # Dependencies & Ruff/Pytest configuration
    ├── app/
    │   ├── main.py                 # FastAPI application factory & CORS
    │   ├── api/                    # Route handlers (topics, problems, dsa)
    │   ├── core/                   # Config, database engine, security
    │   ├── models/                 # SQLAlchemy 2.0 ORM models
    │   ├── schemas/                # Pydantic schemas (Frame, Execution)
    │   └── dsa/                    # Algorithmic solutions & step generators
    └── tests/                      # Pytest unit and edge-case test suites
```

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js**: `v20+` or `v24+`
- **npm**: `v10+`
- **Python**: `3.12+`
- **uv**: Fast Python package manager ([Installation Guide](https://docs.astral.sh/uv/getting-started/installation/))

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/algoscope.git
cd algoscope
```

### 2. Setup Backend
```bash
cd backend
uv sync
uv run pytest
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run build
```

### 4. Run Development Servers
From the monorepo root:

```bash
# Terminal 1: Backend API (runs on http://localhost:8000)
npm run dev:backend

# Terminal 2: Frontend App (runs on http://localhost:3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start exploring!

---

## 🧪 Testing & Code Quality

AlgoScope maintains zero-compromise code quality standards across both ecosystems:

```bash
# Run all backend tests
npm run test:backend

# Run Python linter & formatter
npm run lint:backend

# Run frontend ESLint & strict TypeScript check
npm run lint:frontend
npm run typecheck:frontend
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
