import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { TrieAppsDemo } from "@/components/lesson/demos/TrieAppsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import deque


class AhoCorasick:
    """多模式比對：建表 O(關鍵字總長)，掃描 O(n + 回報次數)"""

    def __init__(self, words):
        self.goto = [{}]                        # 每個節點的子節點：字元 → 節點編號
        self.fail = [0]
        self.out = [[]]                         # 走到這個節點時要回報的關鍵字
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
        q = deque(self.goto[0].values())        # 第一層的失敗連結都指向根
        while q:                                # BFS：失敗連結一定指向更淺、已經算好的節點
            u = q.popleft()
            for ch, v in self.goto[u].items():
                q.append(v)
                f = self.fail[u]
                while f and ch not in self.goto[f]:
                    f = self.fail[f]
                self.fail[v] = self.goto[f].get(ch, 0)
                self.out[v] = self.out[v] + self.out[self.fail[v]]   # 後綴也是關鍵字時一起回報

    def search(self, text):
        res, node = [], 0
        for i, ch in enumerate(text):
            while node and ch not in self.goto[node]:
                node = self.fail[node]          # 走不下去就沿失敗連結往回跳
            node = self.goto[node].get(ch, 0)
            for w in self.out[node]:
                res.append((i - len(w) + 1, w))
        return res


def find_words(board, words):
    """Word Search II：DFS 時帶著字典樹節點，前綴不存在就立刻剪枝"""
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = w                           # 結尾標記直接存整個單字
    rows, cols = len(board), len(board[0])
    found = []

    def dfs(r, c, parent):
        ch = board[r][c]
        node = parent.get(ch)
        if node is None:                        # 沒有任何單字以這個前綴開頭
            return
        if "$" in node:
            found.append(node.pop("$"))         # 收下並清掉，避免重複回報
        board[r][c] = "#"
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "#":
                dfs(nr, nc, node)
        board[r][c] = ch
        if not node:
            parent.pop(ch)                      # 這段前綴底下的單字都找到了，整段剪掉

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)
    return sorted(found)


def max_xor_pair(nums, bits=31):
    """把整數的二進位從最高位開始當成字串插進字典樹；查詢時每一位都盡量走相反的位元"""
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
    print(max_xor_pair([3, 10, 5, 25, 2, 8]))   # 28：5 XOR 25`;

