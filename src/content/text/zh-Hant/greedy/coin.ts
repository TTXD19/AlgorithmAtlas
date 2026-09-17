import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Greedy Principles",
  applications: [
    {
      title: "收銀機找零",
      problem: "客人付了 100 元買 37 元的東西，要找 63 元。收銀員不會列舉所有組合，而是從最大的面額開始拿：50、10、1、1、1，五個硬幣。這個做法在台幣、美金、歐元上都對。",
      why: "這正是貪婪：每次拿不超過剩餘金額的最大面額。它對，是因為這些幣制設計成「大面額是小面額的整數倍或接近整數倍」，拿大的永遠不會比拿小的差。這一課先確認它為什麼對，再看它什麼時候會錯。",
    },
    {
      title: "自動販賣機的硬幣槽",
      problem: "某台販賣機只裝了 1、3、4 元三種硬幣。要找 6 元，貪婪會給 4+1+1 三枚，但其實 3+3 兩枚就夠。硬幣槽會提早用光。",
      why: "同一個貪婪演算法，換一組幣值就錯了。這是貪婪法最重要的教訓：正確性來自輸入的結構，不是來自演算法本身。判斷幣值能不能貪，有一個明確的檢查方法。",
    },
    {
      title: "任意幣值的最少硬幣數",
      problem: "面試題給你任意面額陣列和金額，問最少幾枚。看起來像找零，但幣值沒有保證，貪婪會在某些測資上錯。",
      why: "這時候要用 DP：dp[a] 是湊出 a 元最少幾枚，對每個面額 c 試 dp[a − c] + 1。貪婪是 DP 的特例，當幣制是標準幣制時，DP 每一步的最佳轉移剛好就是「拿最大的」。",
    },
  ],
  cue: "找零、最少硬幣、面額由大到小、標準幣制、貪婪會錯就轉 DP。",
  steps: [
    "把面額**由大到小**排序。",
    "對每種面額 c：`count = amount // c`，拿 count 枚，`amount %= c`。",
    "迴圈結束時 amount 應該是 0；不是 0 代表這組面額湊不出這個金額（有 1 元時不會發生）。",
    "要確認這組幣值能不能貪：對 1 到「最大兩個面額之和」的每個金額，比較貪婪和 DP 的枚數，全部相同就是標準幣制。",
    "不是標準幣制，就改用 DP：`dp[0] = 0`，`dp[a] = min(dp[a − c] + 1)`，最後看 `dp[amount]`。",
  ],
  demoNote:
    "切換兩組幣值和四個金額。貪婪每一步拿一種面額，右側是 DP 算出的最佳解。留意 `[1, 3, 4]` 找 6 元和 10 元的結果，以及 27 元為什麼又剛好對了：反例不是每個金額都出現，所以幾筆測資通過不代表演算法正確。",
  codeNote:
    "貪婪版、DP 版，以及判斷幣值是否為標準幣制的檢查函式。三個函式合起來就是這一課的結論：能貪就貪，不能貪就 DP，而且有辦法事先知道能不能貪。",
  problems: [
    { src: "LeetCode 860", name: "Lemonade Change（找零時先拿大的）", diff: "Easy" },
    { src: "LeetCode 1710", name: "Maximum Units on a Truck（按單位價值排序）", diff: "Easy" },
    { src: "LeetCode 322", name: "Coin Change（任意面額，要用 DP）", diff: "Medium" },
    { src: "LeetCode 518", name: "Coin Change II（方法數，DP）", diff: "Medium" },
    { src: "LeetCode 279", name: "Perfect Squares（貪婪會錯的另一個例子）", diff: "Medium" },
  ],
};
