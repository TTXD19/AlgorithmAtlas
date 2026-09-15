import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { GreedyPrinciplesDemo } from "@/components/lesson/demos/GreedyPrinciplesDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 區間排程：同一個骨架，換三種排序依據，只有「最早結束」是對的
def schedule(intervals, key):
    """intervals 是 (start, end) 的列表，key 決定貪婪的順序。
    回傳選出的區間，彼此不重疊（允許首尾相接）。"""
    chosen = []
    for s, e in sorted(intervals, key=key):
        # 和每個已選的區間都不重疊才選。只看「最後選的結束時間」不夠：
        # 按長度排序時，後面拿到的區間可能在時間上排在前面
        if all(e <= cs or s >= ce for cs, ce in chosen):
            chosen.append((s, e))
    return chosen


def by_start(iv):                             # 最早開始：錯
    return iv[0]

def by_length(iv):                            # 最短：錯
    return (iv[1] - iv[0], iv[0])

def by_end(iv):                               # 最早結束：對
    return iv[1]


# 暴力驗證：小資料上列舉所有子集合，看貪婪有沒有拿到最佳
# 想不出交換論證時先跑這個，找到反例就不用再想證明了
from itertools import combinations

def brute_force(intervals):
    n = len(intervals)
    for r in range(n, 0, -1):                 # 從大到小試，第一個可行的就是最佳
        for subset in combinations(intervals, r):
            ok = all(a[1] <= b[0] or b[1] <= a[0] for a, b in combinations(subset, 2))
            if ok:
                return r
    return 0


if __name__ == "__main__":
    ivs = [(0, 12), (1, 5), (4, 7), (6, 10), (11, 14), (13, 16), (15, 18)]
    print(brute_force(ivs))                   # 4
    for name, key in [("start", by_start), ("length", by_length), ("end", by_end)]:
        print(name, len(schedule(ivs, key)))  # start 2, length 3, end 4`;

