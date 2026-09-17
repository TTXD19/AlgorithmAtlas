import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Rabin-Karp、Amortized Analysis",
  applications: [
    {
      title: "上傳檔案時在資料流裡找分隔字串",
      problem:
        "瀏覽器上傳一個 4 GB 的影片，表單資料用 multipart 格式傳送，各欄位之間以一條隨機產生的分隔字串隔開。伺服器是一塊一塊從網路收到資料的，不可能先把 4 GB 全讀進記憶體再搜尋，而分隔字串還可能剛好被切在兩塊資料的交界。",
      why: "KMP 比對時文字指標從不回頭，整個比對狀態只有一個整數 j，代表「目前已經對上分隔字串的前 j 個字元」。每收到一塊資料就沿用同一個 j 往下掃，被切斷的分隔字串自然會在下一塊接上；掃過的資料可以立刻寫進檔案丟掉，記憶體只要 O(m)。",
    },
    {
      title: "封包內容的特徵比對",
      problem:
        "入侵偵測系統要在每個經過的封包裡找已知攻擊的特徵字串。暴力比對平常很快，但攻擊者可以故意送出讓每個起點都要比很久才失敗的內容，例如一長串 a，把偵測系統本身拖慢，讓後面的攻擊封包趁機通過。",
      why: "KMP 的最壞時間就是 O(n + m)：失配時只照事先算好的 pi 表移動模式，內容再怎麼構造都不會退化，雜湊法則有被構造碰撞的風險。實務上特徵有成千上萬條，會改用 KMP 的多模式推廣 Aho–Corasick，把所有特徵的失敗函數建在一棵字典樹上，一次掃描全部比對。",
    },
    {
      title: "組裝定序片段時找頭尾重疊",
      problem:
        "定序儀一次只能讀出幾百個鹼基的短片段，組裝基因組時要判斷片段 A 的結尾和片段 B 的開頭重疊多長，例如 GATTACA 的結尾和 TACAGG 的開頭共有 TACA。一個個長度去試，每試一次又要比一整段。",
      why: "把 B、分隔字元 #、A 接成一個字串求 pi，最後一格就是「B 的前綴同時是 A 的後綴」的最長長度；# 不會出現在序列裡，所以邊界不會跨過它。一次 O(|A| + |B|) 就得到答案，不必逐一嘗試每種重疊長度。",
    },
  ],
  cue: "在文字裡找一個模式而且要保證最壞線性、資料一塊一塊進來不能回頭、最長的既是前綴又是後綴的字串、字串的最短週期、兩段字串的頭尾重疊。",
  steps: [
    "建 pi 表：`pi[0] = 0`、`j = 0`；i 從 1 到 m−1，當 `j > 0` 且 `P[i] ≠ P[j]` 時令 `j = pi[j−1]`；若 `P[i] = P[j]` 則 j 加 1；最後 `pi[i] = j`。",
    "搜尋時令 `j = 0`，i 從頭掃 T。每讀一個 `T[i]`，只要 `j > 0` 且 `T[i] ≠ P[j]`，就退到 `j = pi[j−1]`，i 不動。",
    "若 `T[i] = P[j]`，j 加 1；否則此時 j 已經是 0，直接讀下一個字元。",
    "若 `j = m`，記錄出現位置 `i − m + 1`，並令 `j = pi[m−1]`，繼續找可能重疊的下一次。",
    "需要週期或重疊時直接讀 pi：最短週期是 `m − pi[m−1]`；A 的結尾和 B 的開頭的最長重疊，是「B、#、A」接起來求 pi 的最後一格。",
  ],
  demoNote:
    "P = aabaaab、T = aabaabaaab。第一階段建 pi 表：上排是 P，下排是 P 的另一份複本，對齊在 i − j 的位置，拿自己和自己比。綠色是對上的字元；黃色是失配但還能後退，pi 表裡被查的那一格也同時變黃；藍色是失配而且 j 已經是 0。i = 2 退到 j = 0 仍然不同，所以 pi[2] = 0；i = 5 退到 j = 1 後就對上了，pi[5] = 2。建好的 pi = [0, 1, 0, 1, 2, 2, 3]。第二階段在 T 裡找：前五個字元 aabaa 全部對上，T[5] = b 和 P[5] = a 失配。暴力法會把 P 移一格、從 T[1] 重來；KMP 查 pi[4] = 2，知道已對上的 aabaa 頭尾都是 aa，直接把 P 滑到位置 3、j = 2，i 停在原地。T[5] = b 正好對上 P[2]，之後一路對到結尾，在位置 3 找到 P。整個過程 i 只往前走了 10 步。",
  codeNote:
    "Python 放前綴函數、找出所有出現位置（包含重疊的），以及用 pi 求最短週期。C++ 放跨資料塊保留狀態的串流比對器，示範分隔字串被切在兩塊資料交界時一樣找得到，另外用 pi 求兩段序列的頭尾重疊。",
  problems: [
    { src: "LeetCode 28", name: "Find the Index of the First Occurrence in a String", diff: "Easy" },
    { src: "LeetCode 459", name: "Repeated Substring Pattern（最短週期能整除長度）", diff: "Easy" },
    { src: "LeetCode 1764", name: "Form Array by Concatenating Subarrays of Another Array（在整數陣列上跑 KMP）", diff: "Medium" },
    { src: "LeetCode 1392", name: "Longest Happy Prefix（答案就是 pi[m−1]）", diff: "Hard" },
    { src: "LeetCode 214", name: "Shortest Palindrome（對 s、#、反轉的 s 接起來求 pi）", diff: "Hard" },
    { src: "LeetCode 3008", name: "Find Beautiful Indices in the Given Array II（兩次 KMP 再用雙指標）", diff: "Hard" },
  ],
};
