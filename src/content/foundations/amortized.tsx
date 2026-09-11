import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { DynamicArrayDemo } from "@/components/lesson/demos/DynamicArrayDemo";
import type { Lesson } from "@/lib/lessons";

const python = `class DynamicArray:
    """手寫一個 list，觀察擴容什麼時候發生。"""

    def __init__(self):
        self.capacity = 1
        self.size = 0
        self.data = [None] * self.capacity
        self.copies = 0            # 統計總共搬移了幾個元素

    def push(self, x):
        if self.size == self.capacity:
            self._grow()           # 偶爾很貴：O(n)
        self.data[self.size] = x   # 通常很便宜：O(1)
        self.size += 1

    def _grow(self):
        new_capacity = self.capacity * 2      # 關鍵：加倍，不是加固定量
        new_data = [None] * new_capacity
        for i in range(self.size):
            new_data[i] = self.data[i]
            self.copies += 1
        self.data = new_data
        self.capacity = new_capacity


arr = DynamicArray()
for i in range(1_000_000):
    arr.push(i)
print(arr.copies)      # 約 1,000,000，不是 n² 等級
# 總成本 ≈ n 次放入 + 不到 n 次搬移 < 3n，平均每次 push < 3 → O(1) 攤銷`;

const cpp = `#include <vector>
#include <cstdio>

// std::vector 就是動態陣列。觀察 capacity 什麼時候變。
int main() {
    std::vector<int> v;
    size_t lastCap = 0;
    long long copies = 0;
    for (int i = 0; i < 1000; i++) {
        if (v.size() == v.capacity()) copies += v.size();  // 這次 push 會搬移現有元素
        v.push_back(i);
        if (v.capacity() != lastCap) {
            std::printf("size=%zu capacity=%zu\\n", v.size(), v.capacity());
            lastCap = v.capacity();
        }
    }
    std::printf("total copies = %lld (< 2n)\\n", copies);
    // 若事先知道大小，reserve 可以完全避免搬移
    std::vector<int> w;
    w.reserve(1000);
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "list.append 明明偶爾要搬家，為什麼說它是 O(1)",
              problem: "Python 的 list、JavaScript 的 array、C++ 的 vector 底層都是固定大小的陣列。滿了就要配一塊更大的、把舊資料全部搬過去，那一次是 O(n)。",
              why: "攤銷分析看的是一連串操作的總成本除以次數。搬家很少發生，而且每次搬完會換來很多次便宜的 push，平均下來每次 push 仍是常數。",
            },
            {
              title: "雜湊表為什麼要 rehash",
              problem: "HashMap 元素太多時碰撞變多，得開一個兩倍大的表、把所有元素重新放一次。那一瞬間很慢。",
              why: "同樣的道理：rehash 是 O(n)，但發生頻率隨 n 加倍而減半，攤銷後插入仍是 O(1)。理解這點，就知道為什麼「加倍」是關鍵而「加 100」不行。",
            },
            {
              title: "用兩個堆疊做出佇列",
              problem: "只有堆疊可用時要實作佇列。出隊時若輸出堆疊是空的，要把輸入堆疊整個倒過去，那次是 O(n)。",
              why: "每個元素一生最多被搬一次，所以 n 次操作總共 O(n)，攤銷每次 O(1)。這是面試裡最常被問到的攤銷例子。",
            },
          ]}
          cue="偶爾很慢但通常很快、擴容、rehash、每個元素最多被處理一次、總成本除以操作次數。"
        />
      </Section>

      <Section id="concept">
        <p>
          最壞情況分析看<strong>單次</strong>操作最慢多慢；攤銷分析看<strong>一連串</strong>操作的總成本，再平均到每一次。兩者都是精確的保證，不是機率上的平均：攤銷 O(1) 的意思是「任意 n 次操作的總成本一定 ≤ c·n」。
        </p>
        <p>
          動態陣列是標準例子。容量加倍的策略下，第 1、2、4、8、…、2ᵏ 次 push 會觸發搬移，搬移量分別是 1、2、4、…、2ᵏ⁻¹，總和小於 n。加上 n 次本身的放入，總成本小於 3n，所以<strong>平均每次 push 小於 3 次操作</strong>。如果改成每次加固定容量 100，搬移總量會是 n²/200 等級，攤銷就變成 O(n)。
        </p>
        <p>
          常用的論證方式有兩種。<strong>聚合法</strong>：直接算 n 次操作的總和再除以 n。<strong>記帳法</strong>：每次便宜的操作多付一點「存款」，貴的操作用存款支付。動態陣列每次 push 付 3 元：1 元放自己、1 元存給自己將來搬家、1 元幫上一半的舊元素搬家，帳永遠不會透支。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>找出<strong>貴的操作</strong>是哪一個、什麼條件下觸發（容量滿、輸出堆疊空、負載因子超過門檻）。</>,
            <>算它<strong>多久發生一次</strong>，以及每次發生的成本與 n 的關係。加倍策略下發生 log n 次，第 k 次成本 2ᵏ。</>,
            <>用<strong>聚合法</strong>把 n 次操作的成本全部加起來：便宜的 n 次 + 貴的幾次，得到總和。</>,
            <>總和除以 n，就是<strong>攤銷成本</strong>。若想要更直覺的說法，改用記帳法：每次便宜操作預付多少，才夠支付之後的貴操作。</>,
            <>檢查<strong>不會退款</strong>：攤銷分析要求操作序列從空結構開始，若有 pop 後又 push 的交替，要確認縮容策略不會讓成本反覆爆掉（所以縮容通常在 1/4 滿時才做）。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>按 push 觀察：大部分時候成本是 1，容量滿時會出現一根黃色的高柱，但「平均每次 push」始終停在 3 以下。</p>
        <DynamicArrayDemo />
      </Section>

      <Section id="code">
        <p>Python 版手寫一個動態陣列並統計搬移次數；C++ 版直接觀察 <Code>std::vector</Code> 的 capacity 變化。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 232", name: "Implement Queue using Stacks（攤銷 O(1)）", diff: "Easy" },
            { src: "LeetCode 155", name: "Min Stack", diff: "Medium" },
            { src: "LeetCode 705", name: "Design HashSet（想想何時該擴容）", diff: "Easy" },
            { src: "LeetCode 146", name: "LRU Cache", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const amortizedLesson: Lesson = { prereq: "Big-O Notation、Array & Dynamic Array", Body };
