"""Idempotent seed script populating all 14 DSA curriculum topics."""

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.topic import Topic

TOPICS_SEED_DATA: list[dict[str, Any]] = [
    {
        "slug": "arrays-and-strings",
        "title": "Arrays & Strings",
        "description": (
            "Master fundamental contiguous memory techniques including sliding window, "
            "two pointers, prefix sums, and Kadane's algorithm."
        ),
        "difficulty_order": 1,
        "icon": "brackets",
        "key_patterns": [
            "Sliding Window",
            "Two Pointers",
            "Prefix Sums",
            "Kadane's Algorithm",
        ],
    },
    {
        "slug": "hashing-and-sets",
        "title": "Hashing & Sets",
        "description": (
            "Explore constant-time lookups, frequency maps, anagram detection, "
            "collision handling, and cache eviction patterns."
        ),
        "difficulty_order": 2,
        "icon": "hash",
        "key_patterns": [
            "Frequency Maps",
            "Anagram Detection",
            "Two-Sum Pattern",
            "Bucket Collisions",
        ],
    },
    {
        "slug": "binary-search",
        "title": "Binary Search",
        "description": (
            "Halve your search space efficiently with boundary condition hunting, "
            "rotated arrays, and search-on-answer patterns."
        ),
        "difficulty_order": 3,
        "icon": "binary",
        "key_patterns": [
            "Search on Answer",
            "Rotated Arrays",
            "Search Space Reduction",
            "Upper/Lower Bounds",
        ],
    },
    {
        "slug": "sorting-and-searching",
        "title": "Sorting & Searching",
        "description": (
            "Understand comparative divide-and-conquer, partition pivots, "
            "merge sort applications, and quickselect."
        ),
        "difficulty_order": 4,
        "icon": "arrow-up-down",
        "key_patterns": [
            "Merge Sort",
            "Quickselect",
            "Partition Pivots",
            "Custom Comparators",
        ],
    },
    {
        "slug": "linked-lists",
        "title": "Linked Lists",
        "description": (
            "Manipulate node pointers, detect cycles with fast/slow pointers, "
            "and reverse linear chains in-place."
        ),
        "difficulty_order": 5,
        "icon": "link",
        "key_patterns": [
            "Fast & Slow Pointers",
            "In-Place Reversal",
            "Merge Patterns",
            "Cycle Detection",
        ],
    },
    {
        "slug": "stacks-and-queues",
        "title": "Stacks & Queues",
        "description": (
            "Manage LIFO and FIFO execution pipelines, monotonic boundaries, "
            "and bracket linting expressions."
        ),
        "difficulty_order": 6,
        "icon": "layers",
        "key_patterns": [
            "Monotonic Stack",
            "Next Greater Element",
            "BFS Queues",
            "Parentheses Validation",
        ],
    },
    {
        "slug": "heaps-and-priority-queues",
        "title": "Heaps & Priority Queues",
        "description": (
            "Prioritize dynamic streaming data, extract extremes in logarithmic time, "
            "and balance two heaps."
        ),
        "difficulty_order": 7,
        "icon": "list-ordered",
        "key_patterns": [
            "Top-K Elements",
            "Merge K Sorted",
            "Median Finding",
            "Task Scheduling",
        ],
    },
    {
        "slug": "recursion-and-backtracking",
        "title": "Recursion & Backtracking",
        "description": (
            "Explore combinatorial state trees, branch pruning, "
            "constraint satisfaction, and exhaustive search spaces."
        ),
        "difficulty_order": 8,
        "icon": "git-fork",
        "key_patterns": [
            "Permutations",
            "Subsets",
            "N-Queens",
            "Pruning & Constraints",
        ],
    },
    {
        "slug": "trees-and-bsts",
        "title": "Trees & BSTs",
        "description": (
            "Navigate hierarchical structures with recursive DFS, "
            "level-order BFS, and lowest common ancestors."
        ),
        "difficulty_order": 9,
        "icon": "network",
        "key_patterns": [
            "DFS (Pre/In/Post)",
            "BFS Level Order",
            "Lowest Common Ancestor",
            "Tree Serialization",
        ],
    },
    {
        "slug": "greedy-algorithms",
        "title": "Greedy Algorithms",
        "description": (
            "Make locally optimal choices for global solutions in interval scheduling, "
            "Huffman coding, and activity selection."
        ),
        "difficulty_order": 10,
        "icon": "zap",
        "key_patterns": [
            "Interval Scheduling",
            "Huffman Coding",
            "Activity Selection",
            "Gas Station Pattern",
        ],
    },
    {
        "slug": "graphs",
        "title": "Graphs",
        "description": (
            "Model complex relationships and networks with traversal, "
            "topological sorting, shortest paths, and disjoint sets."
        ),
        "difficulty_order": 11,
        "icon": "share-2",
        "key_patterns": [
            "BFS / DFS",
            "Topological Sort",
            "Dijkstra's Algorithm",
            "Union-Find",
            "Cycle Detection",
        ],
    },
    {
        "slug": "tries-and-string-algorithms",
        "title": "Tries & String Algorithms",
        "description": (
            "Accelerate prefix queries, predictive autocomplete suggestions, "
            "and substring pattern search algorithms."
        ),
        "difficulty_order": 12,
        "icon": "type",
        "key_patterns": [
            "Prefix Matching",
            "KMP Algorithm",
            "Rabin-Karp",
            "Autocomplete Lookup",
        ],
    },
    {
        "slug": "dynamic-programming",
        "title": "Dynamic Programming",
        "description": (
            "Decompose complex optimal substructure problems using 1D/2D memoization grids, "
            "knapsack variants, and state transitions."
        ),
        "difficulty_order": 13,
        "icon": "grid",
        "key_patterns": [
            "1D State Transitions",
            "2D Memoization",
            "0/1 Knapsack",
            "Longest Common Subsequence",
            "Interval DP",
        ],
    },
    {
        "slug": "bit-manipulation",
        "title": "Bit Manipulation",
        "description": (
            "Leverage register-level bitwise operations, XOR cancellation properties, "
            "power of 2 tricks, and compact bitmasks."
        ),
        "difficulty_order": 14,
        "icon": "cpu",
        "key_patterns": [
            "Bitmasking",
            "XOR Cancellation",
            "Power of Two",
            "Bit Counting",
        ],
    },
]


def seed_topics(db: Session) -> list[Topic]:
    """Idempotently seed the 14 DSA curriculum topics.

    If a topic with a given slug exists, its properties are synchronized.
    If it does not exist, it is created.
    Running this function multiple times is safe and never violates unique constraints.
    """
    stmt = select(Topic)
    existing_topics = {topic.slug: topic for topic in db.scalars(stmt).all()}

    seeded_topics: list[Topic] = []
    for data in TOPICS_SEED_DATA:
        slug = str(data["slug"])
        if slug in existing_topics:
            topic = existing_topics[slug]
            topic.title = str(data["title"])
            topic.description = str(data["description"])
            topic.difficulty_order = int(data["difficulty_order"])
            topic.icon = str(data["icon"])
            topic.key_patterns = list(data["key_patterns"])
        else:
            topic = Topic(
                slug=slug,
                title=str(data["title"]),
                description=str(data["description"]),
                difficulty_order=int(data["difficulty_order"]),
                icon=str(data["icon"]),
                key_patterns=list(data["key_patterns"]),
            )
            db.add(topic)
        seeded_topics.append(topic)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    for topic in seeded_topics:
        db.refresh(topic)

    return seeded_topics
