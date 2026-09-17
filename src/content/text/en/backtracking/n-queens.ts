import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Combinations & Combination Sum, Hash Table",
  applications: [
    {
      title: "Building a timetable automatically",
      problem:
        "Every course needs a slot and a room. One teacher cannot take two courses at once, one room cannot hold two classes at once, and certain courses must not land on the same day. With well over a hundred courses, doing it by hand takes weeks.",
      why: 'Handle one course at a time: pick a slot from the ones still free, move on to the next course, and if every slot clashes, go back to the previous course and give it a different slot. N-Queens is the smallest textbook version of this kind of "constraint satisfaction problem": one queen per row, never sharing a column or a diagonal with a queen already placed.',
    },
    {
      title: "Shift rotas and seating plans",
      problem:
        "A nursing station runs three shifts a day. Each person has days they cannot work, a limit on consecutive shifts, and colleagues they must not be paired with. You need a rota that satisfies every rule.",
      why: 'Fill one cell, check every rule against it, and go back and change the previous cell when a rule breaks: that is exactly backtracking. The crucial part is that the conflict check has to be fast. N-Queens squeezes each check down to O(1) with three sets, and a rota uses the same idea with pre-built "who is busy when" tables.',
    },
    {
      title: "Sudoku and crossword solvers",
      problem:
        "A Sudoku app has to confirm that any given grid is solvable and be able to offer a hint. The human method is to fill in a square, see whether anything contradicts, and rub it out and try again if it does.",
      why: "The program does exactly what the human does: try 1 through 9 in each square, check for conflicts against three sets of constraints for the row, the column and the box, and backtrack when the square leads nowhere. Sudoku is a direct extension of N-Queens; only the shape of the constraints differs.",
    },
  ],
  cue: "Nothing may clash, one per row and one per column, timetabling and rotas, constraint satisfaction, a check after each placement, going back a step when stuck, Sudoku.",
  steps: [
    'Set up `queens` (the column used by each row) and three sets: `cols`, `diag1` (r−c) and `diag2` (r+c). `dfs(r)` means "currently filling row r".',
    "Base case: `r == n` means all n rows are filled, so turn `queens` into a board and add it to the answers.",
    "For each column c: if `c in cols` or `r-c in diag1` or `r+c in diag2`, the square is attacked, so skip it.",
    "Make the choice: `queens.append(c)`, add one value to each of the three sets, and recurse with `dfs(r + 1)`.",
    "Undo the choice: `queens.pop()` and remove one value from each of the three sets. When every column of this row has been tried without success, the call simply returns to the previous row — and that is backtracking.",
  ],
  demoNote:
    "Four queens, filled one row at a time. A pale yellow square is attacked by a queen already on the board, and every time the search lands on an attacked square it says which constraint was violated. When every column of a row is attacked, the queen on the row above is lifted and moved to its next column, and so on until the first solution appears.",
  codeNote: "The set-based version that lists every solution, and the bitmask version that only counts them.",
  problems: [
    { src: "LeetCode 36", name: "Valid Sudoku (practise the conflict check first)", diff: "Medium" },
    { src: "LeetCode 473", name: "Matchsticks to Square (every matchstick joins one of four sides; sort, then prune)", diff: "Medium" },
    { src: "LeetCode 51", name: "N-Queens", diff: "Hard" },
    { src: "LeetCode 52", name: "N-Queens II (bitmasks)", diff: "Hard" },
    { src: "LeetCode 37", name: "Sudoku Solver (three sets: rows, columns and boxes)", diff: "Hard" },
    { src: "LeetCode 1655", name: "Distribute Repeating Integers (constraint satisfaction plus pruning)", diff: "Hard" },
  ],
};
