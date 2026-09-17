import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion, the Master Theorem",
  applications: [
    {
      title: "The RSA step in an HTTPS handshake",
      problem:
        "A server signs with a 2048-bit RSA key, which means computing m^d mod N where d is itself a 2048-bit number. Multiplying one factor at a time takes roughly 2²⁰⁴⁸ multiplications — the age of the universe is not enough.",
      why: "Write d in binary and scan from the low bit up: square the base at every bit, multiply it into the answer wherever the bit is 1, and reduce after each multiplication so the numbers stay 2048 bits wide. That is about 2048 squarings plus a thousand-odd multiplications, and a signature completes in milliseconds.",
    },
    {
      title: "Term 10¹⁸ of a linear recurrence",
      problem:
        "The answer to some counting problem satisfies F(n) = F(n−1) + F(n−2), and the question asks for term 10¹⁸ modulo 10⁹+7. Even at a billion terms per second, walking the recurrence forward takes over thirty years.",
      why: "One step of the recurrence is multiplication by the matrix [[1, 1], [1, 0]], so term n is that matrix raised to the n-th power. Matrix multiplication is associative too, so fast exponentiation applies unchanged: log₂ 10¹⁸ ≈ 60, giving about 60 squarings plus at most 60 multiplications of 2×2 matrices. It finishes instantly.",
    },
    {
      title: "Default probability of a credit rating 30 years out",
      problem:
        "A bank has a transition matrix for \"this year's rating becomes what next year\", and wants the probability that a bond rated A today ends up in default 30 years from now.",
      why: "The distribution 30 years out is the transition matrix to the 30th power. Since 30 = 11110₂, that is 4 squarings and 4 multiplications instead of 29 multiplications in a row. With k states each matrix multiplication costs O(k³), so fast exponentiation brings the total down to O(k³ log n).",
    },
  ],
  cue: "x to the n-th power, a huge n (10⁹, 10¹⁸), an answer taken modulo something, RSA and modular exponentiation, term n of a linear recurrence, a matrix to the n-th power, applying the same operation n times, needing O(log n) multiplications.",
  steps: [
    "Initialise `result = 1 % mod` and `base = x % mod`.",
    "While `n > 0`: if `n & 1` is 1, set `result = result × base % mod`.",
    "Set `base = base × base % mod` and `n >>= 1`, then go back to the previous step. Each round handles one bit of n.",
    "When n reaches 0, `result` is the answer. The recursive form instead computes `half = power(x, n // 2)` and returns `half²` or `half² × x` — the half is computed exactly once.",
    "To switch to matrices, or any other associative operation, replace 1 with the identity element and multiplication with that operation. Nothing else changes.",
  ],
  demoNote:
    "The base is fixed at 3 and you can switch the exponent between 13, 25 and 100. The exponent's binary form is on top with the low bit on the right, and the row above it labels each bit's weight. Bits are handled one at a time from low to high: blue is the bit being processed, and a processed bit turns green if it was a 1. The table records base (that is, 3 raised to 2ⁱ) and result at each bit, with every multiplication taken modulo 10⁹+7. The two bars on the right compare multiplication counts: exponent 13 takes 6, 25 takes 7, and 100 takes only 9, against 12, 24 and 99 for multiplying one factor at a time.",
  codeNote:
    "Python has the recursive version, the iterative modular power, and the same loop applied to 2×2 matrices to reach term 10¹⁸ of the Fibonacci sequence. C++ has the modular power, the LeetCode 50 version that handles floating point and negative exponents (watch `INT_MIN`), and matrix exponentiation. All three loops look identical; the only difference is what \"1\" and \"multiply\" mean.",
  problems: [
    { src: "LeetCode 509", name: "Fibonacci Number (get to O(log n) with matrix exponentiation)", diff: "Easy" },
    { src: "LeetCode 50", name: "Pow(x, n) (negative exponents and INT_MIN)", diff: "Medium" },
    { src: "LeetCode 1922", name: "Count Good Numbers (n up to 10¹⁵; the answer is two modular powers multiplied)", diff: "Medium" },
    { src: "LeetCode 372", name: "Super Pow (the exponent arrives as a very long array of decimal digits)", diff: "Medium" },
    { src: "LeetCode 1969", name: "Minimum Non-Zero Product of the Array Elements (derive the formula first, then use a modular power)", diff: "Medium" },
  ],
};
