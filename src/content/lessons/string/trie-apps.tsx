import { TrieAppsDemo } from "@/components/lesson/demos/TrieAppsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from collections import deque


class AhoCorasick:
    """Multi-pattern matching: O(total keyword length) to build, O(n + matches) to scan"""

    def __init__(self, words):
        self.goto = [{}]                        # children of each node: char -> node index
        self.fail = [0]
        self.out = [[]]                         # keywords to report when we land on this node
        for w in words:
            node = 0
            for ch in w:
                if ch not in self.goto[node]:
                    self.goto[node][ch] = len(self.goto)
                    self.goto.append({})
                    self.fail.append(0)
                    self.out.append([])
                node = self.goto[node][ch]
            self.out[node].append(w)
        q = deque(self.goto[0].values())        # every depth-1 fail link points at the root
        while q:                                # BFS: a fail link always points to a shallower, finished node
            u = q.popleft()
            for ch, v in self.goto[u].items():
                q.append(v)
                f = self.fail[u]
                while f and ch not in self.goto[f]:
                    f = self.fail[f]
                self.fail[v] = self.goto[f].get(ch, 0)
                self.out[v] = self.out[v] + self.out[self.fail[v]]   # report suffixes that are keywords too

    def search(self, text):
        res, node = [], 0
        for i, ch in enumerate(text):
            while node and ch not in self.goto[node]:
                node = self.fail[node]          # stuck: jump back along the fail links
            node = self.goto[node].get(ch, 0)
            for w in self.out[node]:
                res.append((i - len(w) + 1, w))
        return res


def find_words(board, words):
    """Word Search II: carry the trie node through the DFS and prune as soon as a prefix is missing"""
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = w                           # the end marker stores the whole word
    rows, cols = len(board), len(board[0])
    found = []

    def dfs(r, c, parent):
        ch = board[r][c]
        node = parent.get(ch)
        if node is None:                        # no word starts with this prefix
            return
        if "$" in node:
            found.append(node.pop("$"))         # take it and clear it, so it is not reported twice
        board[r][c] = "#"
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "#":
                dfs(nr, nc, node)
        board[r][c] = ch
        if not node:
            parent.pop(ch)                      # every word under this prefix is found: prune the branch

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)
    return sorted(found)


def max_xor_pair(nums, bits=31):
    """Insert each integer's bits, high bit first, as if it were a string; a query takes the opposite bit whenever it can"""
    root, best = {}, 0
    for x in nums:
        node = root
        for b in range(bits - 1, -1, -1):
            node = node.setdefault((x >> b) & 1, {})
        node, cur = root, 0
        for b in range(bits - 1, -1, -1):
            want = 1 - ((x >> b) & 1)
            if want in node:
                cur |= 1 << b
                node = node[want]
            else:
                node = node[1 - want]
        best = max(best, cur)
    return best


if __name__ == "__main__":
    ac = AhoCorasick(["he", "she", "his", "hers"])
    print(ac.search("ushers"))                  # [(1, 'she'), (2, 'he'), (2, 'hers')]
    board = [list("oaan"), list("etae"), list("ihkr"), list("iflv")]
    print(find_words(board, ["oath", "pea", "eat", "rain"]))   # ['eat', 'oath']
    print(max_xor_pair([3, 10, 5, 25, 2, 8]))   # 28: 5 XOR 25`;

const cpp = `#include <algorithm>
#include <array>
#include <iostream>
#include <queue>
#include <string>
#include <vector>

// Aho–Corasick over lowercase letters only. Once built, the missing transitions are filled in
// to give a complete automaton: one table lookup per character, with no jump-back loop at all
struct AhoCorasick {
    std::vector<std::array<int, 26>> next;
    std::vector<int> fail, cnt;                     // cnt[v]: keywords ending at v (including those on its fail chain)

    AhoCorasick() : next(1), fail(1, 0), cnt(1, 0) { next[0].fill(-1); }

    void insert(const std::string& w) {
        int node = 0;
        for (char ch : w) {
            int c = ch - 'a';
            if (next[node][c] == -1) {
                next[node][c] = static_cast<int>(next.size());
                next.emplace_back();
                next.back().fill(-1);
                fail.push_back(0);
                cnt.push_back(0);
            }
            node = next[node][c];
        }
        cnt[node]++;
    }

    void build() {
        std::queue<int> q;
        for (int c = 0; c < 26; c++) {
            if (next[0][c] == -1) next[0][c] = 0;   // a character the root lacks stays at the root
            else q.push(next[0][c]);
        }
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            cnt[u] += cnt[fail[u]];                 // fail[u] is shallower, so its count is already summed
            for (int c = 0; c < 26; c++) {
                int v = next[u][c];
                if (v == -1) {
                    next[u][c] = next[fail[u]][c];  // borrow the missing transition from the fail link
                } else {
                    fail[v] = next[fail[u]][c];
                    q.push(v);
                }
            }
        }
    }

    long long countMatches(const std::string& text) const {
        long long total = 0;
        int state = 0;
        for (char ch : text) {
            state = next[state][ch - 'a'];
            total += cnt[state];
        }
        return total;
    }
};

// Bit trie, array-based: every node has exactly two children
int maxXorPair(const std::vector<int>& nums) {
    const int BITS = 31;
    std::vector<std::array<int, 2>> child(1, {-1, -1});
    int best = 0;
    for (int x : nums) {
        int node = 0;
        for (int b = BITS - 1; b >= 0; b--) {
            int bit = (x >> b) & 1;
            if (child[node][bit] == -1) {
                child[node][bit] = static_cast<int>(child.size());
                child.push_back({-1, -1});
            }
            node = child[node][bit];
        }
        node = 0;
        int cur = 0;
        for (int b = BITS - 1; b >= 0; b--) {
            int want = 1 - ((x >> b) & 1);
            if (child[node][want] != -1) { cur |= 1 << b; node = child[node][want]; }
            else node = child[node][1 - want];
        }
        best = std::max(best, cur);
    }
    return best;
}

int main() {
    AhoCorasick ac;
    for (const char* w : {"he", "she", "his", "hers"}) ac.insert(w);
    ac.build();
    std::cout << ac.countMatches("ushers") << ' ' << ac.countMatches("ahishers") << '\\n';   // 3 4
    std::cout << maxXorPair({3, 10, 5, 25, 2, 8}) << '\\n';                              // 28
}`;

export const skeleton: LessonSkeleton = {
  demo: <TrieAppsDemo />,
  code: { python, cpp },
};
