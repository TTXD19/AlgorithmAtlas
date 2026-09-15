import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { HuffmanDemo } from "@/components/lesson/demos/HuffmanDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import heapq
from collections import Counter


def huffman_codes(text):
    """回傳 {字元: 編碼}。堆積裡放 (頻率, 序號, 節點)，序號讓 tuple 永遠比得出大小。"""
    freq = Counter(text)
    heap = []
    for i, (ch, f) in enumerate(freq.items()):
        heapq.heappush(heap, (f, i, ch))      # 葉節點直接用字元代表
    seq = len(freq)
    while len(heap) > 1:
        f1, _, a = heapq.heappop(heap)        # 頻率最小的兩個
        f2, _, b = heapq.heappop(heap)
        heapq.heappush(heap, (f1 + f2, seq, (a, b)))   # 內部節點用 (左, 右)
        seq += 1
    root = heap[0][2]
    codes = {}

    def walk(node, code):
        if isinstance(node, str):             # 葉節點
            codes[node] = code or "0"         # 只有一種字元時給 "0"
        else:
            walk(node[0], code + "0")
            walk(node[1], code + "1")

    walk(root, "")
    return codes


def encode(text, codes):
    return "".join(codes[ch] for ch in text)


def decode(bits, codes):
    rev = {v: k for k, v in codes.items()}    # 前綴碼：邊讀邊比對，不需要分隔符
    out, cur = [], ""
    for b in bits:
        cur += b
        if cur in rev:
            out.append(rev[cur])
            cur = ""
    return "".join(out)


if __name__ == "__main__":
    text = "abracadabra"
    codes = huffman_codes(text)
    bits = encode(text, codes)
    print(codes)                              # a 是 1 位元，c、d 是 3 位元
    print(len(bits), "位元，固定長度要", len(text) * 3)   # 23 位元，固定長度要 33
    print(decode(bits, codes) == text)        # True`;

