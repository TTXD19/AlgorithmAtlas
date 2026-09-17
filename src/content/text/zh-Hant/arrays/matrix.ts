import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array",
  applications: [
    {
      title: "把照片轉 90 度",
      problem: "手機拍的照片方向不對，要旋轉。圖片就是一個「高 × 寬」的像素矩陣，記憶體有限，不想再開一張一樣大的圖。",
      why: "旋轉 90° 可以拆成「轉置」加「每列反轉」兩個原地操作，O(1) 額外空間。這種把幾何變換拆成簡單步驟的思路，影像處理裡到處都是。",
    },
    {
      title: "棋盤遊戲與地圖",
      problem: "井字遊戲判斷連線、掃雷算周圍幾顆雷、遊戲地圖上找從 A 到 B 的路，都是在二維格子上「看鄰居」。",
      why: "用方向陣列 [(0,1),(1,0),(0,-1),(-1,0)] 表示上下左右，一個迴圈搞定四方向加邊界檢查。之後圖論的網格 BFS / DFS 都用這個寫法。",
    },
    {
      title: "試算表與矩陣運算",
      problem: "Excel 的一張表、機器學習的一批資料、線性代數的矩陣，都是二維陣列。要取某一行、轉置、對一整塊區域做運算。",
      why: "理解「先列後行」的索引、記憶體是一列一列連續放的，就知道為什麼按列走比按行走快（快取友善），也知道怎麼正確建立與走訪。",
    },
  ],
  cue: "grid、二維、m × n、上下左右、鄰居、旋轉／轉置、螺旋、棋盤、影像。",
  steps: [
    "先確認 `m`、`n` 與索引順序：`grid[r][c]`，0 ≤ r < m，0 ≤ c < n。空矩陣要特判。",
    "要看鄰居時用**方向陣列**：`for dr, dc in DIRS`，算出 `(nr, nc)` 後做邊界檢查再處理。",
    "**螺旋走訪**：右→下→左→上各走一邊，走完一邊就把對應的邊界往內縮一格；每一輪走「左」與「上」之前要再檢查邊界沒交叉，否則單列或單行會重複。",
    "**旋轉 90°**（順時針）：對角線上方逐對 `swap(a[r][c], a[c][r])` 完成轉置，再把每一列反轉。逆時針則改成每一行上下反轉。",
    "需要「標記某列某行」又不能開新空間時，把標記寫在**第一列與第一行**，但要先另外記下它們本身原本有沒有被標記。",
  ],
  demoNote:
    "「螺旋走訪」逐格顯示走訪順序與四條邊界怎麼收縮；「旋轉 90°」逐步展示轉置的每一次交換，再看每一列反轉。",
  codeNote:
    "從建立矩陣與方向陣列開始，接著是螺旋走訪、原地旋轉，以及用邊列邊行當標記的 Set Matrix Zeroes。",
  problems: [
    { src: "LeetCode 54", name: "Spiral Matrix", diff: "Medium" },
    { src: "LeetCode 48", name: "Rotate Image", diff: "Medium" },
    { src: "LeetCode 73", name: "Set Matrix Zeroes", diff: "Medium" },
    { src: "LeetCode 36", name: "Valid Sudoku", diff: "Medium" },
    { src: "LeetCode 74", name: "Search a 2D Matrix（二維當一維二分）", diff: "Medium" },
    { src: "LeetCode 200", name: "Number of Islands（先用方向陣列 + DFS 試試）", diff: "Medium" },
  ],
};
