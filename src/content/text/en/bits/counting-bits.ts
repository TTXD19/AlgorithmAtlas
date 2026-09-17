import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Bitwise Basics, XOR Tricks",
  applications: [
    {
      title: "Turning a subnet mask into a CIDR prefix length",
      problem:
        "The firewall config says 255.255.255.192, but the routing table wants /26. You need to convert the mask into a prefix length, work out that the block holds 2⁶ = 64 addresses, and reject invalid masks such as 255.255.0.255 where the 1 bits are not contiguous.",
      why: "The mask is nothing but the 32-bit integer 0xFFFFFFC0, and the prefix length is the number of 1s in it. Counting the other way round is faster: invert it to get 0x3F, which has only 6 ones, so Kernighan's loop runs 6 times and 32 − 6 = 26. A valid mask always inverts to 2ᵏ − 1, which a single h & (h + 1) == 0 verifies — the same borrowing trick as n & (n − 1).",
    },
    {
      title: 'The "similar photos" feature in a photo library',
      problem:
        "Every photo gets a 64-bit perceptual hash (pHash), and the more alike two images are, the fewer bits differ between their hashes. A user uploads a new photo and it has to be checked against 500,000 hashes in the library to find any that differ by 10 bits or fewer.",
      why: '"How many bits differ" is the Hamming distance: XOR the two hashes so the differing bits become 1s, then count the 1s. Each comparison is one XOR plus one popcount, a single instruction each on a modern CPU, so 500,000 comparisons finish in a few milliseconds without decoding an image or touching a pixel.',
    },
    {
      title: "Counting daily active users with a bitmap",
      problem:
        "The app has 30 million users, each with a numeric ID. You want to know how many logged in today, and how many logged in both yesterday and today. Keeping each day's IDs in a hash set costs hundreds of megabytes on a day with ten million logins, and you have to hold several days at once to compare them.",
      why: "Give each user one bit and 30 million of them fit in 3.75 MB — exactly what Redis SETBIT and BITCOUNT do. Today's active count is the number of 1s in the whole bitmap, and the number of users present on both days is the two bitmaps ANDed together 64 bits at a time and then popcounted. Population count is the core operation behind this kind of statistic.",
    },
  ],
  cue: "Count the 1s, popcount, set bits, Hamming distance, how many bits differ, n & (n − 1), clear the lowest set bit, powers of two, the bit count of every value from 0 to n.",
  steps: [
    "Settle the width and the sign first: when the input can be negative, mask with `n &= 0xFFFFFFFF` in Python or switch to `std::uint32_t` in C++, or the loop will never end.",
    "`count = 0`; `while n != 0`: `n &= n - 1` (clear the lowest set bit), `count += 1`. When the loop ends, count is the number of 1s.",
    "To find how many bits two numbers differ in (the Hamming distance), compute `x = a ^ b` and run step 2 on x.",
    "For the answer for every value from 0 to n: allocate `bits = [0] * (n + 1)` and fill i from 1 to n with `bits[i] = bits[i & (i - 1)] + 1`, O(1) per cell.",
    "For the total Hamming distance over every pair: at each bit position, count the c numbers that have a 1 there and add c × (n − c). Do not pair the numbers up.",
    "In production code, call the built-in (`bit_count()`, `__builtin_popcount`, `std::bitset::count`); to test for a power of two write `n > 0 and n & (n - 1) == 0`, and remember the parentheses in C++.",
  ],
  demoNote:
    'n = 181 = 10110101₂, five 1s among eight bits. The first half is Brian Kernighan: each step stacks the three rows n, n − 1 and n & (n − 1), with yellow marking the position of the lowest set bit this round will clear, and green in the n − 1 row marking the bits below it that the borrow turned into 1s (181 is odd, so the first step shows no green yet). The second half is the bit-by-bit scan: in the "original n" row, the bit under inspection is green when it is 1 and yellow when it is 0, and bits already checked turn grey. The counter below always shows count and the number of iterations so far, and at the end the two totals are compared: 5 for Kernighan, 8 for the bit-by-bit scan.',
  codeNote:
    "The bit-by-bit version and Kernighan sit side by side for comparison, followed by two extensions: filling the whole table from 0 to n in O(n) with `bits[i & (i - 1)] + 1` (LeetCode 338), and totalling the Hamming distance over every pair by counting per bit (LeetCode 477). The examples in main cover subnet masks, negative numbers and powers of two, and the built-in functions come at the end.",
  problems: [
    { src: "LeetCode 191", name: "Number of 1 Bits (the archetypal Kernighan problem)", diff: "Easy" },
    { src: "LeetCode 461", name: "Hamming Distance (XOR first, then count the 1s)", diff: "Easy" },
    { src: "LeetCode 231", name: "Power of Two (n & (n − 1) == 0)", diff: "Easy" },
    { src: "LeetCode 338", name: "Counting Bits (the O(n) recurrence)", diff: "Easy" },
    { src: "LeetCode 477", name: "Total Hamming Distance (count per bit)", diff: "Medium" },
    { src: "LeetCode 2429", name: "Minimize XOR (with the number of 1s fixed, greedily choose where they go)", diff: "Medium" },
  ],
};
