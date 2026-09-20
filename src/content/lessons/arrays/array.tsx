import { ArrayOpsDemo } from "@/components/lesson/demos/ArrayOpsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `# Python's list is a dynamic array
nums = [12, 7, 3, 9, 15, 4]

nums[3]              # O(1): address = base + 3 × element size, so it jumps straight there
nums[3] = 10         # O(1)
nums.append(8)       # amortised O(1): if there is room at the end, it just goes there
nums.pop()           # O(1): decrement size

nums.insert(0, 99)   # O(n): every element shifts one slot right
nums.pop(0)          # O(n): every element shifts one slot left
99 in nums           # O(n): unsorted, so there is nothing to do but check one by one
del nums[2]          # O(n): everything after it closes the gap


# Remove every element equal to val, in place (LeetCode 27):
# a write pointer moves the keepers forward, with no new array
def remove_element(nums, val):
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return write            # the first write elements are the result


# Rotate by k in place (LeetCode 189): three reversals, O(n) time and O(1) space
def rotate(nums, k):
    def reverse(i, j):
        while i < j:
            nums[i], nums[j] = nums[j], nums[i]
            i, j = i + 1, j - 1
    n = len(nums)
    k %= n
    reverse(0, n - 1)       # reverse the whole array
    reverse(0, k - 1)       # reverse the first k back
    reverse(k, n - 1)       # reverse the last n-k back`;

const cpp = `#include <vector>
#include <algorithm>

// std::vector is a dynamic array
int main() {
    std::vector<int> nums = {12, 7, 3, 9, 15, 4};

    nums[3];                          // O(1)
    nums[3] = 10;                     // O(1)
    nums.push_back(8);                // amortised O(1)
    nums.pop_back();                  // O(1)

    nums.insert(nums.begin(), 99);    // O(n): everything shifts right
    nums.erase(nums.begin());         // O(n): everything shifts left
    std::find(nums.begin(), nums.end(), 99);   // O(n)

    // reserve when the final size is known, and no growth copy ever happens
    std::vector<int> big;
    big.reserve(1000000);
}

// Remove val in place: a read pointer and a write pointer
int removeElement(std::vector<int>& nums, int val) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++)
        if (nums[read] != val) nums[write++] = nums[read];
    return write;
}

// Rotate by k in place: three reversals
void rotate(std::vector<int>& nums, int k) {
    int n = nums.size();
    k %= n;
    std::reverse(nums.begin(), nums.end());
    std::reverse(nums.begin(), nums.begin() + k);
    std::reverse(nums.begin() + k, nums.end());
}`;

const javascript = `// A JavaScript Array is a dynamic array
const nums = [12, 7, 3, 9, 15, 4];

nums[3];               // O(1): address = base + 3 × element size, so it jumps straight there
nums[3] = 10;          // O(1)
nums.push(8);          // amortised O(1): if there is room at the end, it just goes there
nums.pop();            // O(1): decrement size

nums.unshift(99);      // O(n): every element shifts one slot right
nums.shift();          // O(n): every element shifts one slot left
nums.includes(99);     // O(n): unsorted, so there is nothing to do but check one by one
nums.splice(2, 1);     // O(n): everything after it closes the gap


// Remove every element equal to val, in place (LeetCode 27):
// a write pointer moves the keepers forward, with no new array
function removeElement(nums, val) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== val) {
      nums[write] = nums[read];
      write++;
    }
  }
  return write;          // the first write elements are the result
}


// Rotate by k in place (LeetCode 189): three reversals, O(n) time and O(1) space
function rotate(nums, k) {
  const reverse = (i, j) => {
    while (i < j) {
      [nums[i], nums[j]] = [nums[j], nums[i]];
      i++; j--;
    }
  };
  const n = nums.length;
  k %= n;
  reverse(0, n - 1);     // reverse the whole array
  reverse(0, k - 1);     // reverse the first k back
  reverse(k, n - 1);     // reverse the last n-k back
}`;

export const skeleton: LessonSkeleton = {
  demo: <ArrayOpsDemo />,
  code: { python, cpp, javascript },
};
