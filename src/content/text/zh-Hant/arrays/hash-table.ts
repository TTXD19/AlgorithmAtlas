import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array、Amortized Analysis",
  applications: [
    {
      title: "使用者一登入，伺服器怎麼在一百萬個 session 裡找到他",
      problem: "每個請求都帶一個 session ID，伺服器要立刻知道這是誰。用陣列一個一個比對，一百萬筆要比一百萬次，每個請求都這樣做，服務就掛了。",
      why: "雜湊表把 ID 經過雜湊函數直接算出「該放在哪一格」，查詢不用比對其他任何人。Redis、Memcached 的核心就是一個大雜湊表。",
    },
    {
      title: "資料庫的雜湊索引與 JOIN",
      problem: "兩張表要用 user_id 對起來。沒有索引的話，每一筆都要掃另一張表，O(n·m)。",
      why: "先把一張表建成雜湊表（hash join），另一張表每筆只要一次查詢。O(n + m)。",
    },
    {
      title: "編譯器與直譯器的變數查找",
      problem: "程式碼裡出現一個變數名，直譯器要找到它的值。程式裡可能有幾千個名字，每一行都要查。",
      why: "符號表就是雜湊表：字串經雜湊變成數字索引。Python 的每個物件屬性、每個模組命名空間，底層都是 dict。",
    },
  ],
  cue: "用鍵找值、去重、判斷看過沒有、快取、O(1) 查詢、鍵不是連續整數。",
  steps: [
    "算 `h = hash(key)`，桶編號 `b = h % capacity`。",
    "**查詢**：沿著桶 b 的鏈逐一比對 key，找到就回傳值，走到底就是不存在。鏈平均長度 = 負載因子，所以是 O(1)。",
    "**插入**：先照步驟 2 找，存在就覆蓋；不存在就串到鏈尾，元素數加一。",
    "插入後檢查**負載因子**：超過門檻就把容量加倍，每個既有的 key 重新算 `hash % 新容量` 放進新桶。",
    "**刪除**：找到後從鏈中移除。開放定址法的刪除要留「墓碑」標記，鏈結法不用，這是鏈結法比較好教的原因。",
  ],
  demoNote: "從 4 個桶開始插入 key，看碰撞怎麼串成鏈；負載因子超過 0.75 時桶數會加倍、所有 key 重新分配，鏈又變短。",
  codeNote: "手寫一個鏈結法雜湊表，把 get / put / remove / rehash 走一遍；最後是實務上該直接用的內建容器。",
  problems: [
    { src: "LeetCode 705", name: "Design HashSet", diff: "Easy" },
    { src: "LeetCode 706", name: "Design HashMap", diff: "Easy" },
    { src: "LeetCode 217", name: "Contains Duplicate", diff: "Easy" },
    { src: "LeetCode 380", name: "Insert Delete GetRandom O(1)（雜湊表 + 陣列）", diff: "Medium" },
    { src: "LeetCode 146", name: "LRU Cache（雜湊表 + 雙向鏈結串列）", diff: "Medium" },
  ],
  quiz: [
    {
      q: "兩個不同的 key 算出同一個桶編號，這叫什麼？",
      choices: ["Rehash", "碰撞", "負載", "溢位"],
      answer: 1,
      why: "碰撞無法避免，只能處理：鏈結法把它們串成鏈，開放定址法往後找空格。",
    },
    {
      q: "負載因子是什麼？",
      choices: ["桶數 ÷ 元素數", "元素數 ÷ 桶數", "碰撞次數 ÷ 元素數", "鏈的最大長度"],
      answer: 1,
      why: "它也是鏈結法裡鏈的平均長度。超過門檻（通常 0.75）就要 rehash。",
    },
    {
      q: "為什麼說雜湊表是「平均 O(1)」而不是「一定 O(1)」？",
      choices: ["因為雜湊函數很慢", "因為最壞情況所有 key 撞在同一桶，查詢退化成 O(n)", "因為 rehash 每次都要做", "因為 key 必須是整數"],
      answer: 1,
      why: "好的雜湊函數讓最壞情況幾乎不會發生，但它在理論上存在，所以保證的是平均。",
    },
    {
      q: "雜湊表做不到下列哪件事？",
      choices: ["O(1) 查 key 在不在", "O(1) 覆蓋一個 key 的值", "依 key 的大小順序走訪", "刪除一個 key"],
      answer: 2,
      why: "雜湊表沒有順序。需要「比 k 大的最小鍵」或依序走訪時，改用平衡樹。",
    },
  ],
};
