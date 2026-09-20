import { HashTableDemo } from "@/components/lesson/demos/HashTableDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `class HashMap:
    """Separate chaining: each bucket is a list of (key, value) pairs."""

    MAX_LOAD = 0.75

    def __init__(self, capacity=4):
        self.capacity = capacity
        self.size = 0
        self.buckets = [[] for _ in range(capacity)]

    def _index(self, key):
        return hash(key) % self.capacity        # hash function -> bucket number

    def get(self, key, default=None):
        for k, v in self.buckets[self._index(key)]:   # only this one bucket
            if k == key:
                return v
        return default

    def put(self, key, value):
        bucket = self.buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:                            # already present: overwrite
                bucket[i] = (key, value)
                return
        bucket.append((key, value))                 # new key: append to the end of the chain
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
        # Double the capacity and re-bucket every key. O(n), but amortised each put is still O(1)
        old = self.buckets
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        for bucket in old:
            for k, v in bucket:
                self.buckets[self._index(k)].append((k, v))


# In real code, reach for the built-in dict / set: they are hash tables
m = {}
m["alice"] = 30          # O(1) average
m.get("bob", 0)          # O(1) average
"alice" in m             # O(1) average
del m["alice"]           # O(1) average`;

const cpp = `#include <vector>
#include <list>
#include <string>
#include <functional>
#include <unordered_map>

// Hash table with separate chaining: each bucket is a list<pair<K,V>>
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

// In practice, use std::unordered_map / unordered_set
int main() {
    std::unordered_map<std::string, int> m;
    m["alice"] = 30;                 // O(1) average
    m.count("alice");                // O(1) average
    auto it = m.find("bob");         // returns m.end() when not found
    m.erase("alice");
}`;

const javascript = `// Separate chaining: each bucket is an array of [key, value] pairs.
class HashMap {
  static MAX_LOAD = 0.75;

  constructor(capacity = 4) {
    this.capacity = capacity;
    this.size = 0;
    this.buckets = Array.from({ length: capacity }, () => []);
  }

  // A toy string hash (djb2); real engines use much better ones
  hash(key) {
    let h = 5381;
    for (const ch of String(key)) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
    return h;
  }

  index(key) {
    return this.hash(key) % this.capacity;       // hash function -> bucket number
  }

  get(key, fallback = undefined) {
    for (const [k, v] of this.buckets[this.index(key)]) {   // only this one bucket
      if (k === key) return v;
    }
    return fallback;
  }

  put(key, value) {
    const bucket = this.buckets[this.index(key)];
    for (const pair of bucket) {
      if (pair[0] === key) {                     // already present: overwrite
        pair[1] = value;
        return;
      }
    }
    bucket.push([key, value]);                   // new key: append to the end of the chain
    this.size++;
    if (this.size / this.capacity > HashMap.MAX_LOAD) this.rehash();
  }

  remove(key) {
    const bucket = this.buckets[this.index(key)];
    const i = bucket.findIndex(([k]) => k === key);
    if (i === -1) return false;
    bucket.splice(i, 1);
    this.size--;
    return true;
  }

  rehash() {
    // Double the capacity and re-bucket every key. O(n), but amortised each put is still O(1)
    const old = this.buckets;
    this.capacity *= 2;
    this.buckets = Array.from({ length: this.capacity }, () => []);
    for (const bucket of old) {
      for (const [k, v] of bucket) this.buckets[this.index(k)].push([k, v]);
    }
  }
}


// In real code, reach for the built-in Map / Set: they are hash tables
const m = new Map();
m.set("alice", 30);      // O(1) average
m.get("bob") ?? 0;       // O(1) average
m.has("alice");          // O(1) average
m.delete("alice");       // O(1) average`;

export const skeleton: LessonSkeleton = {
  demo: <HashTableDemo />,
  code: { python, cpp, javascript },
};
