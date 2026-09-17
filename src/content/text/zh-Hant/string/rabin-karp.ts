import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "String Hashing、Sliding Window",
  applications: [
    {
      title: "程式作業的抄襲偵測",
      problem: "一門課 300 份程式作業要兩兩比對，找出抄襲的組合。改變數名稱、調換函式順序、插幾行註解，都不該讓相似度掉到零；兩兩逐字比對則是四萬多對、每對又是長字串比較。",
      why: "Stanford 的 MOSS 系統先把每份作業正規化，再取出所有長度 k 的片段算雜湊，從中挑出一部分當作「指紋」，兩份作業共有的指紋越多就越可疑。n 個字元有 n − k + 1 個片段，滾動雜湊讓每個片段 O(1) 算出，整份作業 O(n)。",
    },
    {
      title: "rsync 只傳送改變的部分",
      problem: "伺服器上有一個 2 GB 的檔案，本機的版本只在中間插入了幾百個位元組。整份重傳太浪費；按固定位移切塊比對也不行，因為插入之後，後面每一塊的位置都錯開了。",
      why: "接收端把舊檔切成固定大小的區塊，傳來每一塊的弱雜湊和強雜湊。傳送端在新檔的「每一個」位移上滑動視窗，用滾動校驗和 O(1) 更新，查表看有沒有某一塊的弱雜湊相同，相同再用強雜湊確認。這和 Rabin-Karp「先比雜湊、再確認」的結構完全一樣，所以位移錯開也找得到。",
    },
    {
      title: "同時找很多個關鍵字",
      problem: "實驗室有 2 萬條長度 20 的引子序列，要在一段 500 萬鹼基的基因組裡找出每一條出現的位置。一條一條跑字串搜尋，就是把基因組從頭掃 2 萬次。",
      why: "長度相同的模式可以把雜湊值全部放進雜湊表，文字只掃一次：每個視窗 O(1) 更新雜湊、O(1) 查表，查到才逐字元確認。總時間是 O(n + 所有模式的總長) 加上命中的確認成本，和模式的數量幾乎無關。",
    },
  ],
  cue: "在長文字裡找固定長度的片段、同時找很多個等長模式、比對所有長度 k 的子字串、視窗每移一格就要一個指紋、只需要期望線性時間。",
  steps: [
    "模式比文字長就直接回傳。算出 `hash(P)`、第一個視窗 `hash(T[0, m))`，並預先算好 `top = B^(m−1) mod M`。",
    "檢查目前視窗 i：雜湊和 `hash(P)` 不同就跳過，一定不是。",
    "雜湊相同就逐字元比較 `T[i, i+m)` 和 P，全部相同才記錄位置 i；不同就是碰撞，略過。",
    "還沒到最後一個視窗就滾動：`hash = ((hash − T[i]·top)·B + T[i+m]) mod M`，減完是負數要先加 M。",
    "重複到 `i = n − m`。有多個長度相同的模式時，把它們的雜湊放進雜湊表，每個視窗查一次表即可。",
  ],
  demoNote:
    "在 T = abracadabra 裡找 P = abra，和上一篇一樣取 B = 31、a = 1，模數故意用很小的 M = 101。hash(P) = 53，最高位的權重 31³ mod 101 = 97。黃色是目前的視窗，每次滑動時灰色是剛離開的字元、藍色是剛進來的字元，框裡是 O(1) 的滾動算式。八個視窗的雜湊依序是 53、53、74、86、64、35、15、53：視窗 0 雜湊相同，逐字元確認後變綠色，是真的命中；視窗 1 的 brac 雜湊也是 53，確認時第一個字就不同，藍色標出不相符的字元，這就是碰撞；中間五個雜湊不同，直接跳過；視窗 7 再次命中。最後找到位置 0 和 7。",
  codeNote:
    "Python 放單一模式的 Rabin-Karp，以及多個等長模式共用一次掃描的版本，兩者都在雜湊相同後逐字元確認。C++ 放單一模式版，用無號整數時先加 M 再減；另外附上 DNA 片段的 2 位元滾動編碼，這題因為字母只有 4 種，滾動值本身就不會碰撞，不需要模數。",
  problems: [
    { src: "LeetCode 796", name: "Rotate String（在 s + s 裡找 goal）", diff: "Easy" },
    { src: "LeetCode 1461", name: "Check If a String Contains All Binary Codes of Size K（位元視窗滾動）", diff: "Medium" },
    { src: "LeetCode 187", name: "Repeated DNA Sequences（2 位元滾動編碼）", diff: "Medium" },
    { src: "LeetCode 686", name: "Repeated String Match", diff: "Medium" },
    { src: "LeetCode 2156", name: "Find Substring With Given Hash Value（反過來從右往左滾動）", diff: "Hard" },
    { src: "LeetCode 1923", name: "Longest Common Subpath（二分長度，每條路徑滾動雜湊取交集）", diff: "Hard" },
  ],
};
