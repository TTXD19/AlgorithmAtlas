import { GcdDemo } from "@/components/lesson/demos/GcdDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from functools import reduce


def gcd(a, b):
    """Euclidean algorithm: gcd(a, b) = gcd(b, a mod b). O(log min(a, b))"""
    a, b = abs(a), abs(b)
    while b:
        a, b = b, a % b                  # replace the larger with the remainder, until the remainder is 0
    return a


def lcm(a, b):
    """Least common multiple: divide before multiplying so nothing exceeds the answer"""
    if a == 0 or b == 0:
        return 0
    return abs(a // gcd(a, b) * b)


def ext_gcd(a, b):
    """Extended Euclid (a, b >= 0): returns (g, x, y) with a*x + b*y == g"""
    if b == 0:
        return a, 1, 0                   # a*1 + 0*0 == a
    g, x1, y1 = ext_gcd(b, a % b)        # b*x1 + (a % b)*y1 == g
    # substitute a % b == a - (a // b)*b and regroup as coefficients of a and b
    return g, y1, x1 - (a // b) * y1


def mod_inverse(a, m):
    """Inverse of a modulo m. m need not be prime, only gcd(a, m) == 1"""
    g, x, _ = ext_gcd(a % m, m)
    if g != 1:
        return None                      # not coprime, so no inverse exists
    return x % m                         # x may be negative, so pull it back into [0, m)


if __name__ == "__main__":
    print(gcd(48000, 44100))             # 300 (44.1 kHz → 48 kHz is the ratio 160/147)
    print(lcm(24, 30))                   # 120
    print(ext_gcd(252, 105))             # (21, -2, 5): 252·(−2) + 105·5 = 21
    print(mod_inverse(17, 3120))         # 2753 (the private exponent d from the RSA example)
    print(mod_inverse(6, 9))             # None (gcd(6, 9) = 3)
    print(reduce(gcd, [84, 126, 210]))   # 42: fold pairwise for more than two numbers
    print(reduce(lcm, [6, 8, 15]))       # 120
    # Built in: math.gcd, and math.lcm since Python 3.9; both accept several arguments`;

const cpp = `#include <cstdlib>
#include <iostream>
#include <numeric>
#include <tuple>
#include <vector>

// Euclidean algorithm: gcd(a, b) = gcd(b, a mod b). O(log min(a, b))
long long gcd(long long a, long long b) {
    a = std::llabs(a);                   // C++'s % follows the sign of the dividend, so take absolute values first
    b = std::llabs(b);
    while (b != 0) {
        long long r = a % b;
        a = b;
        b = r;
    }
    return a;
}

// Divide before multiplying: written as a * b / gcd, the product a * b can overflow first
long long lcm(long long a, long long b) {
    if (a == 0 || b == 0) return 0;
    return std::llabs(a / gcd(a, b) * b);
}

// Extended Euclid (iterative, matching the table in the demo). a, b >= 0
// Every row maintains r = a·s + b·t. Returns {g, x, y} with a*x + b*y == g
std::tuple<long long, long long, long long> extGcd(long long a, long long b) {
    long long r0 = a, s0 = 1, t0 = 0;
    long long r1 = b, s1 = 0, t1 = 1;
    auto next = [](long long& x0, long long& x1, long long q) {
        long long x2 = x0 - q * x1;      // new row = row before last − q × last row
        x0 = x1;
        x1 = x2;
    };
    while (r1 != 0) {
        long long q = r0 / r1;
        next(r0, r1, q);                 // r, s and t all advance by the same rule
        next(s0, s1, q);
        next(t0, t1, q);
    }
    return {r0, s0, t0};
}

// Inverse of a modulo m (m need not be prime). Returns -1 when none exists
long long modInverse(long long a, long long m) {
    auto [g, x, y] = extGcd((a % m + m) % m, m);
    if (g != 1) return -1;
    return (x % m + m) % m;              // x may be negative
}

int main() {
    std::cout << gcd(48000, 44100) << "\\n";            // 300
    std::cout << lcm(24, 30) << "\\n";                  // 120
    auto [g, x, y] = extGcd(252, 105);
    std::cout << g << " " << x << " " << y << "\\n";    // 21 -2 5
    std::cout << modInverse(17, 3120) << "\\n";         // 2753
    std::cout << modInverse(6, 9) << "\\n";             // -1

    // C++17's <numeric> provides std::gcd and std::lcm; fold over several of them with accumulate
    std::vector<long long> v = {84, 126, 210};
    long long all = std::accumulate(v.begin(), v.end(), 0LL,
                                    [](long long p, long long q) { return std::gcd(p, q); });
    std::cout << all << "\\n";                          // 42 (gcd(0, a) = a, so 0 is the right initial value)
}`;

export const skeleton: LessonSkeleton = {
  demo: <GcdDemo />,
  code: { python, cpp },
};
