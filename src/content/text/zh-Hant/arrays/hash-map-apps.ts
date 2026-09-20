import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Hash Table",
  applications: [
    {
      title: "找出兩筆加起來剛好等於目標的交易",
      problem: "對帳時要找「哪兩筆金額加起來是 1000」。兩層迴圈枚舉所有配對是 O(n²)，十萬筆就是一百億次。",
      why: "走到每一筆時，問「我需要的那個數字之前出現過嗎」。把看過的存進雜湊表，這個問題就是 O(1)，整體 O(n)。這是 Two Sum，也是所有「配對查找」的原型。",
    },
    {
      title: "搜尋引擎判斷兩個字是不是同一組字母",
      problem: "listen 和 silent 用了同樣的字母。拼字檢查、字謎遊戲、找重複的文件，都要快速判斷「內容一樣但順序不同」。",
      why: "數每個字母出現幾次，兩邊的計數表一樣就是同一組。雜湊表讓計數是 O(n)；再把「排序後的字串」當作 key，就能把所有同組的字一次分好。",
    },
    {
      title: "日誌裡出現最多次的錯誤是哪幾個",
      problem: "上億行 log，要找出前 10 名最常見的錯誤訊息。",
      why: "雜湊表計數一遍 O(n)，再取前 k 名。「統計頻率」是雜湊表最常見的用法，之後配上堆積就是 Top-K 問題。",
    },
  ],
  cue: "出現幾次、有沒有重複、找搭檔／配對、同一組的歸在一起、看過沒有、把 O(n²) 的內層迴圈換掉。",
  steps: [
    "先寫出暴力解，找到那層「在找東西」的**內迴圈**。它在找什麼？那就是雜湊表的 key。",
    "決定 value 是什麼：只要知道「在不在」用 `set`；要位置用「值 → 索引」；要次數用「值 → 計數」；要分組用「key → list」。",
    "從左到右**一趟**掃過去：先**查**雜湊表能不能回答問題，再把目前的元素**存**進去。順序反過來會讓元素和自己配對。",
    "分組題先想 key：同一組的元素經過什麼運算會變成一樣的值？確認那個值是不可變的型別。",
    "驗證複雜度：n 次迴圈，每次 O(1) 查與存，整體 O(n) 時間、O(n) 空間。若內迴圈還在，代表 key 設計得不對。",
  ],
  demoNote: "逐步看 Two Sum 一趟掃過陣列：每一步先查「需要的搭檔」在不在表裡，不在就把自己存進去。注意找到答案時，整個陣列只看了一遍。",
  codeNote:
    "四段程式碼對應四種模式。Python 的 `Counter` 和 `defaultdict` 是計數與分組的標準寫法；C++ 用 `unordered_map` 與 `unordered_set`。",
  problems: [
    { src: "LeetCode 1", name: "Two Sum（配對）", diff: "Easy" },
    { src: "LeetCode 242", name: "Valid Anagram（計數）", diff: "Easy" },
    { src: "LeetCode 219", name: "Contains Duplicate II（值 → 最近索引）", diff: "Easy" },
    { src: "LeetCode 49", name: "Group Anagrams（分組）", diff: "Medium" },
    { src: "LeetCode 347", name: "Top K Frequent Elements（計數 + 桶或堆積）", diff: "Medium" },
    { src: "LeetCode 128", name: "Longest Consecutive Sequence（存在性）", diff: "Medium" },
  ],
  quiz: [
    {
      q: "把暴力解從 O(n²) 變成 O(n) 的固定套路是？",
      choices: ["把外層迴圈改成遞迴", "把「在找東西」的內迴圈換成雜湊表查詢", "先排序再二分搜尋", "把陣列轉成字串"],
      answer: 1,
      why: "用 O(n) 的空間換掉一個 n：內迴圈找的東西就是雜湊表的 key。",
    },
    {
      q: "Two Sum 一趟掃過陣列時，每個元素要先做哪一步？",
      choices: ["先把自己存進表，再查搭檔", "先查 `target − x` 在不在表裡，再把自己存進去", "先排序", "先跳過重複的值"],
      answer: 1,
      why: "順序反過來，x 會跟自己配對（例如 target = 6、x = 3）。先查再存才安全。",
    },
    {
      q: "Group Anagrams 要把同一組的字串算出同一個 key，下列哪個 key 可行？",
      choices: ["字串的長度", "字串本身", "排序後的字串", "第一個字元"],
      answer: 2,
      why: "同組相同、不同組不同：anagram 排序後一定一樣。26 個字母的計數 tuple 也可以。",
    },
    {
      q: "下列哪一個**不能**當 Python dict 的 key？",
      choices: ["`(1, 2)`", "`\"abc\"`", "`[1, 2]`", "`42`"],
      answer: 2,
      why: "key 必須可雜湊、不可變。list 可以被修改所以不行，換成 tuple 就可以。",
    },
  ],
};
