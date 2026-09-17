import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "DFS, Matrix",
  applications: [
    {
      title: "Validating an answer in a word game",
      problem:
        "A game like Boggle deals a board of letters, a player submits a word, and the system has to decide whether that word can be spelled out through adjacent cells, using each cell at most once.",
      why: "Start from every cell that carries the first letter, extend up, down, left and right to match the next letter, and mark each cell as you step onto it. When a route dead-ends, clear the mark and try another. That is backtracking on a grid, and clearing the mark is what lets a different route pass through the same cell.",
    },
    {
      title: "Listing every way through a maze",
      problem:
        "A level designer wants to know how many routes lead from the entrance to the exit without revisiting a cell, to judge whether the level is too easy.",
      why: "BFS only ever finds the shortest one. Listing all of them takes DFS with backtracking: mark each cell as you enter it, record a path whenever you reach the goal, and clear the mark on the way back out. Leave the marks in place and the second route is never found.",
    },
    {
      title: "Feasible action sequences for a robot arm",
      problem:
        "An arm has to move from its starting pose to a target through a series of actions, each step choosing one of four actions, with some intermediate poses forbidden. The task is to list every legal sequence of actions.",
      why: "Poses are cells, actions are the four directions, and forbidden poses are walls — the problem has exactly the shape of grid backtracking. A grid is just the easiest state space to draw; the same code transfers to any problem that is states plus transitions.",
    },
  ],
  cue: "Grids, adjacent cells, each cell usable once, finding one path or every path, marking what you have visited, the four directions, turning back when a route dead-ends.",
  steps: [
    "Call `dfs(r, c, 0)` for every cell (r, c) of the board; if any of them returns true, the word is there.",
    "Prune first inside `dfs(r, c, i)`: return false if the position is out of bounds or `board[r][c] != word[i]`.",
    "If `i == len(word) - 1`, the last letter matched too, so return true.",
    "Make the choice: set `board[r][c]` to `#`, recurse with `dfs(nr, nc, i + 1)` into the neighbours above, right, below and left, and return true as soon as one of them does.",
    "Undo the choice: whatever the outcome, restore the original letter to `board[r][c]` before leaving. Restore it on success too — do not leave the board dirty.",
  ],
  demoNote:
    'Searching a 3×4 grid for "SEE". Starting cells are scanned from the top-left, and every S branches out in four directions. Watch the marks get cleared after all three directions out of the first S fail, and then, starting from the second S, watch the upper E dead-end and only the lower E succeed once the mark has been restored.',
  codeNote:
    "Word Search with in-place marking, plus the variant that lists every path through a maze (using a visited array, and recording rather than returning when it reaches the goal, so the search continues).",
  problems: [
    { src: "LeetCode 79", name: "Word Search", diff: "Medium" },
    { src: "LeetCode 1219", name: "Path with Maximum Gold (every finished path has to clear its marks)", diff: "Medium" },
    { src: "LeetCode 130", name: "Surrounded Regions (DFS without clearing the marks — compare the difference)", diff: "Medium" },
    { src: "LeetCode 212", name: "Word Search II (paired with a trie)", diff: "Hard" },
    { src: "LeetCode 980", name: "Unique Paths III (list every path that covers all the empty cells)", diff: "Hard" },
    { src: "LeetCode 2328", name: "Number of Increasing Paths in a Grid (strictly increasing means no backtracking, so drop the marks and memoise instead)", diff: "Hard" },
  ],
};
