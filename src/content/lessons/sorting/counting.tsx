import { CountingSortDemo } from "@/components/lesson/demos/CountingSortDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `# Counting sort: integer keys over the range [lo, hi], with no comparisons at all. O(n + k), k = hi - lo + 1
def counting_sort(a):
    if not a:
        return []
    lo, hi = min(a), max(a)
    count = [0] * (hi - lo + 1)
    for x in a:
        count[x - lo] += 1                   # shift by lo so negative values can index too
    out = []
    for v, c in enumerate(count):
        out.extend([v + lo] * c)             # the value v + lo occurs c times, so emit it c times
    return out


# Stable version: sorts objects whose key(x) lands in 0..k-1
def counting_sort_by_key(items, key, k):
    count = [0] * k
    for it in items:
        count[key(it)] += 1
    for v in range(1, k):
        count[v] += count[v - 1]             # now count[v] = how many elements have key <= v
    out = [None] * len(items)
    for it in reversed(items):               # fill from the back so equal keys keep their order
        count[key(it)] -= 1
        out[count[key(it)]] = it
    return out


if __name__ == "__main__":
    print(counting_sort([5, 2, 9, 1, 7, 3, 8, 4, 2, 5]))   # [1, 2, 2, 3, 4, 5, 5, 7, 8, 9]
    print(counting_sort([3, -1, 0, -1, 2]))                # [-1, -1, 0, 2, 3]
    # already in registration order; after sorting by score, equal scores stay in that order
    students = [("Amy", 88), ("Ben", 72), ("Cara", 88), ("Dan", 95), ("Eve", 72)]
    print(counting_sort_by_key(students, key=lambda s: s[1], k=101))
    # [('Ben', 72), ('Eve', 72), ('Amy', 88), ('Cara', 88), ('Dan', 95)]`;

const cpp = `#include <algorithm>
#include <iostream>
#include <string>
#include <utility>
#include <vector>

// Counting sort: integer keys over the range [lo, hi]. O(n + k)
std::vector<int> countingSort(const std::vector<int>& a) {
    if (a.empty()) return {};
    auto [mn, mx] = std::minmax_element(a.begin(), a.end());
    int lo = *mn;
    std::vector<int> count(*mx - lo + 1, 0);    // this line eats all the memory when the range is too wide
    for (int x : a) count[x - lo]++;            // shift by lo so negative values can index too
    std::vector<int> out;
    out.reserve(a.size());
    for (int v = 0; v < (int)count.size(); v++)
        out.insert(out.end(), count[v], v + lo);  // emit count[v] copies of the value v + lo
    return out;
}

// Stable version: sorts objects by a key in 0..k-1
template <typename T, typename Key>
std::vector<T> countingSortByKey(const std::vector<T>& items, Key key, int k) {
    std::vector<int> count(k, 0);
    for (const T& it : items) count[key(it)]++;
    for (int v = 1; v < k; v++) count[v] += count[v - 1];     // how many have key <= v
    std::vector<T> out(items.size());
    for (auto it = items.rbegin(); it != items.rend(); ++it)  // filling from the back is what makes it stable
        out[--count[key(*it)]] = *it;
    return out;
}

int main() {
    for (int x : countingSort({5, 2, 9, 1, 7, 3, 8, 4, 2, 5})) std::cout << x << ' ';
    std::cout << '\\n';                          // 1 2 2 3 4 5 5 7 8 9
    for (int x : countingSort({3, -1, 0, -1, 2})) std::cout << x << ' ';
    std::cout << '\\n';                          // -1 -1 0 2 3

    std::vector<std::pair<std::string, int>> students = {
        {"Amy", 88}, {"Ben", 72}, {"Cara", 88}, {"Dan", 95}, {"Eve", 72}};
    auto byScore = countingSortByKey(students, [](const auto& s) { return s.second; }, 101);
    for (const auto& [name, score] : byScore) std::cout << name << ' ';
    std::cout << '\\n';                          // Ben Eve Amy Cara Dan
}`;

export const skeleton: LessonSkeleton = {
  demo: <CountingSortDemo />,
  code: { python, cpp },
};
