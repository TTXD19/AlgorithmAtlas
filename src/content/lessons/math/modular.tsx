import { ModularDemo } from "@/components/lesson/demos/ModularDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `MOD = 1_000_000_007


def mod_pow(a, e, m=MOD):
    """Fast exponentiation: a^e mod m in O(log e). Python's built-in pow(a, e, m) does the same thing."""
    a %= m
    result = 1 % m
    while e:
        if e & 1:
            result = result * a % m
        a = a * a % m                           # reduce at every step so the numbers never grow
        e >>= 1
    return result


def mod_inv(a, p=MOD):
    """Fermat's little theorem: for prime p the inverse of a is a^(p-2). Multiples of p have no inverse."""
    if a % p == 0:
        raise ValueError("a is a multiple of p, so it has no inverse")
    return mod_pow(a, p - 2, p)


def inverses_upto(n, p=MOD):
    """Every inverse from 1 to n in one O(n) pass. p must be a prime larger than n."""
    inv = [0] * (n + 1)
    if n >= 1:
        inv[1] = 1
    for i in range(2, n + 1):
        inv[i] = (p - p // i) * inv[p % i] % p  # rearranged from p = (p // i)·i + p % i, reduced mod p
    return inv


def iban_valid(iban):
    """IBAN check digits: move the first four characters to the end, map letters to 10 through 35, and the whole number mod 97 must equal 1.
    It runs to thirty-odd digits, so reducing as you read avoids ever building the big integer"""
    s = iban.replace(" ", "")
    s = s[4:] + s[:4]
    r = 0
    for ch in s:
        v = int(ch, 36)                         # 0-9 → 0 through 9, A-Z → 10 through 35
        r = (r * (100 if v >= 10 else 10) + v) % 97
    return r == 1


if __name__ == "__main__":
    print(mod_pow(5, 11, 13), mod_inv(5, 13))   # 8 8
    print(7 * mod_inv(5, 13) % 13)              # 4: this is 7 / 5 modulo 13
    print(mod_inv(2), 2 * mod_inv(2) % MOD)     # 500000004 1
    print(inverses_upto(12, 13)[1:])            # [1, 7, 9, 10, 8, 11, 2, 5, 3, 4, 6, 12]
    print(iban_valid("GB82 WEST 1234 5698 7654 32"), iban_valid("GB82 WEST 1234 5698 7654 23"))   # True False
    print((3 - 5) % 7)                          # 5: Python's % is never negative`;

const cpp = `#include <cstdint>
#include <iostream>

const std::int64_t MOD = 1000000007;

// a^e mod m. Multiplying two values below m tops out near 10¹⁸, which int64 holds; a larger m needs 128-bit multiplication.
std::int64_t modPow(std::int64_t a, std::int64_t e, std::int64_t m = MOD) {
    a %= m;
    if (a < 0) a += m;                                  // C++'s % keeps the sign of the dividend
    std::int64_t result = 1 % m;
    while (e > 0) {
        if (e & 1) result = result * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return result;
}

// Prime modulus: Fermat's little theorem
std::int64_t modInv(std::int64_t a, std::int64_t p = MOD) { return modPow(a, p - 2, p); }

// Any modulus: extended Euclid, maintaining r = a·s (mod m). No inverse when gcd(a, m) ≠ 1, in which case it returns -1.
std::int64_t modInvGeneral(std::int64_t a, std::int64_t m) {
    std::int64_t r0 = ((a % m) + m) % m, r1 = m, s0 = 1, s1 = 0;
    while (r1 != 0) {
        std::int64_t q = r0 / r1, r2 = r0 - q * r1, s2 = s0 - q * s1;
        r0 = r1; r1 = r2; s0 = s1; s1 = s2;
    }
    if (r0 != 1) return -1;
    return ((s0 % m) + m) % m;
}

int main() {
    std::cout << modPow(5, 11, 13) << ' ' << modInv(5, 13) << '\\n';            // 8 8
    std::cout << modInvGeneral(5, 12) << ' ' << modInvGeneral(4, 12) << ' '
              << modPow(5, 10, 12) << '\\n';                                     // 5 -1 1: Fermat gives the wrong answer for a composite modulus

    // Probabilities are reported as a fraction P/Q under the modulus: two dice sum to 7 with probability 6/36
    std::cout << 6 * modInv(36) % MOD << ' ' << modInv(6) << '\\n';             // 166666668 166666668: 6/36 = 1/6

    std::cout << (3 - 5) % 7 << ' ' << ((3 - 5) % 7 + 7) % 7 << '\\n';          // -2 5: add the modulus back to a negative result

    // The exponent may be reduced mod p − 1 (Fermat), never mod p
    std::cout << modPow(3, (MOD - 1) + 5) << ' ' << modPow(3, 5) << '\\n';      // 243 243
}`;

export const skeleton: LessonSkeleton = {
  demo: <ModularDemo />,
  code: { python, cpp },
};
