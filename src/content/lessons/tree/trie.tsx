import { TrieDemo } from "@/components/lesson/demos/TrieDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `class TrieNode:
    def __init__(self):
        self.children = {}        # character -> TrieNode
        self.is_end = False       # does a word end right here?


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:          # no such edge yet, so open one
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def _walk(self, s):
        """Follow s as far as it goes; return None if the path runs out"""
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
        """List every word starting with prefix: walk to the prefix, then collect with DFS"""
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

// With lowercase letters only, a fixed 26-slot array is faster than a map
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

export const skeleton: LessonSkeleton = {
  demo: <TrieDemo />,
  code: { python, cpp },
};
