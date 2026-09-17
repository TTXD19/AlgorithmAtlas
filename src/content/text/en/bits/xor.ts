import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Bitwise Basics",
  applications: [
    {
      title: "RAID 5: a drive dies and the data survives",
      problem:
        "A server runs RAID 5 across four 8 TB drives. Every stripe stores three data blocks D1, D2 and D3 plus one parity block P. Drive 2 fails one day, and once a replacement is installed its 8 TB of contents has to be reconstructed from the other three.",
      why: "Each write already computed P = D1 ^ D2 ^ D3. With D2 gone, XOR everything that remains: D1 ^ D3 ^ P. D1 and D3 each appear twice and cancel out, and what is left is exactly D2. This is the same operation as finding the odd one out, with a whole block in place of each number, applied byte by byte — and it needs no extra bookkeeping whatsoever.",
    },
    {
      title: "A gateway with 8 KB of memory finds the dropped packet",
      problem:
        "A microcontroller expects packets numbered 0 through 99,999 in every batch. Exactly 99,999 arrive, out of order. It has to report which sequence number went missing so the sender can retransmit it.",
      why: "Even a bitset recording which numbers showed up would need 12.5 KB, which does not fit. Keep a single integer instead and XOR as you go: fold in every sequence number from 0 to 99,999 that should arrive, then fold in each one that actually does. Everything that appears twice cancels, and the missing one is left. Summing works too, but the total is around five billion, past the range of a 32-bit integer; an XOR never produces more bits than the largest sequence number already has.",
    },
    {
      title: "Stream ciphers: one operation both encrypts and decrypts",
      problem:
        "A streaming service ships a 2 GB video with AES-CTR: the key generates a pseudorandom byte stream (the keystream) as long as the video, and the two are combined byte by byte. The player has to recover the original, and has to be able to start decoding straight from the 1.5 GB mark.",
      why: "Ciphertext = plaintext ^ keystream, and decryption XORs the same keystream in again: plaintext ^ keystream ^ keystream = plaintext. Encryption and decryption are one piece of code, and every byte is independent, so the work parallelises and can start at any offset. The flip side explains why a keystream must never be reused: XOR two ciphertexts together, the keystream cancels, and you are handed the XOR of the two plaintexts.",
    },
  ],
  cue: "Everything pairs up except one, two lists differ by a single entry, one number missing from 0 to n, appears an odd number of times, O(1) extra space required, parity checks, one operation that both encrypts and decrypts, swapping without a temporary.",
  steps: [
    'Restate the problem in terms of **parity**: "the answer appears an odd number of times, every other value appears an even number of times". Everything pairing up except one, two lists differing by a single element, and a gap in `0..n` all rewrite this way.',
    "Start with `acc = 0` and fold in every relevant value with `acc ^= x`. For missing-number problems, feed in what should be there as well: XOR each index `0..n-1` and `n` exactly once.",
    "When the scan finishes, `acc` is the answer. No sorting, no record of what you have already seen, and neither the input order nor the sign of the values changes the result.",
    "With two unpaired values, `acc` comes out as `a ^ b`. Take `low = acc & -acc`, scan again XORing only the values where `x & low` is non-zero, and that gives you one of them, `a`; the other is `acc ^ a`.",
    "For repeated range-XOR queries, build the prefix `P[i+1] = P[i] ^ nums[i]`; the answer for `[l, r]` is `P[r+1] ^ P[l]`. In C++, parenthesise any XOR or AND that shares an expression with a comparison operator.",
  ],
  demoNote:
    "The first half is Single Number: `nums = [5, 3, 9, 3, 5, 12, 9]`. Each step XORs one value into `acc`, and the rows underneath show the acc before the step, the value, and the result in 4-bit binary. In the array on top, blue is the value being processed, amber marks values already XORed in that are still waiting for their partner, and grey marks a pair that has cancelled. Notice what happens the second time a value appears: it flips back exactly the bits it flipped the first time, as if it had never arrived at all. After all seven values, only 12 remains. The second half runs the three-line XOR swap with `a = 5` and `b = 9`; blue is the line executing, finished lines turn grey, and the variable just overwritten is highlighted in amber, so you can watch the intermediate `a ^ b = 12` hold both numbers at once.",
  codeNote:
    "Three functions: Single Number itself, Missing Number pairing each index against its value, and the two-unpaired-values version that splits on the lowest set bit — then a demonstration of the XOR swap. The C++ swap first checks whether the two references point at the same variable, and it switches to `unsigned` when isolating the lowest set bit to sidestep the overflow of negating `INT_MIN`.",
  problems: [
    { src: "LeetCode 136", name: "Single Number", diff: "Easy" },
    { src: "LeetCode 268", name: "Missing Number (XOR the indices and the values together)", diff: "Easy" },
    { src: "LeetCode 389", name: "Find the Difference (characters XOR too)", diff: "Easy" },
    { src: "LeetCode 1310", name: "XOR Queries of a Subarray (prefix XOR)", diff: "Medium" },
    { src: "LeetCode 260", name: "Single Number III (split on the lowest set bit)", diff: "Medium" },
    { src: "LeetCode 137", name: "Single Number II (XOR fails at three copies; count bits instead)", diff: "Medium" },
  ],
};
