import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "LCS",
  applications: [
    {
      title: "搜尋框的「你是不是要找」",
      problem: "使用者在電商搜尋框打了「recieve」，站內沒有這個字。系統要在十萬個商品關鍵字裡，挑出最可能是他想打的那幾個。",
      why: "把兩個字的差異量化成「最少要幾次插入、刪除或取代」：recieve 到 receive 是 2、到 receipt 是 4。先用長度差剔除明顯不可能的候選，再只算距離 ≤ 2 的斜帶，一次查詢只要幾毫秒。但 recieve 到 relieve 只有 1，比 receive 還近，所以實際的拼字建議會再搭配詞頻，或改用把「相鄰兩字對調」算成一步的 Damerau 距離，recieve 到 receive 就只要 1 步。",
    },
    {
      title: "語音辨識的錯誤率",
      problem: "語音辨識模型把一段 20 個詞的語音轉成文字，和人工聽打的參考稿比較：有的詞聽錯、有的漏掉、有的多出來。團隊要一個能跨版本比較的準確度指標。",
      why: "把每個「詞」當成一個字元算編輯距離：取代是聽錯、刪除是漏聽、插入是多聽。距離除以參考稿的詞數就是業界通用的詞錯誤率（WER），例如距離 3、參考稿 20 個詞，WER 就是 15%。表格回溯還能列出到底錯在哪幾個詞。",
    },
    {
      title: "OCR 辨識出的品名對回商品資料庫",
      problem: "發票掃描後辨識出「鮮奶茶大杯（去冰）」，但 OCR 偶爾會把「杯」認成「林」、漏掉括號。系統要把它對應到商品主檔裡最接近的品項才能自動記帳。",
      why: "逐字計算和每個候選品名的編輯距離，距離最小而且低於門檻的就自動配對，太遠的才丟給人工確認。編輯距離容忍少數字元的錯漏，比「完全相同才算」實用得多，而且三種操作的成本可以依 OCR 常見的錯誤類型調整。",
    },
  ],
  cue: "兩個字串有多像、最少幾步把 A 變成 B、插入刪除取代、拼字校正、模糊比對、容錯搜尋、詞錯誤率、dp[i][j] 看兩個前綴。",
  steps: [
    "開 `(m+1) × (n+1)` 的表，`dp[i][0] = i`、`dp[0][j] = j`。",
    "逐列由左到右填：`A[i−1] == B[j−1]` 就 `dp[i][j] = dp[i−1][j−1]`；否則 `1 + min(左上, 上, 左)`，分別對應取代、刪除、插入。",
    "`dp[m][n]` 就是編輯距離。",
    "要操作序列：從 `(m, n)` 往回走，看這一格等於哪一個來源（加上該步的成本），往那裡移動並記下操作，走到 `(0, 0)` 後反轉。",
    "只要距離時滾動一列並暫存左上角；只問「是否 ≤ k」就只算 `|i − j| ≤ k` 的斜帶。",
  ],
  demoNote:
    "把 horse 變成 ros，這是 LeetCode 72 的範例。先填第 0 列與第 0 行，接著逐格填：藍色是正在填的格子，黃色是這一格最後選用的來源，格子左上角的小箭頭記下來源方向（↖ 相同或取代、↑ 刪除、← 插入；幾個來源一樣小時，依取代、刪除、插入的順序挑）。填完後從右下角回溯，綠色是回溯路徑，右側會依序列出操作：取代 h → r、刪除 r、刪除 e，共 3 步，正好等於右下角的值。",
  codeNote:
    "Python 放完整表格、還原操作序列，以及滾動一列的省空間版，最後用 teh 的拼字建議示範「對調兩個字」在 Levenshtein 距離裡算兩步。C++ 放只用一列加一個左上角變數的寫法，以及只算斜帶、判斷距離是否 ≤ k 的版本。",
  problems: [
    { src: "LeetCode 72", name: "Edit Distance", diff: "Medium" },
    { src: "LeetCode 97", name: "Interleaving String（同樣是兩個前綴的表格）", diff: "Medium" },
    { src: "LeetCode 115", name: "Distinct Subsequences（把「最少步數」換成「方法數」）", diff: "Hard" },
    { src: "LeetCode 44", name: "Wildcard Matching（* 可以對上任意長度）", diff: "Hard" },
    { src: "LeetCode 1312", name: "Minimum Insertion Steps to Make a String Palindrome（和自己的反轉比對）", diff: "Hard" },
  ],
};
