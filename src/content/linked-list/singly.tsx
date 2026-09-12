import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { SinglyListDemo } from "@/components/lesson/demos/SinglyListDemo";
import type { Lesson } from "@/lib/lessons";

const python = `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next          # 指向下一個節點，最後一個是 None


class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def push_front(self, val):            # O(1)
        self.head = Node(val, self.head)  # 新節點的 next 指向舊 head
        self.size += 1

    def push_back(self, val):             # O(n)：沒有 tail 指標就得走到底
        node = Node(val)
        if self.head is None:
            self.head = node
        else:
            cur = self.head
            while cur.next:
                cur = cur.next
            cur.next = node
        self.size += 1

    def get(self, index):                 # O(n)：只能一個一個走
        cur = self.head
        for _ in range(index):
            cur = cur.next
        return cur.val

    def insert_after(self, node, val):    # O(1)：已經拿到節點的話
        node.next = Node(val, node.next)
        self.size += 1

    def remove_after(self, node):         # O(1)：跳過下一個節點
        if node.next:
            node.next = node.next.next
            self.size -= 1

    def find(self, val):                  # O(n)
        cur = self.head
        while cur and cur.val != val:
            cur = cur.next
        return cur


# 哨兵（dummy）節點：讓「刪除 head」不用特判
def remove_all(head, val):
    dummy = Node(0, head)
    cur = dummy
    while cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next      # 跳過
        else:
            cur = cur.next
    return dummy.next`;

const cpp = `struct Node {
    int val;
    Node* next;
    Node(int v, Node* n = nullptr) : val(v), next(n) {}
};

class LinkedList {
    Node* head = nullptr;
    int size = 0;
public:
    void pushFront(int val) {                 // O(1)
        head = new Node(val, head);
        size++;
    }

    void pushBack(int val) {                  // O(n)
        Node* node = new Node(val);
        if (!head) { head = node; }
        else {
            Node* cur = head;
            while (cur->next) cur = cur->next;
            cur->next = node;
        }
        size++;
    }

    int get(int index) const {                // O(n)
        Node* cur = head;
        for (int i = 0; i < index; i++) cur = cur->next;
        return cur->val;
    }

    void insertAfter(Node* node, int val) {   // O(1)
        node->next = new Node(val, node->next);
        size++;
    }

    void removeAfter(Node* node) {            // O(1)
        if (!node->next) return;
        Node* gone = node->next;
        node->next = gone->next;
        delete gone;                          // C++ 要自己釋放
        size--;
    }

    Node* find(int val) const {               // O(n)
        Node* cur = head;
        while (cur && cur->val != val) cur = cur->next;
        return cur;
    }
};

// 哨兵節點：刪除所有等於 val 的節點，head 被刪也不用特判
Node* removeAll(Node* head, int val) {
    Node dummy(0, head);
    Node* cur = &dummy;
    while (cur->next) {
        if (cur->next->val == val) {
            Node* gone = cur->next;
            cur->next = gone->next;
            delete gone;
        } else {
            cur = cur->next;
        }
    }
    return dummy.next;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "作業系統怎麼管理「等著跑的程序」",
              problem: "程序隨時會建立、結束、被暫停。要在任何位置 O(1) 插入或移除，而且沒有人知道最多會有幾個。",
              why: "串列的節點散落在記憶體各處，靠指標串起來。插入刪除只改兩個指標，不用搬其他元素，也不用預留連續空間。Linux 核心到處都是串列。",
            },
            {
              title: "雜湊表裡碰撞的那條鏈",
              problem: "上一章的雜湊表用「鏈結法」處理碰撞：同一個桶裡的 key 串在一起。那條鏈就是單向串列。",
              why: "鏈通常很短、只在尾端加、只會整條掃過，串列剛好夠用又不浪費空間。學會它，就看懂了雜湊表的實作。",
            },
            {
              title: "指標操作的基本功",
              problem: "樹、圖、LRU 快取、跳躍串列，全部是「節點 + 指標」的結構。接錯一個指標，整條就斷了或繞成環。",
              why: "單向串列是最簡單的指標結構。在這裡練熟「先接新的、再拆舊的」、哨兵節點、邊界情況，之後所有指標題都是同一套動作。",
            },
          ]}
          cue="不知道總共幾個、頻繁在中間插入刪除、node.next、head、指標接來接去、面試裡的 ListNode。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>單向鏈結串列</strong>由節點組成，每個節點只記兩件事：自己的值，和<strong>下一個節點在哪</strong>（next）。最後一個節點的 next 是 None。整條串列只靠一個 <Code>head</Code> 指標抓住開頭，其他節點都要從 head 沿著 next 走過去。
        </p>
        <p>
          它和陣列是一組對照。陣列靠連續記憶體算位址，所以隨機存取 O(1)、中間插入 O(n)。串列放棄連續，所以<strong>已知位置的插入刪除 O(1)</strong>（只改指標），但<strong>存取第 i 個要走 i 步</strong>，O(n)。查找一個值兩者都是 O(n)。一句話：陣列擅長「讀」，串列擅長「在已知位置改結構」。
        </p>
        <p>
          實務上單向串列本身不常直接用，因為每個節點多一個指標、又對快取不友善。它真正的價值是<strong>指標操作的訓練</strong>與作為更複雜結構的零件。兩個習慣要養成：<strong>哨兵節點</strong>（dummy head）讓「刪 head」「插在最前面」不用特判；改指標時<strong>先接新的再拆舊的</strong>，才不會弄丟後半段。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <><strong>插入</strong>在節點 p 之後：新節點的 next 先指向 <Code>p.next</Code>，再把 <Code>p.next</Code> 改指向新節點。順序反了會弄丟 p 後面整段。</>,
            <><strong>刪除</strong>節點 p 之後的那個：<Code>p.next = p.next.next</Code>。被跳過的節點沒人指向它，就等於消失了（C++ 要手動 delete）。</>,
            <>任何要碰 head 的操作，先建一個 <strong>dummy</strong> 節點指向 head，操作完回傳 <Code>dummy.next</Code>。這樣「刪除 head」和「刪除中間」是同一段程式。</>,
            <><strong>走訪</strong>用 <Code>while cur:</Code>，需要「前一個節點」時多留一個 <Code>prev</Code>。要停在最後一個節點用 <Code>while cur.next:</Code>。</>,
            <>寫完先用三種輸入檢查：空串列、只有一個節點、目標在最後一個。指標題的 bug 幾乎都在邊界。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>比較每個操作走過幾個節點。開頭插入不用走，尾端插入和讀取第 4 個都得從 head 一路走；刪除只改一個指標，後面的節點完全不動。</p>
        <SinglyListDemo />
      </Section>

      <Section id="code">
        <p>手寫一個最小的串列類別，每個方法標上複雜度；最後用哨兵節點示範「刪除所有等於 val 的節點」怎麼把 head 的特判消掉。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 707", name: "Design Linked List", diff: "Medium" },
            { src: "LeetCode 203", name: "Remove Linked List Elements（哨兵節點）", diff: "Easy" },
            { src: "LeetCode 83", name: "Remove Duplicates from Sorted List", diff: "Easy" },
            { src: "LeetCode 237", name: "Delete Node in a Linked List（沒有前一個節點怎麼刪）", diff: "Medium" },
            { src: "LeetCode 19", name: "Remove Nth Node From End of List", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const singlyLesson: Lesson = { prereq: "Array & Dynamic Array", Body };
