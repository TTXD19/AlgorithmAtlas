import { BitwiseBasicsDemo } from "@/components/lesson/demos/BitwiseBasicsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Bit numbering: bit 0 is the lowest (rightmost) bit, and bit i stands for 2 to the power i
def get_bit(x, i):
    return (x >> i) & 1                  # shift right by i, then read the lowest bit


def set_bit(x, i):
    return x | (1 << i)                  # OR: force bit i to 1


def clear_bit(x, i):
    return x & ~(1 << i)                 # AND with a mask that is 0 only at bit i


def toggle_bit(x, i):
    return x ^ (1 << i)                  # XOR: bit i goes 0 -> 1 and 1 -> 0


# Multi-bit field: starts at bit lo and is w bits wide
def get_field(x, lo, w):
    return (x >> lo) & ((1 << w) - 1)    # (1 << w) - 1 is w ones


def set_field(x, lo, w, v):
    mask = ((1 << w) - 1) << lo
    return (x & ~mask) | ((v << lo) & mask)   # clear that stretch first, then write


# Python ints have no fixed width, so truncate yourself when you need one
def to_u32(x):
    return x & 0xFFFFFFFF                # keep the low 32 bits and read them as unsigned


def to_i32(x):
    x &= 0xFFFFFFFF
    return x - (1 << 32) if x >> 31 else x    # bit 31 set means negative (two's complement)


R, W, X = 4, 2, 1                        # Unix permissions: read 100, write 010, execute 001

if __name__ == "__main__":
    a, b = 0b10110010, 0b01101100        # 178 and 108, the same pair as the demo
    print(a & b, a | b, a ^ b)           # 32 254 222
    print(~a & 0xFF, ~a)                 # 77 -179 (~a equals -a - 1, so mask it yourself)
    print((a << 1) & 0xFF, a >> 1)       # 100 89
    print(get_bit(a, 3), get_bit(a, 4))  # 0 1
    print(set_bit(a, 3), clear_bit(a, 4), toggle_bit(a, 1))   # 186 162 176

    mode = 0o754                         # rwxr-xr--: owner 7, group 5, others 4
    group = get_field(mode, 3, 3)
    print(group, (group & W) != 0)       # 5 False: the group cannot write
    mode = set_field(mode, 0, 3, R | W)  # give others rw-
    print(oct(mode))                     # 0o756

    color = 0xFF8800                     # 0xRRGGBB
    print(get_field(color, 8, 8))        # 136 (green channel 0x88)
    print(hex(set_field(color, 8, 8, 0x44)))   # 0xff4400

    print(-7 >> 1, to_u32(-1), to_i32(0xFFFFFFFE))   # -4 4294967295 -2`;

const cpp = `#include <bitset>
#include <cstdint>
#include <iostream>

// Always use unsigned types: signed overflow and shifting negatives are undefined or implementation-defined
using u32 = std::uint32_t;

constexpr u32 getBit(u32 x, int i) { return (x >> i) & 1u; }
constexpr u32 setBit(u32 x, int i) { return x | (1u << i); }
constexpr u32 clearBit(u32 x, int i) { return x & ~(1u << i); }
constexpr u32 toggleBit(u32 x, int i) { return x ^ (1u << i); }

// Multi-bit field: starts at bit lo, w bits wide (w must be under 32; shifting by >= the width is undefined)
constexpr u32 getField(u32 x, int lo, int w) {
    return (x >> lo) & ((1u << w) - 1);
}
constexpr u32 setField(u32 x, int lo, int w, u32 v) {
    u32 mask = ((1u << w) - 1) << lo;
    return (x & ~mask) | ((v << lo) & mask);
}

enum Perm : u32 { X = 1, W = 2, R = 4 };    // the three Unix permission bits

int main() {
    u32 a = 0b10110010, b = 0b01101100;     // 178 and 108
    std::cout << (a & b) << ' ' << (a | b) << ' ' << (a ^ b) << "\\n";  // 32 254 222
    std::cout << (~a & 0xFF) << ' ' << std::bitset<8>(a << 1) << "\\n"; // 77 01100100
    std::cout << getBit(a, 3) << ' ' << getBit(a, 4) << "\\n";         // 0 1
    std::cout << setBit(a, 3) << ' ' << clearBit(a, 4) << ' ' << toggleBit(a, 1) << "\\n";  // 186 162 176

    // Hardware register: change one pin and leave every other bit alone
    std::uint8_t port = 0b00000101;         // LEDs 0 and 2 are on
    port |= 1u << 3;                        // turn LED 3 on
    port &= ~(1u << 0);                     // turn LED 0 off
    port ^= 1u << 7;                        // toggle LED 7
    std::cout << std::bitset<8>(port) << "\\n";                        // 10001100

    u32 mode = 0754;                        // octal: rwxr-xr--
    std::cout << getField(mode, 3, 3) << ' ' << ((getField(mode, 3, 3) & W) != 0) << "\\n";  // 5 0
    mode = setField(mode, 0, 3, R | W);     // give others rw-
    std::cout << std::oct << mode << std::dec << "\\n";                // 756

    // Pitfalls: 1 << 31 on an int turns negative, 1 << 40 is undefined behaviour — write 1ull << 40;
    // == binds tighter than &, so x & 1 == 0 really means x & (1 == 0). Always parenthesise.
    std::cout << (1ull << 40) << ' ' << ((a & 1) == 0) << "\\n";      // 1099511627776 1
}`;

export const skeleton: LessonSkeleton = {
  demo: <BitwiseBasicsDemo />,
  code: { python, cpp },
};
