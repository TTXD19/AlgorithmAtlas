import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "1-D DP, Matrix",
  applications: [
    {
      title: "How many routes a warehouse robot has",
      problem:
        "The warehouse floor is a 20×20 grid, and a transport robot runs from the entrance (top-left) to the dispatch area (bottom-right). To keep robots from colliding, they may only move east or south, and some cells hold racking they cannot enter. The system needs the number of distinct routes so it can tell whether alternatives still exist when one lane is congested.",
      why: "With no racking the answer is the binomial coefficient C(38, 19), about 35 billion — but block a single cell and the formula no longer applies. The number of routes into a cell is simply \"routes from above + routes from the left\", a racked cell is set to zero, and filling 400 cells row by row gives the answer no matter how the obstacles are arranged.",
    },
    {
      title: "Seam carving: narrowing a photo without squashing the subject",
      problem:
        "A 1920×1080 landscape photo has to be trimmed to 1720 wide to fit a layout. Scaling it down squashes the people in it, and cropping the edges cuts off things that matter.",
      why: "Seam carving repeatedly removes the vertical seam with the lowest energy: one pixel per row from top to bottom, where the next row may only take the pixel directly below or one diagonally below. dp[r][c] is the lowest cumulative energy for reaching that pixel, and it depends only on three cells of the previous row — so one seam costs a single sweep of the 1920×1080 table, and 200 repetitions remove 200 columns, taking the bland regions like sky and grass first.",
    },
    {
      title: "The lowest-risk flight path for a drone",
      problem:
        "An inspection drone divides its area into a grid and scores each cell for risk from wind speed and distance to restricted airspace. The mission rules allow progress only east or north, and the task is the route from start to finish with the lowest total risk.",
      why: "This is Minimum Path Sum: the lowest cumulative risk at a cell is the smaller of the cell above and the cell to the left, plus this cell's own risk. Once the table is filled, walking back from the end and always stepping toward the smaller source reconstructs the whole route, in time proportional to the number of cells.",
    },
  ],
  cue: "Grids, movement restricted to right or down (so paths never loop back), counting paths, minimum path sum, obstacle cells, each cell depending only on the one above and the one to the left, rolling a single row to save space.",
  steps: [
    "Confirm that the allowed moves cannot loop back (right and down only, or transitions only from the previous row), which makes filling row by row, left to right, a valid order.",
    "Define `dp[r][c]` as the answer for reaching (r, c). Initialise the start `dp[0][0]` to 1 for counting, or to `grid[0][0]` for cost.",
    "The first row looks only to the left and the first column only above. Every other cell uses `above + left` for counting and `min(above, left) + grid[r][c]` for minimum cost, with obstacles set to 0 or ∞.",
    "The answer sits in `dp[m−1][n−1]`. For the path itself, walk back from the end, each time stepping toward the source with the smaller dp value, and reverse at the end.",
    "When only the answer is needed, roll a single row: `dp[c] = f(dp[c], dp[c−1])`, where `dp[c]` before the update is the cell above and `dp[c−1]` is the cell to the left.",
  ],
  demoNote:
    'The same 4×4 grid in two modes. In "Min Path Sum" the small number in a cell\'s bottom-right corner is the cost of entering it, blue is the cell being filled, and yellow is the source it picked — whichever of above and left is smaller. Once the table is complete, green marks the cheapest path found by walking back from the end, for a total cost of 9. In "Unique Paths" yellow marks both the cell above and the cell to the left, because their route counts get added together; every cell along the edges is 1, and the bottom-right corner is 20, exactly C(6, 3).',
  codeNote:
    "Python has the path count rolling a single row (obstacles optional), the minimum path sum that keeps the whole table so it can reconstruct the path, and seam carving, where each row transitions from three cells. C++ has the one-dimensional versions of LeetCode 63 and 64, and checks against an empty 20×20 grid that the answer really is C(38, 19), which needs 64-bit integers.",
  problems: [
    { src: "LeetCode 62", name: "Unique Paths (write the 2-D table first, then collapse it to one row)", diff: "Medium" },
    { src: "LeetCode 63", name: "Unique Paths II (obstacles reset the cell to zero)", diff: "Medium" },
    { src: "LeetCode 64", name: "Minimum Path Sum", diff: "Medium" },
    { src: "LeetCode 931", name: "Minimum Falling Path Sum (transitions from three cells in the previous row, exactly like seam carving)", diff: "Medium" },
    { src: "LeetCode 221", name: "Maximal Square (dp is the side of the largest square whose bottom-right corner is this cell)", diff: "Medium" },
    { src: "LeetCode 174", name: "Dungeon Game (fill the table backwards from the end)", diff: "Hard" },
  ],
};
