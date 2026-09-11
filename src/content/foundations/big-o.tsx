import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { GrowthDemo } from "@/components/lesson/demos/GrowthDemo";
import { GrowthChart } from "@/components/lesson/demos/GrowthChart";
import type { Lesson } from "@/lib/lessons";

const python = `# O(1)：不管 n 多大，做的事一樣多
def first(items):
    return items[0]

# O(n)：迴圈跑 n 次
def total(items):
    s = 0
    for x in items:
        s += x
    return s

# O(n²)：兩層迴圈各跑 n 次
def has_duplicate_slow(items):
    n = len(items)
    for i in range(n):
        for j in range(i + 1, n):
            if items[i] == items[j]:
                return True
    return False

# O(n)：用雜湊集合換掉內層迴圈，空間從 O(1) 變成 O(n)
def has_duplicate(items):
    seen = set()
    for x in items:
        if x in seen:
            return True
        seen.add(x)
    return False

# O(log n)：每一步把範圍砍半
def binary_search(sorted_items, target):
    lo, hi = 0, len(sorted_items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if sorted_items[mid] == target:
            return mid
        if sorted_items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`;

const cpp = `#include <vector>
#include <unordered_set>

// O(1)
int first(const std::vector<int>& v) { return v[0]; }

// O(n)
long long total(const std::vector<int>& v) {
    long long s = 0;
    for (int x : v) s += x;
    return s;
}

// O(n²)
bool hasDuplicateSlow(const std::vector<int>& v) {
    for (size_t i = 0; i < v.size(); i++)
        for (size_t j = i + 1; j < v.size(); j++)
            if (v[i] == v[j]) return true;
    return false;
}

// O(n) 時間、O(n) 空間
bool hasDuplicate(const std::vector<int>& v) {
    std::unordered_set<int> seen;
    for (int x : v) {
        if (seen.count(x)) return true;
        seen.insert(x);
    }
    return false;
}

// O(log n)
int binarySearch(const std::vector<int>& v, int target) {
    int lo = 0, hi = (int)v.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (v[mid] == target) return mid;
        if (v[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "測試機很快，上線就超時",
              problem: "本機測 100 筆資料 0.01 秒，上線後 100 萬筆資料卻跑不完。兩層迴圈的程式，資料多一萬倍，時間多一億倍。",
              why: "Big-O 描述「時間怎麼隨資料量成長」，讓你在寫程式時就預測這件事，而不是上線後才發現。",
            },
            {
              title: "面試官問「這樣的複雜度是多少」",
              problem: "幾乎每一題演算法面試都會追問時間與空間複雜度，並要求你改進。這是業界共同的語言。",
              why: "說 O(n²) 比說「大概要跑很久」精確得多，而且每個人聽到都知道是什麼意思。",
            },
            {
              title: "決定值不值得優化",
              problem: "同事說要把某個函式從 O(n) 改成 O(log n)，但那個函式的 n 永遠不超過 10。",
              why: "Big-O 是成長趨勢，不是絕對速度。知道它的意義，也就知道什麼時候不用管它。",
            },
          ]}
          cue="這段程式的複雜度、資料量變十倍會慢幾倍、能不能更快、n 是多少。"
        />
      </Section>

      <Section id="concept">
        <p>
          Big-O 回答一個問題：<strong>輸入大小 n 變大時，程式要做的事以多快的速度增加？</strong>它不是精確的秒數，而是成長的「形狀」。O(n) 表示成長是一條直線，O(n²) 是拋物線，O(log n) 幾乎是平的。
        </p>
        <GrowthChart />
        <p>
          因為只在意形狀，Big-O 有兩條簡化規則：<strong>丟掉常數</strong>（3n 和 n 都是 O(n)），<strong>只留最大的項</strong>（n² + n 是 O(n²)）。這兩條規則讓不同機器、不同語言寫出的同一個演算法，能用同一個記號比較。
        </p>
        <p>
          <strong>空間複雜度</strong>用同樣的方式描述額外用掉的記憶體。常見的取捨是用空間換時間：多開一個雜湊表，把 O(n²) 的比對變成 O(n)。
        </p>
        <p>
          常見的複雜度由快到慢：O(1) → O(log n) → O(n) → O(n log n) → O(n²) → O(2ⁿ) → O(n!)。前四個在百萬級資料都跑得動，後三個很快就不行了，下面的示範可以親手感受這件事。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>找出「n」是什麼：陣列長度、字串長度、節點數。有兩個輸入就用兩個變數，例如 O(m·n)。</>,
            <>看迴圈的<strong>層數與範圍</strong>：一層跑 n 次是 O(n)，兩層巢狀各跑 n 次是 O(n²)，每次把範圍砍半的迴圈是 O(log n)。</>,
            <>看<strong>呼叫的函式</strong>裡面做了什麼：迴圈裡呼叫一個 O(n) 的函式，整體就是 O(n²)。內建的 <Code>sort</Code> 是 O(n log n)，<Code>in</Code> 對 list 是 O(n)、對 set 是 O(1)。</>,
            <>把各段相加，然後<strong>丟掉常數與較小的項</strong>：2n² + 5n + 100 → O(n²)。</>,
            <>預設報<strong>最壞情況</strong>。若題目強調平均或攤銷，再另外說明。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>切換 n 的大小，比較七種複雜度的操作次數。右邊那欄假設每次操作 1 奈秒，換算成實際要等多久。</p>
        <GrowthDemo />
      </Section>

      <Section id="code">
        <p>同一個「有沒有重複元素」的問題，兩種寫法差一個 n。看程式時練習用上面的步驟數出每一段的複雜度。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <p>這幾題的重點不是解出來，而是先寫暴力解、算出複雜度，再想辦法降一階。</p>
        <Problems
          items={[
            { src: "LeetCode 217", name: "Contains Duplicate（O(n²) → O(n)）", diff: "Easy" },
            { src: "LeetCode 1", name: "Two Sum（O(n²) → O(n)）", diff: "Easy" },
            { src: "LeetCode 704", name: "Binary Search（O(n) → O(log n)）", diff: "Easy" },
            { src: "LeetCode 189", name: "Rotate Array（O(n) 時間、O(1) 空間）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const bigOLesson: Lesson = { prereq: "無，這是起點", Body };
