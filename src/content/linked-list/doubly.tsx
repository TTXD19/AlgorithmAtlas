import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { LRUCacheDemo } from "@/components/lesson/demos/LRUCacheDemo";
import type { Lesson } from "@/lib/lessons";

const python = `class Node:
    def __init__(self, key=None, val=None):
        self.key, self.val = key, val
        self.prev = self.next = None


class LRUCache:
    """雙向串列記使用順序（head 側最近），雜湊表 O(1) 找到節點。"""

    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}                      # key → Node
        self.head, self.tail = Node(), Node()   # 兩個哨兵
        self.head.next, self.tail.prev = self.tail, self.head

    # --- 兩個 O(1) 的串列動作 ---
    def _unlink(self, node):
        node.prev.next = node.next         # 有 prev 才能 O(1) 拆掉自己
        node.next.prev = node.prev

    def _push_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    # --- 對外介面 ---
    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._unlink(node)                 # 移到最前面 = 剛用過
        self._push_front(node)
        return node.val

    def put(self, key, val):
        if key in self.map:
            node = self.map[key]
            node.val = val
            self._unlink(node)
            self._push_front(node)
            return
        if len(self.map) == self.cap:
            lru = self.tail.prev           # 最久沒用的在尾端
            self._unlink(lru)
            del self.map[lru.key]
        node = Node(key, val)
        self._push_front(node)
        self.map[key] = node


# Python 內建的 deque 與 OrderedDict 底層就是雙向串列
from collections import deque, OrderedDict
d = deque([1, 2, 3])
d.appendleft(0)      # O(1)
d.pop()              # O(1)`;

const cpp = `#include <list>
#include <unordered_map>

// std::list 就是雙向串列；配合 unordered_map 存 iterator 就能 O(1) 拆節點
class LRUCache {
    int cap;
    std::list<std::pair<int, int>> order;                    // front = 最近使用
    std::unordered_map<int, std::list<std::pair<int, int>>::iterator> map;

public:
    explicit LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        auto it = map.find(key);
        if (it == map.end()) return -1;
        order.splice(order.begin(), order, it->second);     // O(1) 移到最前面
        return it->second->second;
    }

    void put(int key, int val) {
        auto it = map.find(key);
        if (it != map.end()) {
            it->second->second = val;
            order.splice(order.begin(), order, it->second);
            return;
        }
        if ((int)order.size() == cap) {
            map.erase(order.back().first);                  // 踢掉最久沒用的
            order.pop_back();
        }
        order.push_front({key, val});
        map[key] = order.begin();
    }
};

// 手寫節點版的兩個核心動作
struct Node {
    int key, val;
    Node *prev = nullptr, *next = nullptr;
};

void unlink(Node* n) {              // O(1)：因為知道 prev
    n->prev->next = n->next;
    n->next->prev = n->prev;
}

void pushFront(Node* head, Node* n) {   // head 是哨兵
    n->next = head->next;
    n->prev = head;
    head->next->prev = n;
    head->next = n;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "LRU 快取：記憶體不夠時該丟誰",
              problem: "資料庫的頁面快取、CDN、瀏覽器快取，空間有限，滿了要踢掉「最久沒被用的」。每次讀取都要把該項標成「剛用過」，每次淘汰都要找出最久的，這兩件事都要 O(1)。",
              why: "把項目依使用時間串成雙向串列，最近用的在頭、最久的在尾。雜湊表直接找到節點，雙向指標讓「從中間拆下來、接到頭」只改四個指標。LeetCode 146 就是這題。",
            },
            {
              title: "瀏覽器的上一頁、下一頁",
              problem: "每個頁面要知道前一頁和後一頁。從中間某頁開新連結時，後面的歷史要整段丟掉。",
              why: "節點同時記 prev 和 next，往前往後都是 O(1)。文字編輯器的 undo/redo、音樂播放器的上一首下一首，都是同一個結構。",
            },
            {
              title: "deque 與 OrderedDict 的底層",
              problem: "Python 的 deque 為什麼兩端都能 O(1) 增刪？OrderedDict 為什麼能記住插入順序又能 O(1) 刪除任意 key？",
              why: "它們底層都是雙向串列。理解 prev/next 之後，這些「內建魔法」都變成看得懂的實作。",
            },
          ]}
          cue="LRU、最近使用、兩端都要操作、O(1) 刪除任意已知節點、上一個和下一個、undo/redo。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>雙向鏈結串列</strong>的每個節點多記一個 <Code>prev</Code>。這一個指標換來一個關鍵能力：<strong>拿著某個節點，就能 O(1) 把它從串列拆下來</strong>。單向串列做不到，因為不知道前一個是誰，得從 head 重新找，O(n)。
        </p>
        <p>
          代價是每次插入刪除要改<strong>四個指標</strong>而不是兩個，而且更容易接錯。標準做法是用<strong>兩個哨兵</strong>：<Code>head</Code> 和 <Code>tail</Code> 永遠存在、不放資料，真正的節點都在它們中間。這樣每個真實節點一定有 prev 也有 next，插入最前面、刪除最後一個都不用特判。
        </p>
        <p>
          雙向串列最經典的用法是<strong>和雜湊表組合成 LRU 快取</strong>：雜湊表負責「用 key 找到節點」O(1)，串列負責「維持使用順序」，兩個結構各補對方的短處。這個「雜湊表 + 串列」的組合也出現在 OrderedDict、LFU 快取、以及很多需要「快速找到 + 快速調整順序」的場景。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>建兩個哨兵：<Code>head.next = tail</Code>、<Code>tail.prev = head</Code>。真實節點永遠夾在中間。</>,
            <><strong>拆下</strong>節點 n（unlink）：<Code>n.prev.next = n.next</Code>、<Code>n.next.prev = n.prev</Code>。n 本身的指標留著沒關係，因為馬上會被重新接上或丟掉。</>,
            <><strong>接到最前面</strong>（push_front）：先設 n 的兩個指標（<Code>n.next = head.next</Code>、<Code>n.prev = head</Code>），再改鄰居的指標（<Code>head.next.prev = n</Code>、<Code>head.next = n</Code>）。先設自己、再改別人。</>,
            <>LRU 的 <Code>get</Code>：雜湊表找節點，unlink 再 push_front，回傳值。找不到回 −1。</>,
            <>LRU 的 <Code>put</Code>：已存在就更新值並移到最前面；不存在且已滿，先拆掉 <Code>tail.prev</Code>（最久沒用）並從雜湊表刪除，再建新節點接到最前面、寫進雜湊表。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>容量 3 的 LRU 快取。put 或 get 一個 key 會把它移到最前面；快取滿了再 put 新 key，尾端最久沒用的會被踢掉。右邊是雜湊表，每個 key 直接指到串列裡的節點。</p>
        <LRUCacheDemo />
      </Section>

      <Section id="code">
        <p>Python 版手寫節點與兩個哨兵，把 unlink 和 push_front 獨立出來後，get 和 put 都只是組合它們。C++ 版用 <Code>std::list</Code> 配 <Code>splice</Code>，一行完成 O(1) 移動。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 146", name: "LRU Cache", diff: "Medium" },
            { src: "LeetCode 641", name: "Design Circular Deque", diff: "Medium" },
            { src: "LeetCode 430", name: "Flatten a Multilevel Doubly Linked List", diff: "Medium" },
            { src: "LeetCode 1472", name: "Design Browser History", diff: "Medium" },
            { src: "LeetCode 460", name: "LFU Cache（雜湊表 + 多條雙向串列）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const doublyLesson: Lesson = { prereq: "Singly Linked List、Hash Table", Body };
