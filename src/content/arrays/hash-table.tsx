import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { HashTableDemo } from "@/components/lesson/demos/HashTableDemo";
import type { Lesson } from "@/lib/lessons";

const python = `class HashMap:
    """鏈結法（separate chaining）：每個桶是一個 list，存 (key, value)。"""

    MAX_LOAD = 0.75

    def __init__(self, capacity=4):
        self.capacity = capacity
        self.size = 0
        self.buckets = [[] for _ in range(capacity)]

    def _index(self, key):
        return hash(key) % self.capacity        # 雜湊函數 → 桶編號

    def get(self, key, default=None):
        for k, v in self.buckets[self._index(key)]:   # 只看這一桶
            if k == key:
                return v
        return default

    def put(self, key, value):
        bucket = self.buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:                            # 已存在：覆蓋
                bucket[i] = (key, value)
                return
        bucket.append((key, value))                 # 不存在：串到鏈尾
        self.size += 1
        if self.size / self.capacity > self.MAX_LOAD:
            self._rehash()

    def remove(self, key):
        bucket = self.buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self.size -= 1
                return True
        return False

    def _rehash(self):
        # 容量加倍，每個 key 重新算桶。O(n)，但攤銷後每次 put 仍是 O(1)
        old = self.buckets
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        for bucket in old:
            for k, v in bucket:
                self.buckets[self._index(k)].append((k, v))


# 實際使用時直接用內建的 dict / set，它們就是雜湊表
m = {}
m["alice"] = 30          # 平均 O(1)
m.get("bob", 0)          # 平均 O(1)
"alice" in m             # 平均 O(1)
del m["alice"]           # 平均 O(1)`;

