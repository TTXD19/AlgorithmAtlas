import { CombinatoricsDemo } from "@/components/lesson/demos/CombinatoricsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `MOD = 1_000_000_007


class Binomial:
    """Precompute factorials and their inverses so every later C(n, k) mod p is O(1). Requires n_max < p"""

    def __init__(self, n_max, p=MOD):
        self.p = p
        self.fact = [1] * (n_max + 1)
        for i in range(1, n_max + 1):
            self.fact[i] = self.fact[i - 1] * i % p
        self.inv_fact = [1] * (n_max + 1)
        self.inv_fact[n_max] = pow(self.fact[n_max], p - 2, p)   # the only fast exponentiation in the whole setup
        for i in range(n_max, 0, -1):
            self.inv_fact[i - 1] = self.inv_fact[i] * i % p     # inverse of (i-1)! = inverse of i! * i

    def C(self, n, k):
        if k < 0 or k > n:                      # nothing to choose, so 0; guard first to avoid an out-of-range index
            return 0
        return self.fact[n] * self.inv_fact[k] % self.p * self.inv_fact[n - k] % self.p


def comb_exact(n, k):
    """Exact value, O(min(k, n-k)). Step i holds C(n-k+i, i), always an integer, so multiplying before dividing leaves no remainder.
    From Python 3.8 onward math.comb does this for you"""
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)
    res = 1
    for i in range(1, k + 1):
        res = res * (n - k + i) // i
    return res


if __name__ == "__main__":
    print(Binomial(8, 13).C(8, 3), comb_exact(8, 3))   # 4 56: the demo's C(8, 3) mod 13
    print(comb_exact(49, 6))                    # 13983816: ways to draw 6 lottery numbers from 49
    print(comb_exact(4 + 2, 2))                 # 15: paths made of 4 steps right and 2 steps down
    print(comb_exact(10 + 4 - 1, 4 - 1))        # 286: 10 identical machines across 4 data centres (stars and bars)
    print(Binomial(200000).C(200000, 100000))   # 879467333`;

const cpp = `#include <cmath>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <vector>

// Prime modulus p with n < p: a factorial table plus an inverse factorial table, O(n + log p) to build, O(1) per query
struct Binomial {
    std::int64_t p;
    std::vector<std::int64_t> fact, invFact;

    static std::int64_t power(std::int64_t a, std::int64_t e, std::int64_t m) {
        std::int64_t r = 1;
        for (a %= m; e > 0; e >>= 1, a = a * a % m)
            if (e & 1) r = r * a % m;
        return r;
    }

    Binomial(int nMax, std::int64_t mod) : p(mod), fact(nMax + 1, 1), invFact(nMax + 1, 1) {
        for (int i = 1; i <= nMax; i++) fact[i] = fact[i - 1] * i % p;
        invFact[nMax] = power(fact[nMax], p - 2, p);
        for (int i = nMax; i >= 1; i--) invFact[i - 1] = invFact[i] * i % p;
    }

    std::int64_t C(int n, int k) const {
        if (k < 0 || k > n) return 0;
        return fact[n] * invFact[k] % p * invFact[n - k] % p;
    }
};

// When the modulus is not prime (so inverses do not exist): Pascal's triangle needs addition only, O(n²)
std::vector<std::vector<std::int64_t>> pascal(int n, std::int64_t m) {
    std::vector<std::vector<std::int64_t>> c(n + 1);
    for (int i = 0; i <= n; i++) {
        c[i].assign(i + 1, 1 % m);
        for (int j = 1; j < i; j++) c[i][j] = (c[i - 1][j - 1] + c[i - 1][j]) % m;
    }
    return c;
}

// Probabilities take no modulus: the binomials overflow, so work in logs. lgamma(n + 1) = ln(n!)
double logC(int n, int k) { return std::lgamma(n + 1.0) - std::lgamma(k + 1.0) - std::lgamma(n - k + 1.0); }

int main() {
    Binomial bin(200000, 1000000007);
    std::cout << bin.C(200000, 100000) << ' ' << bin.C(5, 7) << '\\n';     // 879467333 0

    std::cout << pascal(30, 1000)[30][15] << '\\n';                        // 520: C(30, 15) = 155117520, and a composite modulus of 1000 is no obstacle

    // One lottery ticket matching exactly 3 of the 6 drawn numbers: C(6, 3)·C(43, 3) / C(49, 6)
    double prob = std::exp(logC(6, 3) + logC(43, 3) - logC(49, 6));
    std::cout << std::setprecision(6) << prob << '\\n';                     // 0.0176504
}`;

export const skeleton: LessonSkeleton = {
  demo: <CombinatoricsDemo />,
  code: { python, cpp },
};
