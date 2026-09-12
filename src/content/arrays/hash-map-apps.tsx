import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { TwoSumDemo } from "@/components/lesson/demos/TwoSumDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import Counter, defaultdict

# 模式一：配對查找。走到 x 時問「我需要的搭檔看過沒」
def two_sum(nums, target):
    seen = {}                         # 值 → 索引
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i                   # 先查再存，才不會和自己配對


# 模式二：計數。一個字元／一個數字出現幾次
def is_anagram(s, t):
    return Counter(s) == Counter(t)   # Counter 就是 dict[元素, 次數]

def top_k_frequent(nums, k):
    freq = Counter(nums)
    return [x for x, _ in freq.most_common(k)]


# 模式三：分組。設計一個「同組的東西算出來會一樣」的 key
def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        key = "".join(sorted(w))      # "eat", "tea", "ate" 都變成 "aet"
        groups[key].append(w)
    return list(groups.values())


# 模式四：用 set 做 O(1) 的「在不在」，把 O(n²) 壓成 O(n)
def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:            # x 是某段連續數字的起點才往上數
            length = 1
            while x + length in s:
                length += 1
            best = max(best, length)
    return best                       # 每個數字最多被走到兩次 → O(n)`;

const cpp = `#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>

// 模式一：配對查找
std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;            // 值 → 索引
    for (int i = 0; i < (int)nums.size(); i++) {
        auto it = seen.find(target - nums[i]);
        if (it != seen.end()) return {it->second, i};
        seen[nums[i]] = i;
    }
    return {};
}

// 模式二：計數
bool isAnagram(const std::string& s, const std::string& t) {
    if (s.size() != t.size()) return false;
    std::unordered_map<char, int> freq;
    for (char c : s) freq[c]++;
    for (char c : t) if (--freq[c] < 0) return false;
    return true;
}

// 模式三：分組，key 是排序後的字串
std::vector<std::vector<std::string>> groupAnagrams(const std::vector<std::string>& words) {
    std::unordered_map<std::string, std::vector<std::string>> groups;
    for (const auto& w : words) {
        std::string key = w;
        std::sort(key.begin(), key.end());
        groups[key].push_back(w);
    }
    std::vector<std::vector<std::string>> out;
    for (auto& kv : groups) out.push_back(std::move(kv.second));
    return out;
}

// 模式四：用 set 做 O(1) 存在性檢查
int longestConsecutive(const std::vector<int>& nums) {
    std::unordered_set<int> s(nums.begin(), nums.end());
    int best = 0;
    for (int x : s) {
        if (s.count(x - 1)) continue;             // 不是起點就跳過
        int len = 1;
        while (s.count(x + len)) len++;
        best = std::max(best, len);
    }
    return best;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
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
          ]}
          cue="出現幾次、有沒有重複、找搭檔／配對、同一組的歸在一起、看過沒有、把 O(n²) 的內層迴圈換掉。"
        />
      </Section>

      <Section id="concept">
        <p>
          雜湊表本身只做一件事：<strong>O(1) 的「存」和「查」</strong>。它的威力來自一個固定套路：暴力解裡通常有一層內迴圈在「找某個東西」，把那層迴圈換成雜湊表查詢，O(n²) 就變成 O(n)。<strong>用 O(n) 的空間換掉一個 n</strong>。
        </p>
        <p>
          幾乎所有題目都是四種模式之一。<strong>配對查找</strong>：走到 x 時查「我需要的 target − x 看過沒」（Two Sum）。<strong>計數</strong>：key 是元素、value 是次數（Valid Anagram、Top K Frequent）。<strong>分組</strong>：設計一個「同組的元素會算出一樣的 key」（Group Anagrams 用排序後的字串）。<strong>存在性檢查</strong>：先把所有東西丟進 set，之後任何「在不在」都 O(1)（Longest Consecutive Sequence）。
        </p>
        <p>
          設計 key 是這類題的核心技巧。key 必須<strong>可雜湊</strong>（不可變：數字、字串、tuple，而不是 list），而且要「同組相同、不同組不同」。排序後的字串、26 個字母的計數 tuple、座標除以格子大小、前綴和的值，都是常見的 key。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>先寫出暴力解，找到那層「在找東西」的<strong>內迴圈</strong>。它在找什麼？那就是雜湊表的 key。</>,
            <>決定 value 是什麼：只要知道「在不在」用 <Code>set</Code>；要位置用「值 → 索引」；要次數用「值 → 計數」；要分組用「key → list」。</>,
            <>從左到右<strong>一趟</strong>掃過去：先<strong>查</strong>雜湊表能不能回答問題，再把目前的元素<strong>存</strong>進去。順序反過來會讓元素和自己配對。</>,
            <>分組題先想 key：同一組的元素經過什麼運算會變成一樣的值？確認那個值是不可變的型別。</>,
            <>驗證複雜度：n 次迴圈，每次 O(1) 查與存，整體 O(n) 時間、O(n) 空間。若內迴圈還在，代表 key 設計得不對。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>逐步看 Two Sum 一趟掃過陣列：每一步先查「需要的搭檔」在不在表裡，不在就把自己存進去。注意找到答案時，整個陣列只看了一遍。</p>
        <TwoSumDemo />
      </Section>

      <Section id="code">
        <p>四段程式碼對應四種模式。Python 的 <Code>Counter</Code> 和 <Code>defaultdict</Code> 是計數與分組的標準寫法；C++ 用 <Code>unordered_map</Code> 與 <Code>unordered_set</Code>。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1", name: "Two Sum（配對）", diff: "Easy" },
            { src: "LeetCode 242", name: "Valid Anagram（計數）", diff: "Easy" },
            { src: "LeetCode 219", name: "Contains Duplicate II（值 → 最近索引）", diff: "Easy" },
            { src: "LeetCode 49", name: "Group Anagrams（分組）", diff: "Medium" },
            { src: "LeetCode 347", name: "Top K Frequent Elements（計數 + 桶或堆積）", diff: "Medium" },
            { src: "LeetCode 128", name: "Longest Consecutive Sequence（存在性）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const hashMapAppsLesson: Lesson = { prereq: "Hash Table", Body };