const cpp = `#include <vector>
#include <list>
#include <string>
#include <functional>
#include <unordered_map>

// 鏈結法雜湊表：每個桶是一個 list<pair<K,V>>
template <typename K, typename V>
class HashMap {
    std::vector<std::list<std::pair<K, V>>> buckets;
    size_t count = 0;
    static constexpr double MAX_LOAD = 0.75;

    size_t index(const K& key) const { return std::hash<K>{}(key) % buckets.size(); }

    void rehash() {
        std::vector<std::list<std::pair<K, V>>> old = std::move(buckets);
        buckets.assign(old.size() * 2, {});
        for (auto& chain : old)
            for (auto& kv : chain) buckets[index(kv.first)].push_back(std::move(kv));
    }

public:
    HashMap() : buckets(4) {}

    V* get(const K& key) {
        for (auto& kv : buckets[index(key)])
            if (kv.first == key) return &kv.second;
        return nullptr;
    }

    void put(const K& key, const V& value) {
        auto& chain = buckets[index(key)];
        for (auto& kv : chain)
            if (kv.first == key) { kv.second = value; return; }
        chain.push_back({key, value});
        if (++count > buckets.size() * MAX_LOAD) rehash();
    }

    bool remove(const K& key) {
        auto& chain = buckets[index(key)];
        for (auto it = chain.begin(); it != chain.end(); ++it)
            if (it->first == key) { chain.erase(it); --count; return true; }
        return false;
    }
};

// 實務上用 std::unordered_map / unordered_set
int main() {
    std::unordered_map<std::string, int> m;
    m["alice"] = 30;                 // 平均 O(1)
    m.count("alice");                // 平均 O(1)
    auto it = m.find("bob");         // 找不到回傳 m.end()
    m.erase("alice");
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "使用者一登入，伺服器怎麼在一百萬個 session 裡找到他",
              problem: "每個請求都帶一個 session ID，伺服器要立刻知道這是誰。用陣列一個一個比對，一百萬筆要比一百萬次，每個請求都這樣做，服務就掛了。",
              why: "雜湊表把 ID 經過雜湊函數直接算出「該放在哪一格」，查詢不用比對其他任何人。Redis、Memcached 的核心就是一個大雜湊表。",
            },
            {
              title: "資料庫的雜湊索引與 JOIN",
              problem: "兩張表要用 user_id 對起來。沒有索引的話，每一筆都要掃另一張表，O(n·m)。",
              why: "先把一張表建成雜湊表（hash join），另一張表每筆只要一次查詢。O(n + m)。",
            },
            {
              title: "編譯器與直譯器的變數查找",
              problem: "程式碼裡出現一個變數名，直譯器要找到它的值。程式裡可能有幾千個名字，每一行都要查。",
              why: "符號表就是雜湊表：字串經雜湊變成數字索引。Python 的每個物件屬性、每個模組命名空間，底層都是 dict。",
            },
          ]}
          cue="用鍵找值、去重、判斷看過沒有、快取、O(1) 查詢、鍵不是連續整數。"
        />
      </Section>

      <Section id="concept">
        <p>
          陣列靠<strong>位置</strong>存取，但真實世界的鍵是字串、ID、座標，不是 0 到 n−1 的整數。<strong>雜湊表</strong>用一個<strong>雜湊函數</strong>把任意鍵變成一個整數，再對容量取餘數，得到它該放的<strong>桶</strong>（bucket）編號。這樣查詢就變成：算一次雜湊、直接跳到那個桶。平均 O(1)。
        </p>
        <p>
          兩個不同的鍵可能算出同一個桶，這叫<strong>碰撞</strong>。最常見的處理是<strong>鏈結法</strong>：每個桶掛一條小串列，碰撞的鍵串在一起，查的時候沿著鏈比對。另一種是<strong>開放定址</strong>：碰撞就往後找下一個空格（Python 的 dict 用這種）。兩者都要求鏈或探測長度保持很短。
        </p>
        <p>
          控制長度的關鍵是<strong>負載因子</strong> = 元素數 ÷ 桶數。超過門檻（通常 0.75）就把桶數<strong>加倍</strong>、所有元素重新放一次，這叫 <strong>rehash</strong>。它是 O(n)，但發生頻率隨 n 加倍而減半，攤銷後每次插入仍是 O(1)。這和動態陣列擴容是同一個道理。
          最壞情況（所有鍵都撞在同一桶）是 O(n)，所以說「平均 O(1)」而非「一定 O(1)」；好的雜湊函數讓最壞情況幾乎不會發生。
        </p>
        <p>
          代價是雜湊表<strong>沒有順序</strong>：不能問「比 k 大的最小鍵」或「依序走訪」。需要順序時用平衡樹（C++ 的 <Code>map</Code>），那是樹那一章的事。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>算 <Code>h = hash(key)</Code>，桶編號 <Code>b = h % capacity</Code>。</>,
            <><strong>查詢</strong>：沿著桶 b 的鏈逐一比對 key，找到就回傳值，走到底就是不存在。鏈平均長度 = 負載因子，所以是 O(1)。</>,
            <><strong>插入</strong>：先照步驟 2 找，存在就覆蓋；不存在就串到鏈尾，元素數加一。</>,
            <>插入後檢查<strong>負載因子</strong>：超過門檻就把容量加倍，每個既有的 key 重新算 <Code>hash % 新容量</Code> 放進新桶。</>,
            <><strong>刪除</strong>：找到後從鏈中移除。開放定址法的刪除要留「墓碑」標記，鏈結法不用，這是鏈結法比較好教的原因。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>從 4 個桶開始插入 key，看碰撞怎麼串成鏈；負載因子超過 0.75 時桶數會加倍、所有 key 重新分配，鏈又變短。</p>
        <HashTableDemo />
      </Section>

      <Section id="code">
        <p>手寫一個鏈結法雜湊表，把 get / put / remove / rehash 走一遍；最後是實務上該直接用的內建容器。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 705", name: "Design HashSet", diff: "Easy" },
            { src: "LeetCode 706", name: "Design HashMap", diff: "Easy" },
            { src: "LeetCode 217", name: "Contains Duplicate", diff: "Easy" },
            { src: "LeetCode 380", name: "Insert Delete GetRandom O(1)（雜湊表 + 陣列）", diff: "Medium" },
            { src: "LeetCode 146", name: "LRU Cache（雜湊表 + 雙向鏈結串列）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const hashTableLesson: Lesson = { prereq: "Array & Dynamic Array、Amortized Analysis", Body };
