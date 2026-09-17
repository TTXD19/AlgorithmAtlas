import { MasterTheoremDemo } from "@/components/lesson/demos/MasterTheoremDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `import math


def npow(d):
    """How to print n^d: n^0 prints as 1, n^1 prints as n"""
    return "1" if d == 0 else "n" if d == 1 else f"n^{d}"


def master(a, b, d):
    """Solve T(n) = a·T(n/b) + Θ(n^d). Returns (case, complexity string).
    Compare log_b(a) with d:
      greater → the leaves dominate, Θ(n^log_b a)
      equal   → every level does the same work, Θ(n^d · log n)
      less    → the root dominates, Θ(n^d)
    """
    e = math.log(a, b)                      # log_b a, the exponent on the leaf count
    if abs(e - d) < 1e-9:
        return 2, "Θ(log n)" if d == 0 else f"Θ({npow(d)} log n)"
    if e > d:
        return 1, f"Θ(n^{e:.2f})"
    return 3, f"Θ({npow(d)})"


# Sum the recursion tree level by level to check the answer the theorem gives
def recursion_tree(a, b, d, n):
    total, size, nodes = 0, n, 1
    while size >= 1:
        total += nodes * size ** d          # this level: nodes subproblems, each costing size^d
        nodes *= a
        size /= b
    return total


if __name__ == "__main__":
    for name, (a, b, d) in {
        "Merge sort": (2, 2, 1),
        "Binary search": (1, 2, 0),
        "Karatsuba": (3, 2, 1),
        "Strassen": (7, 2, 2),
    }.items():
        case, ans = master(a, b, d)
        print(f"{name}: T(n) = {'' if a == 1 else a}T(n/{b}) + {npow(d)} → case {case}, {ans}")
    # Merge sort: T(n) = 2T(n/2) + n → case 2, Θ(n log n)
    # Binary search: T(n) = T(n/2) + 1 → case 2, Θ(log n)
    # Karatsuba: T(n) = 3T(n/2) + n → case 1, Θ(n^1.58)
    # Strassen: T(n) = 7T(n/2) + n^2 → case 1, Θ(n^2.81)

    # Double n from 1024 to 2048 and see how much the total work grows:
    # merge sort about 2.2× (n log n grows slightly more than 2× when n doubles), Strassen about 7× (n^2.81)
    for a, b, d in [(2, 2, 1), (7, 2, 2)]:
        r = recursion_tree(a, b, d, 2048) / recursion_tree(a, b, d, 1024)
        print(f"a={a} b={b} d={d}: n doubles, work ×{r:.2f}")   # ×2.18, ×7.01`;

const cpp = `#include <cmath>
#include <cstdio>
#include <string>

// T(n) = a·T(n/b) + Θ(n^d): returns the case number and writes the answer into out
int master(int a, int b, int d, std::string& out) {
    double e = std::log(a) / std::log(b);   // log_b a
    std::string nd = d == 0 ? "1" : d == 1 ? "n" : "n^" + std::to_string(d);   // how to print n^d
    if (std::fabs(e - d) < 1e-9) {          // case 2: every level does the same work
        out = d == 0 ? "Θ(log n)" : "Θ(" + nd + " log n)";
        return 2;
    }
    if (e > d) {                            // case 1: the leaves dominate
        char buf[32];
        std::snprintf(buf, sizeof buf, "Θ(n^%.2f)", e);
        out = buf; return 1;
    }
    out = "Θ(" + nd + ")";                  // case 3: the root dominates
    return 3;
}

// Sum the recursion tree level by level to check the theorem
double recursionTree(int a, int b, int d, double n) {
    double total = 0, size = n, nodes = 1;
    while (size >= 1) {
        total += nodes * std::pow(size, d);
        nodes *= a;
        size /= b;
    }
    return total;
}

int main() {
    struct { const char* name; int a, b, d; } cases[] = {
        {"Merge sort", 2, 2, 1}, {"Binary search", 1, 2, 0}, {"Karatsuba", 3, 2, 1}, {"Strassen", 7, 2, 2},
    };
    for (auto& c : cases) {
        std::string ans;
        int k = master(c.a, c.b, c.d, ans);
        std::printf("%s: case %d, %s\\n", c.name, k, ans.c_str());   // e.g. Merge sort: case 2, Θ(n log n)
    }
    std::printf("Merge sort, n doubled → ×%.2f\\n", recursionTree(2, 2, 1, 2048) / recursionTree(2, 2, 1, 1024));   // ×2.18
    std::printf("Strassen, n doubled → ×%.2f\\n", recursionTree(7, 2, 2, 2048) / recursionTree(7, 2, 2, 1024));   // ×7.01
}`;

export const skeleton: LessonSkeleton = {
  demo: <MasterTheoremDemo />,
  code: { python, cpp },
};