const cpp = `#include <algorithm>
#include <array>
#include <iostream>
#include <queue>
#include <string>
#include <vector>

// 只含小寫字母的 Aho–Corasick。建好之後把缺少的轉移補齊，變成完整的自動機：
// 掃描時每個字元只查一次表，連往回跳的 while 都不需要
struct AhoCorasick {
    std::vector<std::array<int, 26>> next;
    std::vector<int> fail, cnt;                     // cnt[v]：走到 v 時結束的關鍵字個數（包含失敗連結上的）

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
            if (next[0][c] == -1) next[0][c] = 0;   // 根沒有的字元就留在根
            else q.push(next[0][c]);
        }
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            cnt[u] += cnt[fail[u]];                 // fail[u] 比較淺，已經累加好了
            for (int c = 0; c < 26; c++) {
                int v = next[u][c];
                if (v == -1) {
                    next[u][c] = next[fail[u]][c];  // 缺的轉移直接借失敗連結那邊的
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

// 位元字典樹：陣列版，每個節點兩個子節點
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

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "防毒軟體比對大量病毒碼",
              problem: "防毒軟體的特徵資料庫有數十萬條病毒碼，每一條是一段位元組序列。掃描一個 50 MB 的檔案時，如果每條病毒碼各自在檔案裡搜尋一次，就是把檔案從頭讀幾十萬遍，完全不能接受。",
              why: "把所有病毒碼插進同一棵字典樹，再用 BFS 補上失敗連結，就是 Aho–Corasick 自動機。檔案只要從頭讀一遍，每讀一個位元組就在自動機上走一步，走不下去沿失敗連結往回跳，總時間是檔案長度加上命中次數，和病毒碼有幾條幾乎無關。開源防毒軟體 ClamAV 就用 Aho–Corasick 比對它的特徵碼。",
            },
            {
              title: "拼字遊戲的解題器",
              problem: "Boggle 拼字遊戲是一個 4 × 4 的字母方格，相鄰的格子（不能重複使用）可以連成單字。解題器要從一本 17 萬字的英文字典裡，找出方格中所有能拼出的單字。對每個單字各做一次方格搜尋，是 17 萬次回溯。",
              why: "把字典建成字典樹，只在方格上做一次 DFS，而且 DFS 時帶著目前的字典樹節點：下一格的字母如果不是子節點，就代表字典裡沒有任何單字以這個前綴開頭，立刻剪枝。大部分的路徑走兩三格就被剪掉，找到的單字從樹上移除，已經找完的整段前綴也跟著剪掉，越搜越快。",
            },
            {
              title: "分散式網路尋找最近的節點",
              problem: "BitTorrent 的 DHT 網路裡有數百萬台電腦，每台電腦和每份資料都有一個 160 位元的 ID，資料存放在 ID 和它「最接近」的幾台電腦上。Kademlia 協定把兩個 ID 的距離定義為兩者 XOR 的值，查詢時要快速找到距離某個 ID 最近的節點。",
              why: "XOR 距離由最高的不同位元決定，所以把 ID 的二進位從最高位開始插進字典樹，共同前綴越長的節點距離越近。找最近的節點，就是從最高位往下，每一位盡量走和目標相同的位元；反過來要找 XOR 最大的數，就每一位盡量走相反的位元。Kademlia 的路由表正是依照共同前綴長度分組，查詢只需要 O(log n) 次跳轉。",
            },
          ]}
          cue="很多個模式要在同一段文字裡一起找、字典裡的大量單字要在方格或圖上搜尋、需要前綴剪枝、整數的位元當成字元（最大 XOR、XOR 距離）、依前綴統計數量。"
        />
      </Section>

      <Section id="concept">
        <p>
          字典樹那一課的重點是「共用前綴、沿著字元往下走」。這一課的三種應用都建立在同一個想法上：<strong>把一大堆字串疊成一棵樹之後，一次走訪就能同時處理所有字串</strong>，成本取決於樹的大小和輸入的長度，而不是字串的個數。第一種是<strong>帶著字典樹做搜尋</strong>，例如在字母方格裡找字典中的所有單字（Word Search II）：DFS 每走一格，就在字典樹上同步往下走一層，下一個字母不是子節點就剪枝。沒有字典樹時，每個單字都要各自回溯一次。
        </p>
        <p>
          第二種是 <strong>Aho–Corasick</strong> 多模式比對。它是 KMP 的推廣：KMP 的 pi 表告訴你「失配後已經比對的部分還能保留多長」，Aho–Corasick 則替字典樹的每個節點 v 算出<strong>失敗連結</strong> fail(v)，指向「v 的最長真後綴，而且這個後綴也是樹上的前綴」。建法是 BFS：節點 v 是父節點 u 加上字元 c，就從 fail(u) 開始找有沒有 c 這條邊，沒有就繼續沿失敗連結往上。BFS 保證較淺的節點先算好。另外要讓 v 繼承 fail(v) 的輸出，因為 she 的結尾 he 也是關鍵字，走到 she 時兩個都要回報。掃描文字時每讀一個字元往下走一步，走不下去就沿失敗連結往回跳；往回跳的總次數不超過往下走的次數，所以掃描是 <strong>O(n + 回報次數)</strong>，建表 O(關鍵字總長 × 字元集大小) 或 O(關鍵字總長)。
        </p>
        <p>
          第三種是<strong>位元字典樹</strong>：把整數寫成固定位數的二進位，從最高位開始當成字串插入，每個節點只有 0、1 兩個子節點。要找和 x XOR 最大的數，就從最高位往下，每一位優先走和 x 相反的位元，因為高位的一個 1 比所有低位加起來都大，這個貪心是對的。插入和查詢都是 <strong>O(B)</strong>，B 是位元數，n 個數總共 O(nB) 時間和空間。在節點上多存「經過這裡的數有幾個」，還能回答「XOR 小於 k 的有幾個」或「第 k 小的數」。
        </p>
        <p>
          常見的坑：Word Search II 找到單字後沒有清掉結尾標記，同一個單字會被回報很多次；走過的格子忘了標記和還原；沒有把已經空掉的分支剪掉，重複搜尋同樣的前綴。Aho–Corasick 用 DFS 順序建失敗連結，算 fail(v) 時 fail(u) 可能還沒算好；忘了沿失敗連結收集輸出，漏掉被包含在別的關鍵字尾巴的短關鍵字；每個節點開 26 格陣列時，關鍵字總長一大記憶體就爆了，字元集大時要改用雜湊表。位元字典樹的位元數必須固定，而且所有數要一致；有負數時要先想清楚最高位的意義。和鄰近課程的關係：字典樹的基本操作在 Trie 那一課；失敗連結就是 KMP 的前綴函數搬到樹上；Word Search 的回溯加上字典樹剪枝就是 Word Search II；位元字典樹搭配 XOR Tricks 裡的性質使用。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>決定「字元」是什麼：一般字串用字元，整數用固定位數的位元（從最高位開始），把所有字串或數字插進字典樹。</>,
            <>要在方格或圖上找很多單字：DFS 時帶著目前的字典樹節點，下一格的字元不是子節點就剪枝；走到結尾標記就收下答案並清掉標記。</>,
            <>要在文字裡同時找很多模式：用 BFS 替每個節點補失敗連結 <Code>fail(v)</Code>，並把 <Code>fail(v)</Code> 的輸出併進 v 的輸出。</>,
            <>掃描文字：每讀一個字元，走不下去就沿失敗連結往回跳，直到能走或回到根；抵達節點時回報它的所有輸出。</>,
            <>整數的最大 XOR：查詢 x 時從最高位往下，每一位優先走和 x 相反的位元，沒有才走相同的，沿路組出的就是最大的 XOR 值。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>用 Aho–Corasick 在文字 ushers 裡同時找 he、she、his、hers。第一段插入四個關鍵字，藍色是剛建好的節點，綠色是關鍵字結尾。第二段用 BFS 補失敗連結，黃色虛線是不指向根的連結，每一步說明從父節點的失敗連結出發怎麼找：sh 指向 h、his 指向 s、she 指向 he，而且因為 he 是關鍵字，走到 she 時要一起回報 he；hers 指向 s。第三段掃描文字：藍色是目前的狀態，讀到 e 時抵達 she，同時回報 she 和 he；讀到 r 時 she 沒有 r 這條邊，沿著藍色虛線跳到 he，再往下走到 her；最後讀到 s 抵達 hers。文字只讀了一遍，三個關鍵字全部找到。</p>
        <TrieAppsDemo />
      </Section>

      <Section id="code">
        <p>Python 放用字典實作的 Aho–Corasick、帶著字典樹剪枝的 Word Search II（就是 LeetCode 212），以及位元字典樹求最大 XOR。C++ 放陣列版的 Aho–Corasick，建完後把缺少的轉移補齊成完整的自動機，掃描時每個字元只查一次表；另外是陣列版的位元字典樹。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 720", name: "Longest Word in Dictionary（每個前綴都要是單字）", diff: "Medium" },
            { src: "LeetCode 421", name: "Maximum XOR of Two Numbers in an Array（位元字典樹）", diff: "Medium" },
            { src: "LeetCode 2416", name: "Sum of Prefix Scores of Strings（節點上記錄經過次數）", diff: "Hard" },
            { src: "LeetCode 1032", name: "Stream of Characters（Aho–Corasick，或把單字反轉建樹）", diff: "Hard" },
            { src: "LeetCode 1707", name: "Maximum XOR With an Element From Array（離線排序後逐步插入位元字典樹）", diff: "Hard" },
            { src: "LeetCode 745", name: "Prefix and Suffix Search", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const trieAppsLesson: Lesson = { prereq: "Trie、KMP、Word Search", Body };
