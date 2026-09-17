import { HuffmanDemo } from "@/components/lesson/demos/HuffmanDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `import heapq
from collections import Counter


def huffman_codes(text):
    """Returns {character: code}. The heap holds (frequency, serial, node); the serial keeps tuples comparable."""
    freq = Counter(text)
    heap = []
    for i, (ch, f) in enumerate(freq.items()):
        heapq.heappush(heap, (f, i, ch))      # a leaf is represented by the character itself
    seq = len(freq)
    while len(heap) > 1:
        f1, _, a = heapq.heappop(heap)        # the two lowest frequencies
        f2, _, b = heapq.heappop(heap)
        heapq.heappush(heap, (f1 + f2, seq, (a, b)))   # an internal node is a (left, right) pair
        seq += 1
    root = heap[0][2]
    codes = {}

    def walk(node, code):
        if isinstance(node, str):             # leaf
            codes[node] = code or "0"         # give "0" when there is only one distinct character
        else:
            walk(node[0], code + "0")
            walk(node[1], code + "1")

    walk(root, "")
    return codes


def encode(text, codes):
    return "".join(codes[ch] for ch in text)


def decode(bits, codes):
    rev = {v: k for k, v in codes.items()}    # prefix code: match as you read, no separators needed
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
    print(codes)                              # a takes 1 bit, c and d take 3
    print(len(bits), "bits, fixed length needs", len(text) * 3)   # 23 bits, fixed length needs 33
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
struct Cmp { bool operator()(Node* a, Node* b) const { return a->freq > b->freq; } };   // min-heap

// Walk down from the root, left is 0 and right is 1; the path to a leaf is that character's code
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
        Node* a = pq.top(); pq.pop();         // the two lowest frequencies
        Node* b = pq.top(); pq.pop();
        pq.push(new Node('#', a->freq + b->freq, a, b));   // merge them into an internal node
    }
    std::map<char, std::string> codes;
    walk(pq.top(), "", codes);
    return codes;                             // freeing the memory is left out of the demo
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
    // Ties in frequency may be merged in either order, so these codes can differ from the Python ones, but the total bit count is always the same
    for (auto& [c, code] : codes) printf("%c %s\\n", c, code.c_str());
    printf("%zu bits, fixed %zu\\n", bits.size(), text.size() * 3);   // 23 bits, fixed 33
}`;

export const skeleton: LessonSkeleton = {
  demo: <HuffmanDemo />,
  code: { python, cpp },
};
