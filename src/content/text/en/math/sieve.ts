import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "GCD & LCM, arrays & dynamic arrays",
  applications: [
    {
      title: "Screening candidates before an RSA key is generated",
      problem:
        "Generating a 2048-bit RSA key means drawing large odd numbers at random and testing each one for primality. Every run of a probabilistic primality test costs a modular exponentiation over thousands of bits, which is expensive — and most of the odd numbers drawn at random turn out to have a tiny factor.",
      why: "Libraries such as OpenSSL ship a table of the first few thousand small primes. A candidate is trial-divided by those first, anything divisible is discarded on the spot, and only the survivors reach the expensive probabilistic test. That table of small primes is exactly what a sieve produces, and most candidates are eliminated at this gate, saving a great deal of wasted modular exponentiation.",
    },
    {
      title: "Factorising integers in bulk",
      problem:
        "An analytics job has to count the divisors of a million integers, none of them larger than 10⁷, and every one has to be factorised first. Trial-dividing up to √x costs more than three thousand divisions for a single bad number, which adds up to billions of operations in the worst case.",
      why: "Build a table of smallest prime factors, spf, with a linear sieve in O(N) time. After that, factorising x is just repeatedly dividing by spf[x], and since every step at least halves the number, one factorisation takes O(log x) steps. A table for a limit of 10⁷ costs about 40 MB as 32-bit integers, and buys you factorisations of twenty-odd steps each.",
    },
    {
      title: "Verifying the Goldbach conjecture up to 4 × 10¹⁸",
      problem:
        'Mathematicians want a computer to confirm that "every even number greater than 2 is the sum of two primes" holds over an enormous range, which means listing all the primes around 10¹⁸ segment by segment. Allocating an array of length 10¹⁸ is out of the question.',
      why: "A segmented sieve only needs the primes up to √R (below 10⁹), and then crosses off their multiples inside a window [L, R] a few million wide, so memory depends only on the size of the window. The verification project run by Oliveira e Silva and others uses exactly this segmented approach, sweeping the whole range one segment at a time.",
    },
  ],
  cue: "You need every prime below some limit, many primality queries, many prime factorisations (the smallest-prime-factor table), the primes inside a range [L, R], or a limit around 10⁷ where an array still fits in memory.",
  steps: [
    "Allocate a boolean array `is_prime` of length `N + 1`, set every entry to true, then set 0 and 1 to false.",
    "Walk p upwards from 2, continuing as long as `p² ≤ N`.",
    "If `is_prime[p]` is still true, p is prime: set `p², p² + p, p² + 2p, …` to false at every position up to N. Otherwise move straight on to the next p.",
    "Stop once `p² > N`. Every position still true is a prime not exceeding N.",
    "For bulk factorisation, switch to a linear sieve that records the smallest prime factor. When the limit is too large for an array, sieve only up to `√R` and run a segmented sieve over `[L, R]`.",
  ],
  demoNote:
    "1 through 60, ten per row, with √60 ≈ 7.75. Blue is the prime p just confirmed, yellow are the multiples crossed off in this step, a yellow dashed cell is a number a smaller prime had already crossed off that this round visits again, grey with a strikethrough is composite, and green is a confirmed prime. p = 2 starts at 4 and crosses off all 29 even numbers; p = 3 starts at 9, since its smaller multiple 6 was already taken by 2, visiting 18 numbers and crossing off 9 new ones; p = 5 starts at 25 and adds only 25, 35 and 55; p = 7 adds nothing but 49. The next number left standing is 11, but 11² = 121 > 60, so the sieve stops. The table underneath records how much work each prime did: 57 visits in total and 42 composites crossed off, 15 of those crossed off more than once, leaving the 17 primes below 60.",
  codeNote:
    "Python has the standard sieve (a slice crosses off a whole run of multiples at once), plus the linear sieve that records smallest prime factors and the table lookup that factorises with it. C++ has the plain sieve and a segmented one, demonstrated by finding the primes between 10¹² and 10¹² + 100: it sieves only up to √R = 10⁶, and the array is a mere 101 entries long.",
  problems: [
    { src: "LeetCode 204", name: "Count Primes", diff: "Medium" },
    { src: "LeetCode 2523", name: "Closest Prime Numbers in Range", diff: "Medium" },
    { src: "LeetCode 2521", name: "Distinct Prime Factors of Product of Array (factorise with the smallest-prime-factor table)", diff: "Medium" },
    { src: "LeetCode 3233", name: "Find the Count of Numbers Which Are Not Special (only the square of a prime has exactly two proper divisors)", diff: "Medium" },
    { src: "LeetCode 952", name: "Largest Component Size by Common Factor (factorise, then merge with union-find)", diff: "Hard" },
    { src: "LeetCode 2709", name: "Greatest Common Divisor Traversal", diff: "Hard" },
  ],
};
