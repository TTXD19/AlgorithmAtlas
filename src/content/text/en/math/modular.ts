import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Fast exponentiation, GCD & LCM",
  applications: [
    {
      title: "The Diffie–Hellman key exchange behind HTTPS",
      problem:
        "A browser and a server have to agree on a shared key over a network anyone can listen in on. Each side picks a 2048-bit secret, a and b, and the only things exchanged in the open are g^a and g^b. Written out in full, those values are a 2048-bit number raised to a 2048-bit power — there are not enough atoms in the universe to write one down.",
      why: "Every operation happens modulo a 2048-bit prime p. Fast exponentiation computes g^a mod p while reducing at every step, so nothing ever exceeds p and the whole thing takes a couple of thousand modular multiplications. Each side then computes (g^b)^a mod p and arrives at the same g^(ab) mod p. An eavesdropper holds only g^a and g^b, and recovering a from those is the discrete logarithm problem — the hard part.",
    },
    {
      title: "The check digits on an IBAN",
      problem:
        "An IBAN for an international transfer runs to thirty-odd characters, and one wrong digit sends the money to somebody else's account. The system has to validate the format before submitting, and the IBAN rule is this: move the first four characters to the end, replace letters with two-digit numbers, and the resulting thirty-plus-digit integer must leave a remainder of 1 when divided by 97. That integer passed 64 bits long ago.",
      why: "Taking a modulus distributes over addition and multiplication, so you never have to assemble the big integer. Read left to right, multiply the running remainder by 10, add the new digit, and reduce mod 97 immediately — the remainder stays below 97 throughout. Because 97 is prime, any single mistyped digit, or any two adjacent digits swapped, changes the remainder and is caught for certain.",
    },
    {
      title: "Splitting a master key across several executives",
      problem:
        "A company's master key cannot sit with any one person. It has to be split into 5 shares, one per executive, so that any 3 of them together can reconstruct it while any 2 of them learn absolutely nothing.",
      why: "Shamir's secret sharing treats the key as the constant term of a quadratic polynomial and hands each executive one point on that polynomial, with every operation taken modulo a large prime. Three points reconstruct the polynomial by Lagrange interpolation, and the formula involves division — which under a modulus means multiplying by an inverse. Since the modulus is prime, every non-zero value has one, computable with Fermat's little theorem and fast exponentiation.",
    },
  ],
  cue: "The answer is huge and must be reported mod 10⁹+7, intermediate values would overflow, the remainder of a big integer, division under a modulus (fractions, probabilities, expected values), a^b mod m with a huge exponent, modular inverses, cryptography and check digits.",
  steps: [
    "Fix a modulus m and reduce immediately after every addition, subtraction and multiplication, so intermediate values stay below m. Before multiplying, check that `(m − 1)²` fits in the integer type you are using.",
    "Write subtraction as `(a − b + m) mod m`, and pull any value that might be negative back into 0 to m − 1 with `((x mod m) + m) mod m`.",
    "When you need to divide by b: first confirm `gcd(b, m) = 1`, then replace \"divide by b\" with \"multiply by the inverse of b\".",
    "For a prime modulus p, the inverse is `b^(p−2) mod p`, computed by fast exponentiation. For a composite modulus, use the extended Euclidean algorithm.",
    "When you need every inverse from 1 to n, work upward with `inv[i] = (p − ⌊p/i⌋) · inv[p mod i] mod p` and finish in O(n).",
  ],
  demoNote:
    "Finding the inverse of 5 modulo 13. The first stage multiplies k = 1 through 12 by 5 and takes the remainder: blue is the current step, and the green row below marks the remainders seen so far. At k = 8 the remainder is 1, and yellow marks 8 as the inverse of 5. After all 12 multiplications each remainder has appeared exactly once, which is the observation Fermat's little theorem rests on, giving 5⁻¹ ≡ 5¹¹. The second stage computes 5¹¹ mod 13 by fast exponentiation: 11 is 1011 in binary, and the table follows base and result bit by bit until result = 8 after four rounds, matching what the search found; that value then gives 7 / 5 ≡ 4. The last stage switches to the composite modulus 12: with a = 4 the remainders are only 0, 4 and 8, so 1 never appears and no inverse exists; with a = 5 an inverse does exist (it is 5), but applying Fermat's formula blindly returns 1, and the yellow outline marks that error.",
  codeNote:
    "Python covers fast exponentiation, inverses via Fermat's little theorem, all inverses from 1 to n in O(n), and the IBAN check that reduces as it reads. C++ covers fast exponentiation plus both the Fermat and extended-Euclid inverses, and demonstrates three situations you will meet: reporting a probability as a fraction under the modulus, the remainder of a negative number, and reducing an exponent mod p − 1.",
  problems: [
    { src: "LeetCode 1497", name: "Check If Array Pairs Are Divisible by k (pull negative remainders back into range first)", diff: "Medium" },
    { src: "LeetCode 1015", name: "Smallest Integer Divisible by K (track the remainder, never the whole number)", diff: "Medium" },
    { src: "LeetCode 2550", name: "Count Collisions of Monkeys on a Polygon (2ⁿ − 2 under a modulus; add it back after subtracting)", diff: "Medium" },
    { src: "LeetCode 2961", name: "Double Modular Exponentiation", diff: "Medium" },
    { src: "LeetCode 1808", name: "Maximize Number of Nice Divisors (split into powers of 3, then fast exponentiation)", diff: "Hard" },
    { src: "LeetCode 1622", name: "Fancy Sequence (undoing a global multiply needs a modular inverse)", diff: "Hard" },
  ],
};
