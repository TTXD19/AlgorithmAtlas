import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array",
  applications: [
    {
      title: "Turning a photo 90 degrees",
      problem:
        "A photo came off the phone the wrong way up and has to be rotated. The image is nothing but a height × width matrix of pixels, memory is tight, and allocating a second image the same size is exactly what you want to avoid.",
      why: "A 90° rotation splits into two in-place operations — transpose, then reverse each row — for O(1) extra space. Breaking a geometric transform down into simple steps like this turns up everywhere in image processing.",
    },
    {
      title: "Board games and maps",
      problem:
        "Checking for a line in noughts and crosses, counting the mines around a square in Minesweeper, finding a route from A to B on a game map: all of them come down to looking at a cell's neighbours on a two-dimensional grid.",
      why: "A direction array [(0,1),(1,0),(0,-1),(-1,0)] stands for right, down, left and up, so a single loop handles all four directions and the bounds check together. Every grid BFS and DFS in the graph lessons later on is written this way.",
    },
    {
      title: "Spreadsheets and matrix arithmetic",
      problem:
        "A sheet in Excel, a batch of machine-learning data, a matrix in linear algebra — all of them are two-dimensional arrays. You need to pull out one column, transpose, or run an operation across a whole block.",
      why: "Once you understand that the index goes row first and that memory stores one whole row after another, you know why walking by row beats walking by column (it is cache-friendly), and how to build and traverse a matrix correctly.",
    },
  ],
  cue: "Grid, two-dimensional, m × n, up/down/left/right, neighbours, rotation or transposition, spiral, board, image.",
  steps: [
    "Pin down `m`, `n` and the index order first: `grid[r][c]`, with 0 ≤ r < m and 0 ≤ c < n. An empty matrix needs its own special case.",
    "To look at neighbours, use a **direction array**: `for dr, dc in DIRS`, work out `(nr, nc)`, then run the bounds check before doing anything with the cell.",
    "**Spiral traversal**: walk one side each going right, down, left and up, and shrink the matching bound inwards by one every time a side is finished. Before the left and up passes of each lap, check again that the bounds have not crossed, or a lone row or column will be visited twice.",
    "**Rotating 90°** (clockwise): transpose by swapping each pair above the diagonal with `swap(a[r][c], a[c][r])`, then reverse every row. For anticlockwise, reverse every column top to bottom instead.",
    'When you have to mark "this row" or "this column" and cannot allocate anything new, write the marks into the **first row and the first column** — but record separately, beforehand, whether those two were marked in their own right.',
  ],
  demoNote:
    '"Spiral traversal" shows the visit order cell by cell along with the way the four bounds close in; "Rotate 90°" steps through every swap of the transpose and then the reversal of each row.',
  codeNote:
    "Starting with building a matrix and the direction array, then spiral traversal, the in-place rotation, and Set Matrix Zeroes using the edge row and edge column as its markers.",
  problems: [
    { src: "LeetCode 54", name: "Spiral Matrix", diff: "Medium" },
    { src: "LeetCode 48", name: "Rotate Image", diff: "Medium" },
    { src: "LeetCode 73", name: "Set Matrix Zeroes", diff: "Medium" },
    { src: "LeetCode 36", name: "Valid Sudoku", diff: "Medium" },
    { src: "LeetCode 74", name: "Search a 2D Matrix (treat the grid as one flat array and binary search it)", diff: "Medium" },
    { src: "LeetCode 200", name: "Number of Islands (try a direction array plus DFS first)", diff: "Medium" },
  ],
};
