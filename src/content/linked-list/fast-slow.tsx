import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { FastSlowDemo } from "@/components/lesson/demos/FastSlowDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 找中點：fast 走兩步、slow 走一步，fast 到底時 slow 在中間
def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow            # 偶數長度時回傳第二個中點


# 偵測環（Floyd）：有環的話 fast 一定會追上 slow
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False


# 找環的起點：相遇後把一個指標放回 head，兩個都走一步，再相遇處就是起點
def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            slow = head
            while slow is not fast:
                slow = slow.next
                fast = fast.next
            return slow
    return None


# 倒數第 k 個：fast 先走 k 步，再一起走，fast 到底時 slow 在倒數第 k 個
def kth_from_end(head, k):
    slow = fast = head
    for _ in range(k):
        fast = fast.next
    while fast:
        slow = slow.next
        fast = fast.next
    return slow`;

const cpp = `struct ListNode {
    int val;
    ListNode* next;
};

ListNode* middle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}

bool hasCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}

ListNode* cycleStart(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            slow = head;
            while (slow != fast) {
                slow = slow->next;
                fast = fast->next;
            }
            return slow;
        }
    }
    return nullptr;
}

ListNode* kthFromEnd(ListNode* head, int k) {
    ListNode *slow = head, *fast = head;
    for (int i = 0; i < k; i++) fast = fast->next;
    while (fast) {
        slow = slow->next;
        fast = fast->next;
    }
    return slow;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "垃圾回收與資料結構裡的循環參照",
              problem: "物件 A 指向 B、B 指向 C、C 又指回 A。要偵測這種環，最直覺的方法是把走過的節點記在 set 裡，但那要 O(n) 的額外記憶體。",
              why: "一快一慢兩個指標在同一條路上跑：沒有環，快的先到終點；有環，快的在環裡繞，遲早從後面追上慢的。O(1) 空間。這是 Floyd 判圈演算法。",
            },
            {
              title: "只掃一遍就找到中點",
              problem: "要把串列切成兩半（合併排序、判斷回文），得知道中點在哪。但串列沒有長度欄位，數一次長度再走一半要掃兩遍。",
              why: "fast 每次走兩步、slow 走一步，fast 到底的時候 slow 剛好走了一半。一遍搞定，而且程式碼只有四行。",
            },
            {
              title: "偽隨機數產生器的週期",
              problem: "函數 f 反覆套用 x → f(x) → f(f(x))，狀態有限所以終究會進入循環。要找出循環從哪開始、長度多少，不能把所有狀態存下來。",
              why: "把「x 的下一個是 f(x)」看成串列，這就是找環起點。Pollard 的 rho 因數分解也用同一個技巧。",
            },
          ]}
          cue="有沒有環、環的起點、中點、倒數第 k 個、只能走一遍、不能用額外空間、兩個指標速度不同。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>快慢指標</strong>是讓兩個指標以不同速度或不同起點在同一條串列上前進，利用它們之間的<strong>距離關係</strong>回答問題。慢指標一次一步，快指標一次兩步：fast 走的距離永遠是 slow 的兩倍，所以 fast 到終點時 slow 在<strong>中點</strong>。
        </p>
        <p>
          <strong>偵測環</strong>用的是追逐的直覺。若有環，fast 進環後會一直繞；slow 進環後，fast 每一輪追近 1 步，最多繞一圈就追上。若沒有環，fast 會先碰到 None。整個過程只用兩個指標，O(n) 時間、O(1) 空間。
        </p>
        <p>
          <strong>找環的起點</strong>多一個階段。設 head 到環起點距離 a、環長 c。相遇時 slow 走了 a + b，fast 走了 2(a + b)，兩者差是環長的整數倍，推得 a ≡ −b (mod c)。意思是：從相遇點再走 a 步，剛好回到環起點。所以把一個指標放回 head、另一個留在相遇點，兩個都一次一步，再相遇的地方就是起點。
        </p>
        <p>
          同一家族還有<strong>固定間距</strong>的用法：fast 先走 k 步，再和 slow 同速前進，fast 到底時 slow 在倒數第 k 個。關鍵都是「兩個指標之間維持一個已知的關係」。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <><Code>slow = fast = head</Code>。迴圈條件永遠是 <Code>while fast and fast.next</Code>，這樣 <Code>fast.next.next</Code> 才不會炸。</>,
            <>每一輪 <Code>slow = slow.next</Code>、<Code>fast = fast.next.next</Code>。</>,
            <><strong>找中點</strong>：迴圈結束回傳 slow。偶數長度會停在第二個中點；要第一個就把 fast 從 <Code>head.next</Code> 出發。</>,
            <><strong>偵測環</strong>：每一輪移動後檢查 <Code>slow is fast</Code>。注意是移動後才比，一開始兩者本來就相同。</>,
            <><strong>環的起點</strong>：相遇後 <Code>slow = head</Code>，兩個指標都一次一步直到再相遇。<strong>倒數第 k 個</strong>：fast 先走 k 步再同速前進。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>「找中點」看 fast 到底時 slow 停在哪；「偵測環」看兩個指標怎麼在環裡相遇，以及第二階段怎麼找出環的起點。</p>
        <FastSlowDemo />
      </Section>

      <Section id="code">
        <p>四個函式共用同一個骨架：中點、判圈、環起點、倒數第 k 個。注意迴圈條件都一樣，差別只在什麼時候停、停下來後做什麼。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 876", name: "Middle of the Linked List", diff: "Easy" },
            { src: "LeetCode 141", name: "Linked List Cycle", diff: "Easy" },
            { src: "LeetCode 142", name: "Linked List Cycle II（環的起點）", diff: "Medium" },
            { src: "LeetCode 19", name: "Remove Nth Node From End of List（固定間距）", diff: "Medium" },
            { src: "LeetCode 287", name: "Find the Duplicate Number（把陣列當串列找環）", diff: "Medium" },
            { src: "LeetCode 143", name: "Reorder List（中點 + 反轉 + 交錯合併）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const fastSlowLesson: Lesson = { prereq: "Singly Linked List", Body };
