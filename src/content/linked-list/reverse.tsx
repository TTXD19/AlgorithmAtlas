import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { ReverseListDemo } from "@/components/lesson/demos/ReverseListDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 迭代：三個指標，每個節點把箭頭轉向。O(n) 時間、O(1) 空間
def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next          # 1. 先記住後面的路
        cur.next = prev         # 2. 箭頭轉向
        prev = cur              # 3. 兩個指標往前推
        cur = nxt
    return prev                 # prev 停在原本的最後一個節點


# 遞迴：相信 reverse(head.next) 會把後面反轉好並回傳新 head，
# 自己只要把「原本的下一個」的 next 指回自己。O(n) 空間（呼叫堆疊）
def reverse_rec(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_rec(head.next)
    head.next.next = head       # 後面那個節點現在是尾巴，把它接回我
    head.next = None            # 我變成新的尾巴
    return new_head


# 反轉區間 [left, right]（LeetCode 92）：頭插法
def reverse_between(head, left, right):
    dummy = ListNode(0, head)
    before = dummy
    for _ in range(left - 1):
        before = before.next    # before 停在區間前一個
    cur = before.next           # cur 固定不動，每次把它後面那個搬到區間最前面
    for _ in range(right - left):
        moved = cur.next
        cur.next = moved.next
        moved.next = before.next
        before.next = moved
    return dummy.next`;

const cpp = `struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v, ListNode* n = nullptr) : val(v), next(n) {}
};

// 迭代
ListNode* reverse(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* cur = head;
    while (cur) {
        ListNode* nxt = cur->next;
        cur->next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}

// 遞迴
ListNode* reverseRec(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode* newHead = reverseRec(head->next);
    head->next->next = head;
    head->next = nullptr;
    return newHead;
}

// 反轉區間 [left, right]：頭插法
ListNode* reverseBetween(ListNode* head, int left, int right) {
    ListNode dummy(0, head);
    ListNode* before = &dummy;
    for (int i = 0; i < left - 1; i++) before = before->next;
    ListNode* cur = before->next;
    for (int i = 0; i < right - left; i++) {
        ListNode* moved = cur->next;
        cur->next = moved->next;
        moved->next = before->next;
        before->next = moved;
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
              title: "面試最常出現的串列題",
              problem: "Reverse Linked List 幾乎是每家公司的暖身題，再往上是反轉區間、每 k 個一組反轉、判斷回文串列。它們全部建立在同一個三指標動作上。",
              why: "反轉串列是「指標操作」最純粹的練習：每個節點只做一件事（把箭頭轉向），但順序錯了整條就斷。練到不用想就寫對，之後的串列題都是這個動作的變形。",
            },
            {
              title: "把數字串列相加、判斷回文",
              problem: "兩個用串列表示的大數要相加（個位數在最後），或判斷一個串列讀正讀反都一樣。串列只能往前走，沒辦法從尾巴倒著看。",
              why: "把後半段反轉，就能從兩端同時往中間走。這是「用 O(1) 空間處理需要倒著看的問題」的標準手法，比複製成陣列省記憶體。",
            },
            {
              title: "理解遞迴版與迭代版的取捨",
              problem: "同一件事，迭代版三個指標搞定，遞迴版四行但要 O(n) 的呼叫堆疊。串列一長遞迴就爆。",
              why: "這是最適合對照兩種寫法的題目。迭代版是實務上該用的，遞迴版是「相信更小的自己」那個思考方式的最佳範例。",
            },
          ]}
          cue="反轉、倒著看、從尾巴開始、回文串列、k 個一組、區間反轉、prev / cur / next 三指標。"
        />
      </Section>

      <Section id="concept">
        <p>
          反轉一條串列，就是<strong>把每個節點的 next 箭頭轉向</strong>：原本指向後面，改成指向前面。難的地方只有一個：一旦把 <Code>cur.next</Code> 改掉，就找不到後面的路了。所以每一步都要<strong>先把下一個存起來</strong>，再改指標。
        </p>
        <p>
          迭代版用三個指標。<Code>prev</Code> 是「已經反轉好的那段」的頭，一開始是 None；<Code>cur</Code> 是正在處理的節點；<Code>nxt</Code> 暫存後面的路。每一輪四個動作：存 nxt、轉箭頭、prev 前進、cur 前進。迴圈結束時 cur 是 None，prev 停在原本的最後一個節點，它就是新 head。O(n) 時間，O(1) 額外空間。
        </p>
        <p>
          遞迴版換一種思考：<strong>相信</strong> <Code>reverse(head.next)</Code> 會把後面那段反轉好、回傳新 head。那自己只要做一件事：原本的下一個節點現在是那段的尾巴，把它的 next 指回自己，再把自己的 next 設成 None。程式碼更短，但呼叫堆疊 O(n)，串列很長時會 stack overflow。
        </p>
        <p>
          <strong>反轉區間</strong>是常見的變形。用<strong>頭插法</strong>：固定區間第一個節點 cur 不動，反覆把 cur 後面那個節點「拔出來、插到區間最前面」，做 right − left 次。搭配 dummy 節點，left = 1 也不用特判。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <><Code>prev = None</Code>、<Code>cur = head</Code>。</>,
            <>迴圈條件 <Code>while cur</Code>。進入後<strong>先</strong> <Code>nxt = cur.next</Code>，保住後面的路。</>,
            <><Code>cur.next = prev</Code>，箭頭轉向。這是唯一真正改變結構的一行。</>,
            <><Code>prev = cur</Code>、<Code>cur = nxt</Code>，兩個指標一起往前一格。順序不能反，否則 cur 會追不到原本的下一個。</>,
            <>迴圈結束回傳 <Code>prev</Code>。用空串列、單節點、兩節點各跑一次確認邊界。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>逐步執行迭代版。看每一輪四個動作怎麼把一個節點的箭頭轉向：綠色是已經反轉好的部分，prev 永遠停在它的頭。</p>
        <ReverseListDemo />
      </Section>

      <Section id="code">
        <p>迭代版、遞迴版、以及用頭插法反轉區間。三個都建議手寫一次，遞迴版特別注意 <Code>head.next.next = head</Code> 那一行在做什麼。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 206", name: "Reverse Linked List", diff: "Easy" },
            { src: "LeetCode 234", name: "Palindrome Linked List（找中點 + 反轉後半）", diff: "Easy" },
            { src: "LeetCode 92", name: "Reverse Linked List II（區間反轉）", diff: "Medium" },
            { src: "LeetCode 24", name: "Swap Nodes in Pairs", diff: "Medium" },
            { src: "LeetCode 25", name: "Reverse Nodes in k-Group", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const reverseLesson: Lesson = { prereq: "Singly Linked List、Recursion", Body };