const cpp = `#include <queue>
#include <vector>
#include <string>
#include <map>
#include <cstdio>

struct Node {
    char ch; int freq; Node *l, *r;
    Node(char c, int f, Node* a = nullptr, Node* b = nullptr) : ch(c), freq(f), l(a), r(b) {}
};
struct Cmp { bool operator()(Node* a, Node* b) const { return a->freq > b->freq; } };   // 最小堆積

// 從根往下走，左 0 右 1，到葉節點就是該字元的編碼
void walk(Node* n, const std::string& code, std::map<char, std::string>& codes) {
    if (!n->l && !n->r) { codes[n->ch] = code.empty() ? "0" : code; return; }
    walk(n->l, code + "0", codes);
    walk(n->r, code + "1", codes);
}

std::map<char, std::string> huffmanCodes(const std::string& text) {
    std::map<char, int> freq;
    for (char c : text) freq[c]++;
    std::priority_queue<Node*, std::vector<Node*>, Cmp> pq;
    for (auto& [c, f] : freq) pq.push(new Node(c, f));
    while (pq.size() > 1) {
        Node* a = pq.top(); pq.pop();         // 頻率最小的兩個
        Node* b = pq.top(); pq.pop();
        pq.push(new Node('#', a->freq + b->freq, a, b));   // 合併成內部節點
    }
    std::map<char, std::string> codes;
    walk(pq.top(), "", codes);
    return codes;                             // 示範省略釋放記憶體
}

std::string encode(const std::string& text, std::map<char, std::string>& codes) {
    std::string out;
    for (char c : text) out += codes[c];
    return out;
}

int main() {
    std::string text = "abracadabra";
    auto codes = huffmanCodes(text);
    std::string bits = encode(text, codes);
    // 頻率相同時先合併誰沒有規定，這裡的編碼可能和 Python 版不同，但總位元數一定相同
    for (auto& [c, code] : codes) printf("%c %s\\n", c, code.c_str());
    printf("%zu bits, fixed %zu\\n", bits.size(), text.size() * 3);   // 23 bits, fixed 33
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "zip 為什麼能把文字檔壓到一半以下",
              problem: "一份英文文件裡 e 出現幾萬次，z 只出現幾次，但 ASCII 一律用 8 位元存每個字。常見的字和罕見的字花一樣的空間，明顯浪費。",
              why: "讓常見字元用短編碼、罕見字元用長編碼，總位元數就會下降。霍夫曼編碼每次把頻率最低的兩個合併成一棵樹，樹上的路徑就是編碼。它是 DEFLATE（zip、gzip、PNG）最後一個階段用的方法，而且可以證明在「每個字元一個編碼」的前提下是最短的。",
            },
            {
              title: "JPEG 與 MP3 的最後一步",
              problem: "影像和聲音經過轉換和量化後，會得到一大堆數字，其中 0 和小數字特別多，大數字很少。要把這些數字存成檔案，越小越好。",
              why: "這正是頻率極度不均的資料，霍夫曼編碼在這種分布上壓縮率最好。JPEG 的熵編碼階段、MP3 的位元流打包都用它。有損壓縮的「有損」發生在量化，霍夫曼這一步是無損的。",
            },
            {
              title: "編碼不能有歧義",
              problem: "變長編碼有個陷阱：如果 a 是 0、b 是 01，讀到 0 的時候不知道該停還是該繼續。加分隔符會把省下的空間吃回去。",
              why: "霍夫曼樹的字元全部在葉節點，所以沒有任何編碼是另一個編碼的前綴，這叫前綴碼。解碼時從根往下走，走到葉節點就輸出，不需要分隔符。貪婪合併的方式自然保證了這個性質。",
            },
          ]}
          cue="壓縮、變長編碼、頻率越高編碼越短、前綴碼、每次合併最小的兩個、最小堆積建樹。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>霍夫曼編碼</strong>要解的問題是：給每個字元的出現頻率，設計一組<strong>前綴碼</strong>（沒有編碼是另一個的前綴），讓「頻率 × 編碼長度」的總和最小。任何前綴碼都對應一棵二元樹，字元在葉節點，從根走到葉的路徑（左 0 右 1）就是編碼，編碼長度等於葉的深度。所以問題變成：怎麼排葉節點，讓<strong>加權深度總和</strong>最小。
        </p>
        <p>
          貪婪做法：把每個字元當成一個節點放進<strong>最小堆積</strong>，每次取出頻率最小的兩個，合併成一個頻率為兩者之和的新節點放回去，直到剩一個。頻率越小的節點越早被合併，就被推到樹的越深處，拿到越長的編碼；頻率最大的通常在最後才合併，深度最淺。n 種字元做 n − 1 次合併，每次堆積操作 O(log n)，總共 <strong>O(n log n)</strong>。
        </p>
        <p>
          為什麼是最佳？交換論證分兩步。第一，頻率最小的兩個字元 x、y 一定可以放在最深的一層當兄弟：若最佳樹裡最深的兄弟是別的字元 a、b，把 a、b 和 x、y 對調，深的位置換成頻率更小的，加權總和不會變大。第二，把 x、y 合併成一個頻率 x + y 的節點後，剩下的問題是少一個字元的同型問題，它的最佳樹接上 x、y 就是原問題的最佳樹。兩步合起來就是貪婪選擇性質加最佳子結構。
        </p>
        <p>
          注意幾件事。頻率相同時合併順序不唯一，所以霍夫曼碼不唯一，但總位元數一樣。只有一種字元時樹只有根，要特別給它編碼 <Code>0</Code>。解碼端需要同一棵樹，所以檔案裡要存編碼表（DEFLATE 用一套固定規則把表本身也壓得很小）。霍夫曼是「每個符號整數位元」下的最佳解，若允許每個符號花非整數個位元，算術編碼和 ANS 能再壓得更緊，xz 的 LZMA（區間編碼）和 zstd 的 FSE（ANS 的一種）走的就是這個方向。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>統計每個字元的頻率，每個字元建一個葉節點，全部放進<strong>最小堆積</strong>（依頻率）。</>,
            <>堆積裡多於一個節點時：取出頻率最小的兩個 a、b。</>,
            <>建新節點，頻率 <Code>a.freq + b.freq</Code>，左子 a、右子 b，放回堆積。重複直到剩一個，它就是根。</>,
            <>從根走遍整棵樹，左 0 右 1，走到葉節點就記下該字元的編碼。</>,
            <>編碼：逐字元查表串接。解碼：從根出發，讀 0 往左、讀 1 往右，碰到葉節點輸出並回到根。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>「abracadabra」有 5 種字元。每一步先標出堆積裡頻率最小的兩個（黃色），下一步把它們合併成新節點（藍色）放回堆積。建完樹後從根往下走就得到編碼表，最後比較總位元數：霍夫曼 23 位元，固定 3 位元編碼要 33。</p>
        <HuffmanDemo />
      </Section>

      <Section id="code">
        <p>用堆積建樹、走樹產生編碼表，加上編碼與解碼。Python 版用 tuple 表示內部節點，C++ 版用指標。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1046", name: "Last Stone Weight（每次取最大兩個）", diff: "Easy" },
            { src: "LeetCode 1167", name: "Minimum Cost to Connect Sticks（付費題，和霍夫曼一模一樣）", diff: "Medium" },
            { src: "LeetCode 347", name: "Top K Frequent Elements（統計頻率加堆積）", diff: "Medium" },
            { src: "LeetCode 767", name: "Reorganize String（按頻率用堆積排）", diff: "Medium" },
            { src: "LeetCode 1000", name: "Minimum Cost to Merge Stones（限制相鄰時貪婪失效，要區間 DP）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const huffmanLesson: Lesson = { prereq: "Greedy Principles、Binary Heap、Binary Tree", Body };
