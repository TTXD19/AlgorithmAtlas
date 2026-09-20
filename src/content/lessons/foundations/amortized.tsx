import { DynamicArrayDemo } from "@/components/lesson/demos/DynamicArrayDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `class DynamicArray:
    """A hand-written list, so you can watch when the growth happens."""

    def __init__(self):
        self.capacity = 1
        self.size = 0
        self.data = [None] * self.capacity
        self.copies = 0            # total number of elements moved

    def push(self, x):
        if self.size == self.capacity:
            self._grow()           # occasionally expensive: O(n)
        self.data[self.size] = x   # usually cheap: O(1)
        self.size += 1

    def _grow(self):
        new_capacity = self.capacity * 2      # the key: double it, do not add a fixed amount
        new_data = [None] * new_capacity
        for i in range(self.size):
            new_data[i] = self.data[i]
            self.copies += 1
        self.data = new_data
        self.capacity = new_capacity


arr = DynamicArray()
for i in range(1_000_000):
    arr.push(i)
print(arr.copies)      # about 1,000,000, nowhere near n²
# Total cost ≈ n insertions + fewer than n moves < 3n, so under 3 per push → O(1) amortised`;

const cpp = `#include <vector>
#include <cstdio>

// std::vector is a dynamic array. Watch when the capacity changes.
int main() {
    std::vector<int> v;
    size_t lastCap = 0;
    long long copies = 0;
    for (int i = 0; i < 1000; i++) {
        if (v.size() == v.capacity()) copies += v.size();  // this push will move the existing elements
        v.push_back(i);
        if (v.capacity() != lastCap) {
            std::printf("size=%zu capacity=%zu\\n", v.size(), v.capacity());
            lastCap = v.capacity();
        }
    }
    std::printf("total copies = %lld (< 2n)\\n", copies);
    // When the size is known up front, reserve avoids the moves entirely
    std::vector<int> w;
    w.reserve(1000);
}`;

const javascript = `// A hand-written dynamic array, so you can watch when the growth happens.
// (A JavaScript Array already does this for you under the hood.)
class DynamicArray {
  constructor() {
    this.capacity = 1;
    this.size = 0;
    this.data = new Array(this.capacity);
    this.copies = 0;                 // total number of elements moved
  }

  push(x) {
    if (this.size === this.capacity) this.grow();   // occasionally expensive: O(n)
    this.data[this.size] = x;                       // usually cheap: O(1)
    this.size++;
  }

  grow() {
    const newCapacity = this.capacity * 2;          // the key: double it, do not add a fixed amount
    const newData = new Array(newCapacity);
    for (let i = 0; i < this.size; i++) {
      newData[i] = this.data[i];
      this.copies++;
    }
    this.data = newData;
    this.capacity = newCapacity;
  }
}

const arr = new DynamicArray();
for (let i = 0; i < 1_000_000; i++) arr.push(i);
console.log(arr.copies);   // about 1,000,000, nowhere near n²
// Total cost ≈ n insertions + fewer than n moves < 3n, so under 3 per push → O(1) amortised`;

export const skeleton: LessonSkeleton = {
  demo: <DynamicArrayDemo />,
  code: { python, cpp, javascript },
};
