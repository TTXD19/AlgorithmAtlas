import { TwoSumDemo } from "@/components/lesson/demos/TwoSumDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from collections import Counter, defaultdict

# Pattern 1: pair lookup. At x, ask "have I already seen the partner I need?"
def two_sum(nums, target):
    seen = {}                         # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i                   # look up first, store after, or x pairs with itself


# Pattern 2: counting. How many times does a character or a number appear?
def is_anagram(s, t):
    return Counter(s) == Counter(t)   # a Counter is just dict[element, count]

def top_k_frequent(nums, k):
    freq = Counter(nums)
    return [x for x, _ in freq.most_common(k)]


# Pattern 3: grouping. Design a key that comes out the same for everything in a group
def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        key = "".join(sorted(w))      # "eat", "tea" and "ate" all become "aet"
        groups[key].append(w)
    return list(groups.values())


# Pattern 4: O(1) membership with a set, turning O(n²) into O(n)
def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:            # only count up when x starts a run
            length = 1
            while x + length in s:
                length += 1
            best = max(best, length)
    return best                       # each number is visited at most twice -> O(n)`;

const cpp = `#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>

// Pattern 1: pair lookup
std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;            // value -> index
    for (int i = 0; i < (int)nums.size(); i++) {
        auto it = seen.find(target - nums[i]);
        if (it != seen.end()) return {it->second, i};
        seen[nums[i]] = i;
    }
    return {};
}

// Pattern 2: counting
bool isAnagram(const std::string& s, const std::string& t) {
    if (s.size() != t.size()) return false;
    std::unordered_map<char, int> freq;
    for (char c : s) freq[c]++;
    for (char c : t) if (--freq[c] < 0) return false;
    return true;
}

// Pattern 3: grouping, keyed by the sorted string
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

// Pattern 4: O(1) membership checks with a set
int longestConsecutive(const std::vector<int>& nums) {
    std::unordered_set<int> s(nums.begin(), nums.end());
    int best = 0;
    for (int x : s) {
        if (s.count(x - 1)) continue;             // skip anything that is not the start of a run
        int len = 1;
        while (s.count(x + len)) len++;
        best = std::max(best, len);
    }
    return best;
}`;

export const skeleton: LessonSkeleton = {
  demo: <TwoSumDemo />,
  code: { python, cpp },
};
