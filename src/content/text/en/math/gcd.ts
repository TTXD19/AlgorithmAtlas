import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion",
  applications: [
    {
      title: "Audio resampling: 44.1 kHz to 48 kHz",
      problem:
        "A CD carries 44100 samples per second; video formats want 48000. A resampler interpolates up by a factor of L and decimates down by a factor of M, and L/M has to equal 48000/44100. Take L = 48000 literally and the polyphase filter needs 48000 phases.",
      why: "Reduce the ratio first: gcd(48000, 44100) = 300, so L/M = 160/147 and the filter needs only 160 phases. Four divisions of the Euclidean algorithm produce that 300, with no need to factor either number.",
    },
    {
      title: "Why a 120Hz display plays both 24 fps film and 30 fps video smoothly",
      problem:
        "Film runs at 24 frames per second and streaming video is often 30. On a 60Hz display, 24 fps frames have to alternate between 2 and 3 refreshes each, so playback speeds up and slows down and picks up a faint judder. You want a refresh rate that both frame rates divide evenly.",
      why: "What you want is the least common multiple of 24 and 30: lcm(24, 30) = 24 ÷ gcd(24, 30) × 30 = 24 ÷ 6 × 30 = 120. At 120Hz each 24 fps frame holds for exactly 5 refreshes and each 30 fps frame for exactly 4. Any scheduling question of the form \"when do these periods line up again\" is the same calculation.",
    },
    {
      title: "Generating an RSA private key",
      problem:
        "The textbook example: p = 61, q = 53, φ(n) = 60 × 52 = 3120, public exponent e = 17. The private exponent d has to satisfy 17 × d ≡ 1 (mod 3120). In a real key φ(n) is 2048 bits long, so trying d = 1, 2, 3, … never finishes.",
      why: "3120 is not prime, so Fermat's little theorem cannot supply the inverse directly. While computing gcd(17, 3120) = 1, the extended Euclidean algorithm also produces an integer solution of 17x + 3120y = 1, and x reduced mod 3120 is d = 2753. The number of steps depends only on the size of the smaller number: in practice e = 65537, so even a 2048-bit φ(n) takes about twenty divisions.",
    },
  ],
  cue: "Greatest common divisor, least common multiple, reducing a fraction, a common denominator, ratios, when two periods coincide again, divisibility, whether ax + by = c has integer solutions, an inverse when the modulus is not prime, the common divisor of a whole array.",
  steps: [
    "Take absolute values first. By convention `gcd(a, 0) = a`, so `gcd(0, 0) = 0`.",
    "`while b != 0`: `a, b = b, a % b`. When the loop ends, a is the greatest common divisor. There is no need to swap when a < b — the first round does it for you.",
    "Least common multiple: return 0 if either number is 0, otherwise return `a // gcd(a, b) * b`, dividing before multiplying. For more than two numbers, fold gcd or lcm left to right.",
    "Extended version: when `b == 0`, return `(a, 1, 0)`; otherwise recurse to get `(g, x′, y′)` and return `(g, y′, x′ − (a // b)·y′)`. The iterative version keeps `r = a·s + b·t` true on every row, advancing r, s and t by the same \"row before last − q × last row\" rule.",
    "Applications: to solve `ax + by = c`, first check `c % g == 0`; when it is solvable, multiply x and y by `c / g`. For the inverse of a modulo m, confirm `g == 1` and take `x % m` (pulled back into 0 to m − 1).",
  ],
  demoNote:
    'Using 252 and 105, in two stages. The first is the Euclidean algorithm: on the left, each line spells out "dividend = quotient × divisor + remainder", with the remainder in yellow because it becomes the next line\'s divisor; on the right, a table of the remainder sequence r and the quotients q. Blue marks the current step. After three divisions the remainder hits 0, the previous remainder 21 turns green, and lcm = 1260 falls out along the way. The second stage is extended Euclid: the table gains columns s and t, and every row satisfies r = 252·s + 105·t. Notice that s and t follow the same "row before last minus q times the last row" rule as r, and the final green row gives x = −2 and y = 5.',
  codeNote:
    "gcd, lcm, extended Euclid, and the modular inverse built on it. The Python extended version is recursive and lines up step for step with the substitution above; the C++ one is iterative — exactly the r, s, t table from the demo — and uses no call stack. Both end by showing how to fold over several numbers, and the versions the standard library already provides.",
  problems: [
    { src: "LeetCode 1979", name: "Find Greatest Common Divisor of Array", diff: "Easy" },
    { src: "LeetCode 1071", name: "Greatest Common Divisor of Strings (the Euclidean algorithm on strings)", diff: "Easy" },
    { src: "LeetCode 914", name: "X of a Kind in a Deck of Cards (gcd of all the counts)", diff: "Easy" },
    { src: "LeetCode 592", name: "Fraction Addition and Subtraction (common denominator, then reduce)", diff: "Medium" },
    { src: "LeetCode 365", name: "Water and Jug Problem (Bézout: measurable exactly when the gcd divides the target)", diff: "Medium" },
    { src: "LeetCode 878", name: "Nth Magical Number (lcm plus binary search on the answer)", diff: "Hard" },
  ],
};