const cpp = `#include <vector>
#include <algorithm>
#include <functional>
#include <cstdio>

using Iv = std::pair<int, int>;               // (start, end)

// 依 cmp 排序後逐一挑選：和每個已選的區間都不重疊才選
std::vector<Iv> schedule(std::vector<Iv> ivs, std::function<bool(const Iv&, const Iv&)> cmp) {
    std::sort(ivs.begin(), ivs.end(), cmp);
    std::vector<Iv> chosen;
    for (auto& [s, e] : ivs) {
        bool ok = true;
        for (auto& [cs, ce] : chosen)
            if (!(e <= cs || s >= ce)) { ok = false; break; }
        if (ok) chosen.push_back({s, e});
    }
    return chosen;
}

bool byStart(const Iv& a, const Iv& b) { return a.first < b.first; }          // 錯
bool byLength(const Iv& a, const Iv& b) {                                       // 錯
    int la = a.second - a.first, lb = b.second - b.first;
    return la != lb ? la < lb : a.first < b.first;
}
bool byEnd(const Iv& a, const Iv& b) { return a.second < b.second; }            // 對

// 暴力：枚舉所有子集合（n ≤ 20 才跑得動）
int bruteForce(const std::vector<Iv>& ivs) {
    int n = ivs.size(), best = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        bool ok = true;
        for (int i = 0; i < n && ok; i++) if (mask >> i & 1)
            for (int j = i + 1; j < n && ok; j++) if (mask >> j & 1)
                if (!(ivs[i].second <= ivs[j].first || ivs[j].second <= ivs[i].first)) ok = false;
        if (ok) best = std::max(best, __builtin_popcount(mask));
    }
    return best;
}

int main() {
    std::vector<Iv> ivs = {{0, 12}, {1, 5}, {4, 7}, {6, 10}, {11, 14}, {13, 16}, {15, 18}};
    printf("%d\\n", bruteForce(ivs));                                           // 4
    printf("%zu %zu %zu\\n", schedule(ivs, byStart).size(),
           schedule(ivs, byLength).size(), schedule(ivs, byEnd).size());       // 2 3 4
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "只做眼前最好的選擇，會不會後悔",
              problem: "排會議、找零、壓縮檔案、規劃路線，很多問題都有一個「每一步選當下最好的」直覺做法。它跑得快、程式短，但有時候會得到錯的答案，而且錯得很安靜，沒有例外、沒有警告。",
              why: "貪婪法不是一個演算法，是一種做決定的方式。這一課教的是判斷準則：什麼時候「局部最好」會累積成「全域最好」，什麼時候不會。判斷對了，就用最快的解法；判斷錯了，就轉去用 DP 或搜尋。",
            },
            {
              title: "面試題的第一個分岔",
              problem: "看到最佳化問題，你得在幾分鐘內決定走貪婪還是 DP。走錯方向，貪婪寫完才發現有反例，或者 DP 寫了半天其實一行排序就夠。",
              why: "有一套固定的檢查流程：先猜一個貪婪策略，找反例，找不到就試著用交換論證證明。這一課把流程走一遍，之後每一課的貪婪解都用同一套方法確認。",
            },
            {
              title: "資料太大，DP 表格放不下",
              problem: "DP 能保證正確，但狀態數常常是 O(n²) 甚至更多。輸入上百萬筆時，記憶體和時間都撐不住。",
              why: "能證明貪婪正確的問題，通常只要排序加一次掃描，O(n log n) 時間、O(1) 額外空間。這是貪婪值得學的理由：它是最便宜的最佳化方法，前提是你知道它什麼時候能用。",
            },
          ]}
          cue="每一步選最大／最小／最早、排序後掃一遍、不回頭、局部最佳、交換論證、反例。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>貪婪法</strong>的形狀很固定：把候選者按某個準則排序，逐一檢查，符合條件就選，選了就不再改。它不回頭、不比較不同的選法，所以通常只要 <strong>O(n log n)</strong>（排序）加 <strong>O(n)</strong>（掃描）。快的代價是它不一定對，而一個貪婪策略對不對，取決於問題有沒有兩個性質。
        </p>
        <p>
          第一個是<strong>貪婪選擇性質</strong>：存在某個最佳解，它的第一步和貪婪的第一步一樣。第二個是<strong>最佳子結構</strong>：做完第一步之後剩下的問題，是一個形狀相同、規模更小的問題，而且它的最佳解接上第一步就是原問題的最佳解。兩個性質都成立，貪婪每走一步都能保持「和某個最佳解一致」，走到底就是最佳解。
        </p>
        <p>
          證明貪婪選擇性質的標準工具是<strong>交換論證</strong>。拿任何一個最佳解 O，看它和貪婪解 G 第一個不一樣的地方；把 O 在那個位置的選擇換成 G 的選擇，論證換完後 O 仍然合法而且不會變差。這表示「和貪婪一致的最佳解」存在。以區間排程為例，貪婪選最早結束的區間 G₁，任何最佳解裡第一個結束的 O₁ 一定不早於 G₁ 結束，把 O₁ 換成 G₁，後面的區間照樣放得下。
          反過來，「最早開始」和「最短」都找得到反例，交換時可能要換掉兩個以上的區間，論證做不下去。
        </p>
        <p>
          實務上的順序是：先猜一個策略，用<strong>小資料找反例</strong>（手算或寫暴力解對照），找到反例就換策略或改用 DP；找不到反例再嘗試交換論證。常見誤區是把「跑了幾筆測資都對」當成證明，貪婪的錯誤常常只在特定輸入出現，找零問題的 <Code>[1, 3, 4]</Code> 就是典型例子。另一個誤區是覺得貪婪和 DP 是對立的：貪婪其實是 DP 的特例，當每個狀態的最佳轉移可以不看其他選項直接決定時，DP 就退化成貪婪。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>把問題寫成「一連串選擇」，每次選擇後剩下一個更小的同型問題。</>,
            <>猜一個<strong>排序準則</strong>（最早結束、最小、比值最大…），按它排序後逐一掃描，符合條件就選。</>,
            <>用小資料<strong>找反例</strong>：手算 5 到 10 個元素，或寫暴力解在 n ≤ 15 上對照。有反例就換準則或放棄貪婪。</>,
            <>找不到反例，做<strong>交換論證</strong>：任取最佳解 O，把它第一個和貪婪不同的選擇換成貪婪的選擇，論證仍合法且不變差。</>,
            <>確認<strong>最佳子結構</strong>：選完第一步後的剩餘問題形狀不變。兩者成立，貪婪解就是最佳解，複雜度通常是 O(n log n)。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>同一組 7 個區間，切換三種貪婪準則，一步一步看每個準則選了什麼、跳過什麼。最佳解是 4 個。右下角是這個準則為什麼對或為什麼錯：對的有交換論證，錯的有一個具體反例。</p>
        <GreedyPrinciplesDemo />
      </Section>

      <Section id="code">
        <p>一個通用的排序加掃描骨架，換三種排序依據，再加一個暴力解當對照。找反例的時候就是這樣做：小資料上讓貪婪和暴力比一比。為了讓三種準則共用，骨架把每個候選和所有已選區間逐一比對；確定要按結束時間排序後，只要和最後選的那個比就夠，Interval Scheduling 會寫成 O(n log n) 的版本。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 455", name: "Assign Cookies（排序後兩指標）", diff: "Easy" },
            { src: "LeetCode 1029", name: "Two City Scheduling（按差額排序）", diff: "Medium" },
            { src: "LeetCode 763", name: "Partition Labels", diff: "Medium" },
            { src: "LeetCode 406", name: "Queue Reconstruction by Height", diff: "Medium" },
            { src: "LeetCode 621", name: "Task Scheduler", diff: "Medium" },
            { src: "LeetCode 135", name: "Candy（兩趟貪婪）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const principlesLesson: Lesson = { prereq: "Big-O Notation", Body };
