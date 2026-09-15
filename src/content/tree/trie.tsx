import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { TrieDemo } from "@/components/lesson/demos/TrieDemo";
import type { Lesson } from "@/lib/lessons";

const python = `class TrieNode:
    def __init__(self):
        self.children = {}        # 字元 -> TrieNode
        self.is_end = False       # 有沒有單字在這裡結束


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:          # 沒有這條邊就開一條
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def _walk(self, s):
        """沿著 s 走到底，走不下去回傳 None"""
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

    def autocomplete(self, prefix):
        """列出所有以 prefix 開頭的單字：先走到前綴，再 DFS 收集"""
        node = self._walk(prefix)
        out = []
        def dfs(n, path):
            if n.is_end:
                out.append(path)
            for ch, child in sorted(n.children.items()):
                dfs(child, path + ch)
        if node:
            dfs(node, prefix)
        return out


t = Trie()
for w in ["car", "cat", "cart", "dog"]:
    t.insert(w)
print(t.search("ca"), t.starts_with("ca"))   # False True
print(t.autocomplete("ca"))                  # ['car', 'cart', 'cat']`;

const cpp = `#include <string>
#include <vector>
#include <array>

// 只有小寫字母時，用固定 26 格的陣列比 map 快
struct TrieNode {
    std::array<TrieNode*, 26> next{};
    bool isEnd = false;
};

class Trie {
    TrieNode* root = new TrieNode();
    TrieNode* walk(const std::string& s) {
        TrieNode* n = root;
        for (char c : s) {
            n = n->next[c - 'a'];
            if (!n) return nullptr;
        }
        return n;
    }
    void dfs(TrieNode* n, std::string& path, std::vector<std::string>& out) {
        if (n->isEnd) out.push_back(path);
        for (int i = 0; i < 26; i++) if (n->next[i]) {
            path.push_back('a' + i);
            dfs(n->next[i], path, out);
            path.pop_back();
        }
    }
public:
    void insert(const std::string& w) {
        TrieNode* n = root;
        for (char c : w) {
            if (!n->next[c - 'a']) n->next[c - 'a'] = new TrieNode();
            n = n->next[c - 'a'];
        }
        n->isEnd = true;
    }
    bool search(const std::string& w) { TrieNode* n = walk(w); return n && n->isEnd; }
    bool startsWith(const std::string& p) { return walk(p) != nullptr; }
    std::vector<std::string> autocomplete(const std::string& p) {
        std::vector<std::string> out;
        TrieNode* n = walk(p);
        if (!n) return out;
        std::string path = p;
        dfs(n, path, out);
        return out;
    }
};`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "搜尋列的自動補全",
              problem: "使用者打了「alg」，要立刻列出所有以 alg 開頭的詞。字典有幾十萬個詞，每次都掃一遍太慢；雜湊表又只能查完整的鍵。",
              why: "字典樹把共用前綴的詞疊在同一條路徑上。走 3 步到達「alg」，它底下的所有葉就是答案，成本和字典大小無關。",
            },
            {
              title: "拼字檢查與敏感詞過濾",
              problem: "一篇文章的每個字都要查「在不在字典裡」，或掃一段文字看有沒有出現任何一個敏感詞。",
              why: "查一個長度 L 的字只要 L 步。多個模式一起比對時，把所有模式建成一棵樹，掃文字時一次對照全部，這是 Aho-Corasick 的基礎。",
            },
            {
              title: "路由器的 IP 查表",
              problem: "路由表有幾十萬條規則，每個封包要找「最長前綴匹配」的那一條，而且每秒要處理百萬個封包。",
              why: "把 IP 當成位元字串放進字典樹，沿著封包的位元往下走，走到最深的有效節點就是最長前綴。這是二元字典樹（radix tree）的經典用途。",
            },
          ]}
          cue="前綴、開頭是、自動補全、多個字串共用前綴、最長前綴匹配、字典。"
        />
      </Section>

      <Section id="concept">
        <p>
          字典樹（Trie，來自 re<strong>trie</strong>val）是一棵<strong>邊上有字元</strong>的樹。從根出發，沿著邊把字元串起來，走到任何一個節點，路徑就是一個前綴。共用前綴的字串共用路徑：car、cat、cart 只需要一條 c-a 的路，之後才分岔。每個節點另外有一個<strong>結尾標記</strong>，表示「有一個字串剛好在這裡結束」，這樣才能區分「ca 只是前綴」和「car 是一個字」。
        </p>
        <p>
          插入、查詢、判斷前綴，都是<strong>沿著字串的每個字元往下走一步</strong>，成本是字串長度 O(L)，和樹裡有多少字串無關。這是它和雜湊表的差別：雜湊表也能 O(L) 查一個完整的字，但它對前綴一無所知；字典樹走到前綴那個節點之後，底下的整棵子樹都是答案。
        </p>
        <p>
          代價在<strong>空間</strong>。每個節點要存子節點表：字元集小（26 個小寫字母）就用固定陣列，查一步是 O(1) 但每個節點 26 個指標；字元集大（Unicode）就用雜湊表，省空間但慢一點。實務上還會做<strong>壓縮</strong>，把只有一個子節點的鏈合併成一段字串，那就是 radix tree，路由表和許多檔案系統用的就是它。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>節點結構：一個子節點表（<Code>dict</Code> 或長度 26 的陣列）加一個 <Code>is_end</Code> 布林。根對應空字串。</>,
            <><strong>插入</strong>：從根開始，對每個字元，沒有對應的子節點就建一個，然後走過去。最後一個節點標 <Code>is_end = True</Code>。</>,
            <><strong>查單字</strong>：沿字元走，任何一步走不下去就是不存在；走完還要檢查 <Code>is_end</Code>。<strong>查前綴</strong>：只要走得完就算有。</>,
            <><strong>自動補全</strong>：先走到前綴的節點，再對那棵子樹做 DFS，遇到 <Code>is_end</Code> 就收集一個字。</>,
            <>字元集固定且小時用陣列存子節點，查得快；否則用雜湊表。字串非常多時考慮壓縮成 radix tree。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>插入 car、cat、cart、dog，看共用的 c-a 路徑怎麼被重複利用。接著查前綴 ca 做自動補全，再分別查 ca 與 cart 是不是完整的字。綠色節點是有結尾標記的。</p>
        <TrieDemo />
      </Section>

      <Section id="code">
        <p>插入、查單字、查前綴與自動補全。Python 版用 dict 存子節點，C++ 版示範小寫字母用固定陣列的寫法。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 208", name: "Implement Trie (Prefix Tree)", diff: "Medium" },
            { src: "LeetCode 211", name: "Design Add and Search Words（含萬用字元的 DFS）", diff: "Medium" },
            { src: "LeetCode 1268", name: "Search Suggestions System（自動補全）", diff: "Medium" },
            { src: "LeetCode 212", name: "Word Search II（字典樹 + 網格回溯）", diff: "Hard" },
            { src: "LeetCode 648", name: "Replace Words（最短前綴）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const trieLesson: Lesson = { prereq: "Hash Table、Traversal", Body };
