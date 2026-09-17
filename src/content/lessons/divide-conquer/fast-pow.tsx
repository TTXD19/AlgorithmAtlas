import { FastPowDemo } from "@/components/lesson/demos/FastPowDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Recursive: x^n = (x^(n//2))², with one extra x when n is odd
def power_rec(x, n):
    if n == 0:
        return 1
    half = power_rec(x, n // 2)          # recurse once only; two calls would degrade this to O(n)
    return half * half * (x if n % 2 else 1)


# Iterative: scan n's bits from low to high, squaring base each round
def power_mod(x, n, mod):
    result, base = 1 % mod, x % mod
    while n > 0:
        if n & 1:                        # this bit is 1: multiply x^(2^i) into the answer
            result = result * base % mod
        base = base * base % mod         # x^(2^i) → x^(2^(i+1))
        n >>= 1
    return result


# The same routine on matrices: [[1, 1], [1, 0]]^n = [[F(n+1), F(n)], [F(n), F(n-1)]]
def mat_mul(A, B, mod):
    return [[(A[0][0] * B[0][0] + A[0][1] * B[1][0]) % mod, (A[0][0] * B[0][1] + A[0][1] * B[1][1]) % mod],
            [(A[1][0] * B[0][0] + A[1][1] * B[1][0]) % mod, (A[1][0] * B[0][1] + A[1][1] * B[1][1]) % mod]]


def fib_mod(n, mod):
    result, base = [[1, 0], [0, 1]], [[1, 1], [1, 0]]   # the identity matrix is the "1" of matrices
    while n > 0:
        if n & 1:
            result = mat_mul(result, base, mod)
        base = mat_mul(base, base, mod)
        n >>= 1
    return result[0][1]                  # the top-right entry is F(n)


if __name__ == "__main__":
    print(power_rec(3, 13), power_rec(2, 10))      # 1594323 1024
    MOD = 10**9 + 7
    print(power_mod(3, 25, MOD), pow(3, 25, MOD))  # 288603514 288603514 (the built-in three-argument pow is fast exponentiation)
    print(fib_mod(10, MOD), fib_mod(10**18, MOD))  # 55 209783453 (term 10¹⁸ takes only about 60 rounds)`;

const cpp = `#include <cstdint>
#include <iostream>

using u64 = std::uint64_t;

// Fast exponentiation under a modulus: with both values below mod (≤ 2³²) the product fits in 64 bits
u64 powMod(u64 x, u64 n, u64 mod) {
    u64 result = 1 % mod, base = x % mod;
    for (; n > 0; n >>= 1) {
        if (n & 1) result = result * base % mod;   // this bit is 1, so multiply it into the answer
        base = base * base % mod;                  // prepare x^(2^(i+1)) for the next bit
    }
    return result;
}

// LeetCode 50: floating point and negative exponents. Negating n = INT_MIN overflows, so widen to 64 bits first
double myPow(double x, int n) {
    long long e = n;
    if (e < 0) { x = 1 / x; e = -e; }
    double result = 1;
    for (; e > 0; e >>= 1) {
        if (e & 1) result *= x;
        x *= x;
    }
    return result;
}

// F(n) mod m by fast exponentiation of a 2×2 matrix
struct Mat { u64 a, b, c, d; };                    // [[a, b], [c, d]]
Mat mul(const Mat& X, const Mat& Y, u64 m) {
    return {(X.a * Y.a + X.b * Y.c) % m, (X.a * Y.b + X.b * Y.d) % m,
            (X.c * Y.a + X.d * Y.c) % m, (X.c * Y.b + X.d * Y.d) % m};
}
u64 fibMod(u64 n, u64 m) {
    Mat result{1, 0, 0, 1}, base{1, 1, 1, 0};     // identity matrix, transition matrix
    for (; n > 0; n >>= 1) {
        if (n & 1) result = mul(result, base, m);
        base = mul(base, base, m);
    }
    return result.b;
}

int main() {
    const u64 MOD = 1000000007;
    std::cout << powMod(3, 13, MOD) << ' ' << powMod(3, 25, MOD) << '\\n';    // 1594323 288603514
    std::cout << myPow(2.0, 10) << ' ' << myPow(2.0, -2) << '\\n';            // 1024 0.25
    std::cout << fibMod(10, MOD) << ' ' << fibMod(1000000000000000000ULL, MOD) << '\\n';  // 55 209783453
}`;

export const skeleton: LessonSkeleton = {
  demo: <FastPowDemo />,
  code: { python, cpp },
};
