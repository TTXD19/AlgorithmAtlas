import { LcsDemo } from "@/components/lesson/demos/LcsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `def lcs_table(a, b):
    """dp[i][j]: the LCS length of a's first i elements and b's first j. O(mn)"""
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # row 0 and column 0 are the empty sequence: all zeros
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1  # match: extend the LCS with both of them removed
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])   # differ: at least one of them is dropped
    return dp


def lcs_string(a, b):
    """Walk back from the bottom-right along the sources to rebuild one LCS (ties go left, as in the demo)"""
    dp = lcs_table(a, b)
    i, j, out = len(a), len(b), []
    while i > 0 and j > 0:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1])
            i, j = i - 1, j - 1
        elif dp[i][j - 1] >= dp[i - 1][j]:
            j -= 1
        else:
            i -= 1
    return "".join(reversed(out))


def diff(old, new):
    """Line by line: lines in the LCS are unchanged, the rest are deletions (-) or additions (+)"""
    dp = lcs_table(old, new)
    i, j, out = len(old), len(new), []
    while i > 0 or j > 0:
        if i > 0 and j > 0 and old[i - 1] == new[j - 1]:
            out.append("  " + old[i - 1]); i -= 1; j -= 1
        elif j > 0 and (i == 0 or dp[i][j - 1] >= dp[i - 1][j]):
            out.append("+ " + new[j - 1]); j -= 1
        else:
            out.append("- " + old[i - 1]); i -= 1
    return out[::-1]


if __name__ == "__main__":
    print(lcs_table("PYTHON", "TYPHOON")[-1][-1], lcs_string("PYTHON", "TYPHOON"))   # 4 THON
    old = ["import os", "x = 1", "print(x)", "return x"]
    new = ["import os", "import sys", "x = 2", "print(x)", "return x"]
    print("\\n".join(diff(old, new)))
    #   import os
    # - x = 1
    # + import sys
    # + x = 2
    #   print(x)
    #   return x`;

const cpp = `#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

// The full 2-D table: you need it to rebuild the LCS string
std::string lcsString(const std::string& a, const std::string& b) {
    int m = (int)a.size(), n = (int)b.size();
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] + 1
                                             : std::max(dp[i - 1][j], dp[i][j - 1]);
    std::string out;
    for (int i = m, j = n; i > 0 && j > 0;) {       // walk back from the bottom-right
        if (a[i - 1] == b[j - 1]) { out += a[i - 1]; i--; j--; }
        else if (dp[i][j - 1] >= dp[i - 1][j]) j--;
        else i--;
    }
    std::reverse(out.begin(), out.end());
    return out;
}

// Length only: each row depends on the one above, so roll two rows, O(min(m, n)) space
int lcsLength(std::string a, std::string b) {
    if (a.size() < b.size()) std::swap(a, b);       // make b the shorter one
    std::vector<int> prev(b.size() + 1, 0), cur(b.size() + 1, 0);
    for (char ch : a) {
        for (std::size_t j = 1; j <= b.size(); j++)
            cur[j] = ch == b[j - 1] ? prev[j - 1] + 1 : std::max(prev[j], cur[j - 1]);
        std::swap(prev, cur);
    }
    return prev[b.size()];
}

int main() {
    std::cout << lcsString("PYTHON", "TYPHOON") << ' ' << lcsLength("PYTHON", "TYPHOON") << '\\n';   // THON 4
    std::cout << lcsString("ABCBDAB", "BDCABA") << ' ' << lcsLength("ABCBDAB", "BDCABA") << '\\n';   // BDAB 4
}`;

export const skeleton: LessonSkeleton = {
  demo: <LcsDemo />,
  code: { python, cpp },
};
