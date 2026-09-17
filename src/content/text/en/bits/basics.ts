import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Big-O notation",
  applications: [
    {
      title: "Unix file permissions: chmod 754",
      problem:
        "Every file records whether the owner, the group and everyone else may read, write and execute it — nine yes/no questions. chmod 754 means rwx for the owner, r-x for the group and r-- for everyone else, and the system rechecks it on every open.",
      why: "Read, write and execute take one bit each (4, 2 and 1), three bits per identity, so all nine permissions fit in a single integer — and 754 is just those three groups written in octal. Asking \"can the group write?\" is (mode >> 3) & 2: one shift and one AND. Granting a permission is an OR and revoking one is an AND NOT, and neither touches the other identities' settings.",
    },
    {
      title: "GPIO registers in firmware",
      problem:
        "PORTB on an Arduino Uno is an 8-bit register whose bits 0 to 5 map to pins D8 to D13. You want to light the LED on D13 (bit 5), but the other pins are driving a motor and reading sensors and must not change.",
      why: "A register can only be read and written whole. PORTB |= 1 << 5 sets bit 5 and nothing else; PORTB &= ~(1 << 5) clears it and nothing else. Those two lines are the core of Arduino's digitalWrite, and device drivers are full of them.",
    },
    {
      title: "Image processing: one pixel packed into one integer",
      problem:
        "A 4K image has 3840 × 2160 ≈ 8.29 million pixels, each with an A, R, G and B channel in the range 0–255. A filter has to darken the green channel pixel by pixel, and storing the four channels as four separate ints costs 16 bytes per pixel.",
      why: "Eight bits per channel packed into one 32-bit integer, 0xAARRGGBB, costs 4 bytes per pixel — a quarter of the memory, and far kinder to the CPU cache. Reading green is (c >> 8) & 0xFF; writing it back means clearing those 8 bits with an AND and ORing the new value in. Shift plus mask is the general recipe for reading and writing a stretch of bits.",
    },
  ],
  cue: "Flags, switches, permissions, masks, registers, packing things into one integer, changing one bit without touching the rest, one bit per fact, multiplying or dividing by powers of two.",
  steps: [
    "Decide the bit layout: bit 0 is the lowest. Give each boolean a position, and each multi-bit field a start `lo` and a width `w`. Write them as named constants, such as `READ = 1 << 2`.",
    "Build the mask: a single bit is `1 << i`; w consecutive bits are `((1 << w) − 1) << lo`; combine several flags with OR, as in `READ | WRITE`.",
    "Query with AND: `(x >> i) & 1` gives 0 or 1; `(x & mask) != 0` means **at least one** bit in the mask is set, while `(x & mask) == mask` means **all** of them are; read a field with `(x >> lo) & ((1 << w) − 1)`.",
    "Modify: set with `x |= mask`, clear with `x &= ~mask`, flip with `x ^= mask`. Writing a field means clearing before writing: `x = (x & ~mask) | (v << lo)`, where v must be less than `2^w` or truncated first.",
    "Check widths and types: in C++ use unsigned types, write constants as `1u` or `1ull`, and keep the shift amount below the width; in Python, apply your own `& ((1 << w) − 1)` when you need a fixed width. Always parenthesise when mixing these with comparisons.",
  ],
  demoNote:
    "A = 178 (10110010) and B = 108 (01101100). Click any cell of A or B to flip that bit, and the AND, OR, XOR, NOT and shift rows below update immediately; in the input rows blue means 1, and in the result rows green means 1 and grey means 0. The top bit of the default A is 1, so A << 1 pushes it out past the eighth bit. The bottom section highlights the selected bit i in yellow: bit 3 is 0 by default, so setting it matches flipping it and clearing it changes nothing. Select bit 1 instead, where A holds a 1, and you can watch clearing and flipping both turn it into 0.",
  codeNote:
    "The four basic functions — get, set, clear and flip a bit — plus reading and writing a multi-bit field. The examples use the same A and B as the interactive demo, then show real uses: Unix permission 754, a GPIO register and an RGB colour code. Python integers have no fixed width, so there is also 32-bit truncation and two's-complement conversion; the C++ version sticks to unsigned types and spells out the precedence and overflow traps in the code itself.",
  problems: [
    { src: "LeetCode 190", name: "Reverse Bits (read one bit out, write one bit in)", diff: "Easy" },
    { src: "LeetCode 1009", name: "Complement of Base 10 Integer (NOT needs a mask; mind the zero case)", diff: "Easy" },
    { src: "LeetCode 405", name: "Convert a Number to Hexadecimal (take four bits at a time; negatives use two's complement)", diff: "Easy" },
    { src: "LeetCode 1318", name: "Minimum Flips to Make a OR b Equal to c (compare bit by bit)", diff: "Medium" },
    { src: "LeetCode 318", name: "Maximum Product of Word Lengths (a 26-bit integer as a set of letters)", diff: "Medium" },
    { src: "LeetCode 371", name: "Sum of Two Integers (addition without the plus sign)", diff: "Medium" },
  ],
};
