import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "BFS, DFS, matrices",
  applications: [
    {
      title: "Counting cell nuclei on a pathology slide",
      problem:
        "A slide is scanned at 4000×3000 pixels, and after thresholding the nuclei are 1 and the background is 0. The lab system has to count the nuclei and flag any blob larger than 500 pixels as a possible abnormality.",
      why: "Each pixel is a node, two 1s that touch vertically or horizontally share an edge, and one nucleus is one connected component. Scan cell by cell, and whenever you hit an unvisited 1, traverse the whole blob and add up its area on the way. Each of the 12 million pixels enters and leaves the queue exactly once, and neighbours are derived from coordinates, so you never build an adjacency list with 12 million nodes in it.",
    },
    {
      title: "Where floods if the sea rises 2 metres",
      problem:
        "A 2000×2000 elevation grid records the height of every cell. Hundreds of thousands of cells sit below 2 metres, but some of those are hollows ringed by levees and high ground that seawater cannot reach at all.",
      why: "Going by elevation alone counts inland hollows as flooded. Turn it around and start from the sea: put every ocean cell in the queue at once and spread only into neighbours at 2 metres or below, and whatever the water reaches is what floods. That is a single O(mn) traversal, instead of checking every low-lying cell separately for a route to the sea.",
    },
    {
      title: "Exit signs for every part of a store",
      problem:
        "A 200×300 grid floor plan of one storey has shelving as walls and 6 fire exits. The fire code says the sign in each area must show the number of steps to the nearest exit.",
      why: "Running BFS once per exit and taking the minimum means six passes. Multi-source BFS puts all 6 exits in the queue at the start, each at distance 0, and one traversal gives every cell its distance to the closest exit — exactly as if you had added a virtual start node joined to every exit.",
    },
  ],
  cue: "Two-dimensional grids, m × n, four-way adjacency, how many regions or islands, the largest one, flood fill, fewest steps through a maze, distance to the nearest something, working inward from the border.",
  steps: [
    "Define the graph: `m = len(grid)`, `n = len(grid[0])`, decide which cells are walkable (land, not wall), and write down `DIRS` (four directions, or eight). Do not build a separate adjacency list.",
    "Set up the marking: an `m × n` boolean array `seen`, or a `dist` array when you need step counts, with `-1` for not reached yet.",
    "Traverse one region: mark the start and push it. Pop `(r, c)`, compute `(nr, nc)` for each `(dr, dc)`, and check in order that `0 ≤ nr < m`, that `0 ≤ nc < n`, that the cell is walkable, and that it is not marked yet. Only when all four pass do you **mark it and push it**.",
    "Count regions: scan every cell with a double loop, and on an unmarked walkable cell add one to the region count and run step 3 from it, accumulating the area as you pop if you need it.",
    "Fewest steps: with a single start, run BFS directly with `dist[nr][nc] = dist[r][c] + 1`; with several starts (the nearest exit, every ocean cell, every border cell), push them all at distance 0 first and then run the same loop.",
  ],
  demoNote:
    'A 5×6 map where 1 is land and 0 is water, holding 5 islands in all. The demo scans cell by cell and, on a piece of land it has not visited, traverses that whole island: yellow cells are waiting in the queue or on the stack, blue is the cell being processed, a green outline marks the walkable neighbours found on this step, and a cell that has been popped and processed is replaced by the number of the island it belongs to. Switch between "BFS (queue)" and "DFS (stack)" — the only difference in the code is whether you take from the front or the back. Cells inside one island finish in a different order, but the island count and the membership of each island come out exactly the same.',
  codeNote:
    "Two functions for the two kinds of question: `island_areas` uses BFS to measure each island's area (on the very map from the demo), and `nearest_exit` uses multi-source BFS for every cell's distance to the closest exit, including one cell that is walled in and reaches no exit at all. Both share the same skeleton — direction array, bounds check, mark on push — and once that is second nature, most grid problems come down to deciding which cells are walkable and where the traversal starts.",
  problems: [
    { src: "LeetCode 733", name: "Flood Fill (the most basic four-direction traversal)", diff: "Easy" },
    { src: "LeetCode 1020", name: "Number of Enclaves (traverse inward from the border)", diff: "Medium" },
    { src: "LeetCode 542", name: "01 Matrix (multi-source BFS)", diff: "Medium" },
    { src: "LeetCode 417", name: "Pacific Atlantic Water Flow (one traversal from each coast)", diff: "Medium" },
    { src: "LeetCode 934", name: "Shortest Bridge (mark one island, then multi-source BFS)", diff: "Medium" },
    { src: "LeetCode 827", name: "Making A Large Island (label islands with areas, then try every 0)", diff: "Hard" },
  ],
};
