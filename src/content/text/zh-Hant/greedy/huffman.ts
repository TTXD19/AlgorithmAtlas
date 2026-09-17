import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Greedy Principles、Binary Heap、Binary Tree",
  applications: [
    {
      title: "zip 為什麼能把文字檔壓到一半以下",
      problem: "一份英文文件裡 e 出現幾萬次，z 只出現幾次，但 ASCII 一律用 8 位元存每個字。常見的字和罕見的字花一樣的空間，明顯浪費。",
      why: "讓常見字元用短編碼、罕見字元用長編碼，總位元數就會下降。霍夫曼編碼每次把頻率最低的兩個合併成一棵樹，樹上的路徑就是編碼。它是 DEFLATE（zip、gzip、PNG）最後一個階段用的方法，而且可以證明在「每個字元一個編碼」的前提下是最短的。",
    },
    {
      title: "JPEG 與 MP3 的最後一步",
      problem: "影像和聲音經過轉換和量化後，會得到一大堆數字，其中 0 和小數字特別多，大數字很少。要把這些數字存成檔案，越小越好。",
      why: "這正是頻率極度不均的資料，霍夫曼編碼在這種分布上壓縮率最好。JPEG 的熵編碼階段、MP3 的位元流打包都用它。有損壓縮的「有損」發生在量化，霍夫曼這一步是無損的。",
    },
    {
      title: "編碼不能有歧義",
      problem: "變長編碼有個陷阱：如果 a 是 0、b 是 01，讀到 0 的時候不知道該停還是該繼續。加分隔符會把省下的空間吃回去。",
      why: "霍夫曼樹的字元全部在葉節點，所以沒有任何編碼是另一個編碼的前綴，這叫前綴碼。解碼時從根往下走，走到葉節點就輸出，不需要分隔符。貪婪合併的方式自然保證了這個性質。",
    },
  ],
  cue: "壓縮、變長編碼、頻率越高編碼越短、前綴碼、每次合併最小的兩個、最小堆積建樹。",
  steps: [
    "統計每個字元的頻率，每個字元建一個葉節點，全部放進**最小堆積**（依頻率）。",
    "堆積裡多於一個節點時：取出頻率最小的兩個 a、b。",
    "建新節點，頻率 `a.freq + b.freq`，左子 a、右子 b，放回堆積。重複直到剩一個，它就是根。",
    "從根走遍整棵樹，左 0 右 1，走到葉節點就記下該字元的編碼。",
    "編碼：逐字元查表串接。解碼：從根出發，讀 0 往左、讀 1 往右，碰到葉節點輸出並回到根。",
  ],
  demoNote:
    "「abracadabra」有 5 種字元。每一步先標出堆積裡頻率最小的兩個（黃色），下一步把它們合併成新節點（藍色）放回堆積。建完樹後從根往下走就得到編碼表，最後比較總位元數：霍夫曼 23 位元，固定 3 位元編碼要 33。",
  codeNote: "用堆積建樹、走樹產生編碼表，加上編碼與解碼。Python 版用 tuple 表示內部節點，C++ 版用指標。",
  problems: [
    { src: "LeetCode 1046", name: "Last Stone Weight（每次取最大兩個）", diff: "Easy" },
    { src: "LeetCode 1167", name: "Minimum Cost to Connect Sticks（付費題，和霍夫曼一模一樣）", diff: "Medium" },
    { src: "LeetCode 347", name: "Top K Frequent Elements（統計頻率加堆積）", diff: "Medium" },
    { src: "LeetCode 767", name: "Reorganize String（按頻率用堆積排）", diff: "Medium" },
    { src: "LeetCode 1000", name: "Minimum Cost to Merge Stones（限制相鄰時貪婪失效，要區間 DP）", diff: "Hard" },
  ],
};
