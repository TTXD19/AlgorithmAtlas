import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { CallStackDemo } from "@/components/lesson/demos/CallStackDemo";
import type { Lesson } from "@/lib/lessons";

const python = `def factorial(n):
    if n == 1:                      # base case：最小的問題，直接回答
        return 1
    return n * factorial(n - 1)     # recursive case：交給更小的自己


def total(items):
    # 串列總和：第一個元素 + 剩下的總和
    if not items:
        return 0
    return items[0] + total(items[1:])


def folder_size(folder):
    # 資料夾大小 = 所有檔案大小 + 所有子資料夾的大小
    size = sum(f.size for f in folder.files)
    for sub in folder.subfolders:
        size += folder_size(sub)    # 子資料夾的結構和自己一模一樣
    return size


def factorial_iter(n):
    # 同一件事的迭代版：沒有呼叫堆疊，空間 O(1)
    result = 1
    for k in range(2, n + 1):
        result *= k
    return result`;

const cpp = `#include <vector>

long long factorial(int n) {
    if (n == 1) return 1;               // base case
    return n * factorial(n - 1);        // recursive case
}

long long total(const std::vector<int>& items, size_t i = 0) {
    if (i == items.size()) return 0;    // 走到底
    return items[i] + total(items, i + 1);
}

struct Folder {
    std::vector<long long> fileSizes;
    std::vector<Folder> subfolders;
};

long long folderSize(const Folder& f) {
    long long size = 0;
    for (long long s : f.fileSizes) size += s;
    for (const Folder& sub : f.subfolders) size += folderSize(sub);
    return size;
}

long long factorialIter(int n) {
    long long r = 1;
    for (int k = 2; k <= n; k++) r *= k;
    return r;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "計算資料夾的大小",
              problem: "資料夾裡有檔案和子資料夾，子資料夾裡又有檔案和子資料夾，不知道有幾層深。",
              why: "遞迴只描述「一層」的規則：我的大小 = 我的檔案 + 每個子資料夾的大小。子資料夾怎麼算？用同一個函式。層數多深都不用管。",
            },
            {
              title: "渲染巢狀的 UI 元件",
              problem: "留言底下有回覆，回覆底下還有回覆；選單裡有子選單。React 元件要畫出這種結構。",
              why: "元件在自己裡面再渲染自己，就是遞迴。任何「結構裡包含同樣的結構」的資料，遞迴都是最自然的寫法。",
            },
            {
              title: "之後要學的一半東西都建立在它上面",
              problem: "樹的走訪、DFS、合併排序、快速排序、回溯、動態規劃，全部都是遞迴的變形。",
              why: "先把「相信更小的自己會回傳正確答案」這個思考方式練熟，後面那些演算法就只是換一個問題來拆。",
            },
          ]}
          cue="結構裡包含同樣的結構、不知道有幾層、把問題縮小一點會變成同樣的問題、樹狀資料。"
        />
      </Section>

      <Section id="concept">
        <p>
          遞迴是<strong>函式呼叫自己</strong>，但真正的重點是思考方式：把一個大小為 n 的問題，用一個「大小更小的同樣問題」的答案來組合。你只需要負責兩件事：<strong>最小的問題怎麼直接回答</strong>（base case），以及<strong>大問題怎麼從小問題的答案拼出來</strong>（recursive case）。
        </p>
        <p>
          程式執行時，每一次呼叫都會在<strong>呼叫堆疊（call stack）</strong>上放一層紀錄，記住這一層的參數和「算完要回到哪裡」。深入到 base case 後，這些紀錄再一層一層彈出、把答案往上傳。所以遞迴的空間複雜度至少是 O(深度)，遞迴太深會 stack overflow。
        </p>
        <p>
          新手最常卡在「想追蹤每一層在做什麼」。不要追。<strong>相信遞迴呼叫會回傳正確的答案</strong>，只檢查自己這一層有沒有正確使用它，這叫遞迴信仰（recursive leap of faith），也是數學歸納法的程式版。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>定義函式的<strong>意義</strong>：<Code>factorial(n)</Code> 回傳 n 的階乘。意義要說得清楚，後面才能「相信」它。</>,
            <>寫 <strong>base case</strong>：最小、可以直接回答的情況。<Code>n == 1</Code> 回傳 1。沒有 base case 就會無限遞迴。</>,
            <>寫 <strong>recursive case</strong>：假設 <Code>factorial(n - 1)</Code> 已經是對的，那 <Code>factorial(n)</Code> 就是 <Code>n * factorial(n - 1)</Code>。</>,
            <>確認每次遞迴呼叫都<strong>朝 base case 前進</strong>（n 變小、串列變短、樹往下走），否則不會停。</>,
            <>估算<strong>深度</strong>：階乘深度是 n，二分的深度是 log n。深度太大時改用迭代或明確的堆疊。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>逐步執行 factorial(4)。左邊是目前執行到哪一行，右邊是呼叫堆疊：先一層層推入、到 base case 後再一層層回傳。</p>
        <CallStackDemo />
      </Section>

      <Section id="code">
        <p>三個例子分別對應「數字縮小」、「串列縮短」、「樹往下走」三種遞迴形狀，最後附上迭代版做對照。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 344", name: "Reverse String（用遞迴做）", diff: "Easy" },
            { src: "LeetCode 509", name: "Fibonacci Number", diff: "Easy" },
            { src: "LeetCode 206", name: "Reverse Linked List（遞迴版）", diff: "Easy" },
            { src: "LeetCode 70", name: "Climbing Stairs（先寫遞迴，體會為什麼慢）", diff: "Easy" },
            { src: "LeetCode 779", name: "K-th Symbol in Grammar", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const recursionLesson: Lesson = { prereq: "Big-O Notation", Body };
