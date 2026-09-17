import { SieveDemo } from "@/components/lesson/demos/SieveDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `def sieve(n):
    """Sieve of Eratosthenes: is_prime[x] is True when x is prime. O(n log log n)"""
    is_prime = [True] * (n + 1)
    is_prime[0:2] = [False] * min(2, n + 1)     # neither 0 nor 1 is prime
    p = 2
    while p * p <= n:                           # stop once p² > n: a larger p has no multiples left to cross off
        if is_prime[p]:
            # start at p²: smaller multiples p·k (k < p) were already crossed off by k's prime factors
            is_prime[p * p::p] = [False] * ((n - p * p) // p + 1)
        p += 1
    return is_prime


def linear_sieve(n):
    """Linear sieve: every composite is crossed off once, by its smallest prime factor. Returns (primes, spf). O(n)"""
    spf = [0] * (n + 1)                         # spf[x]: the smallest prime factor of x
    primes = []
    for i in range(2, n + 1):
        if spf[i] == 0:                         # nothing crossed it off, so it is prime
            spf[i] = i
            primes.append(i)
        for p in primes:
            if p > spf[i] or i * p > n:         # once p passes i's smallest prime factor, p is no longer the smallest factor of i·p
                break
            spf[i * p] = p
    return primes, spf


def factorize(x, spf):
    """Factorise through the smallest-prime-factor table. Every step divides by at least 2, so O(log x)"""
    factors = []
    while x > 1:
        p, cnt = spf[x], 0
        while x % p == 0:
            x //= p
            cnt += 1
        factors.append((p, cnt))
    return factors


if __name__ == "__main__":
    is_prime = sieve(60)
    print([x for x in range(61) if is_prime[x]])
    # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]
    print(sum(sieve(10**6)))                    # 78498: how many primes there are below one million
    primes, spf = linear_sieve(100)
    print(len(primes), factorize(84, spf), factorize(97, spf))
    # 25 [(2, 2), (3, 1), (7, 1)] [(97, 1)]`;

const cpp = `#include <algorithm>
#include <cstddef>
#include <iostream>
#include <vector>

// Returns every prime ≤ n. vector<char> spends a byte per number, which is faster to access than vector<bool>
std::vector<long long> primesUpTo(long long n) {
    std::vector<long long> primes;
    if (n < 2) return primes;
    std::vector<char> composite(static_cast<std::size_t>(n) + 1, 0);
    for (long long p = 2; p <= n / p; p++)                  // written as p <= n / p so that p * p cannot overflow
        if (!composite[static_cast<std::size_t>(p)])
            for (long long m = p * p; m <= n; m += p) composite[static_cast<std::size_t>(m)] = 1;
    for (long long x = 2; x <= n; x++)
        if (!composite[static_cast<std::size_t>(x)]) primes.push_back(x);
    return primes;
}

// Segmented sieve: the primes in [L, R]. Only the primes up to √R are needed, so memory is O(√R + (R − L))
std::vector<long long> primesInRange(long long L, long long R) {
    std::vector<long long> res;
    if (R < 2 || L > R) return res;
    L = std::max(L, 2LL);
    long long lim = 1;
    while ((lim + 1) <= R / (lim + 1)) lim++;               // lim = ⌊√R⌋, computed entirely in integers
    std::vector<char> composite(static_cast<std::size_t>(R - L + 1), 0);
    for (long long p : primesUpTo(lim)) {
        long long start = std::max(p * p, (L + p - 1) / p * p);   // the first multiple of p in the range that is ≥ p²
        for (long long m = start; m <= R; m += p) composite[static_cast<std::size_t>(m - L)] = 1;
    }
    for (long long x = L; x <= R; x++)
        if (!composite[static_cast<std::size_t>(x - L)]) res.push_back(x);
    return res;
}

int main() {
    std::cout << primesUpTo(10000000).size() << '\\n';          // 664579: how many primes there are below ten million
    for (long long p : primesInRange(1000000000000LL, 1000000000100LL)) std::cout << p << ' ';
    std::cout << '\\n';                                          // 1000000000039 1000000000061 1000000000063 1000000000091
}`;

export const skeleton: LessonSkeleton = {
  demo: <SieveDemo />,
  code: { python, cpp },
};
