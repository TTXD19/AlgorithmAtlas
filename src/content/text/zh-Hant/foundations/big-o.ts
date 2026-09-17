import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "無，這是起點",
  applications: [
    {
      title: "測試機很快，上線就超時",
      problem: "本機測 100 筆資料 0.01 秒，上線後 100 萬筆資料卻跑不完。兩層迴圈的程式，資料多一萬倍，時間多一億倍。",
      why: "Big-O 描述「時間怎麼隨資料量成長」，讓你在寫程式時就預測這件事，而不是上線後才發現。",
    },
    {
      title: "面試官問「這樣的複雜度是多少」",
      problem: "幾乎每一題演算法面試都會追問時間與空間複雜度，並要求你改進。這是業界共同的語言。",
      why: "說 O(n²) 比說「大概要跑很久」精確得多，而且每個人聽到都知道是什麼意思。",
    },
    {
      title: "決定值不值得優化",
      problem: "同事說要把某個函式從 O(n) 改成 O(log n)，但那個函式的 n 永遠不超過 10。",
      why: "Big-O 是成長趨勢，不是絕對速度。知道它的意義，也就知道什麼時候不用管它。",
    },
  ],
  cue: "這段程式的複雜度、資料量變十倍會慢幾倍、能不能更快、n 是多少。",
  steps: [
    "找出「n」是什麼：陣列長度、字串長度、節點數。有兩個輸入就用兩個變數，例如 O(m·n)。",
    "看迴圈的**層數與範圍**：一層跑 n 次是 O(n)，兩層巢狀各跑 n 次是 O(n²)，每次把範圍砍半的迴圈是 O(log n)。",
    "看**呼叫的函式**裡面做了什麼：迴圈裡呼叫一個 O(n) 的函式，整體就是 O(n²)。內建的 `sort` 是 O(n log n)，`in` 對 list 是 O(n)、對 set 是 O(1)。",
    "把各段相加，然後**丟掉常數與較小的項**：2n² + 5n + 100 → O(n²)。",
    "預設報**最壞情況**。若題目強調平均或攤銷，再另外說明。",
  ],
  demoNote: "切換 n 的大小，比較七種複雜度的操作次數。右邊那欄假設每次操作 1 奈秒，換算成實際要等多久。",
  codeNote: "同一個「有沒有重複元素」的問題，兩種寫法差一個 n。看程式時練習用上面的步驟數出每一段的複雜度。",
  problemsNote: "這幾題的重點不是解出來，而是先寫暴力解、算出複雜度，再想辦法降一階。",
  problems: [
    { src: "LeetCode 217", name: "Contains Duplicate（O(n²) → O(n)）", diff: "Easy" },
    { src: "LeetCode 1", name: "Two Sum（O(n²) → O(n)）", diff: "Easy" },
    { src: "LeetCode 704", name: "Binary Search（O(n) → O(log n)）", diff: "Easy" },
    { src: "LeetCode 189", name: "Rotate Array（O(n) 時間、O(1) 空間）", diff: "Medium" },
  ],
};
