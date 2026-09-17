import { EditDistanceDemo } from "@/components/lesson/demos/EditDistanceDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `def edit_table(a, b):
    """dp[i][j]: fewest insertions, deletions or replacements turning a's first i characters into b's first j"""
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i                               # into the empty string: i deletions
    for j in range(n + 1):
        dp[0][j] = j                               # out of the empty string: j insertions
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]        # last characters match, nothing to do
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1],   # replace a[i-1] → b[j-1]
                                   dp[i - 1][j],       # delete a[i-1]
                                   dp[i][j - 1])       # insert b[j-1]
    return dp


def edit_script(a, b):
    """Walk back from the bottom-right corner to recover the operations (ties: replace, then delete, then insert)"""
    dp = edit_table(a, b)
    i, j, ops = len(a), len(b), []
    while i > 0 or j > 0:
        if i > 0 and j > 0 and a[i - 1] == b[j - 1]:
            i, j = i - 1, j - 1                    # a match, so it costs no step
        elif i > 0 and j > 0 and dp[i][j] == dp[i - 1][j - 1] + 1:
            ops.append(f"replace {a[i - 1]}→{b[j - 1]}")
            i, j = i - 1, j - 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            ops.append(f"delete {a[i - 1]}")
            i -= 1
        else:
            ops.append(f"insert {b[j - 1]}")
            j -= 1
    return ops[::-1]


def edit_distance(a, b):
    """Distance only: roll a single row. The diagonal cur[j] needs is exactly prev[j-1]"""
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i] + [0] * len(b)
        for j, cb in enumerate(b, 1):
            cur[j] = prev[j - 1] if ca == cb else 1 + min(prev[j - 1], prev[j], cur[j - 1])
        prev = cur
    return prev[-1]


if __name__ == "__main__":
    print(edit_table("horse", "ros")[-1][-1], edit_script("horse", "ros"))
    # 3 ['replace h→r', 'delete r', 'delete e'] (the same as the demo)
    print(edit_distance("intention", "execution"), edit_distance("recieve", "receive"))   # 5 2
    words = ["the", "ten", "tea", "eh", "tech", "then"]
    print(sorted(words, key=lambda w: (edit_distance("teh", w), w)))
    # ['eh', 'tea', 'tech', 'ten', 'the', 'then']: "the" takes 2 steps, because swapping two characters counts as two replacements`;

const cpp = `#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>

// Distance only: roll one row and keep the diagonal in one extra variable, O(n) space
int editDistance(const std::string& a, const std::string& b) {
    int n = (int)b.size();
    std::vector<int> dp(n + 1);
    for (int j = 0; j <= n; j++) dp[j] = j;          // row 0: j insertions
    for (std::size_t i = 1; i <= a.size(); i++) {
        int diag = dp[0];                            // the diagonal, dp[i-1][0]
        dp[0] = (int)i;                              // column 0: i deletions
        for (int j = 1; j <= n; j++) {
            int up = dp[j];                          // before it is overwritten this is dp[i-1][j]
            dp[j] = a[i - 1] == b[j - 1] ? diag : 1 + std::min({diag, up, dp[j - 1]});
            diag = up;                               // the diagonal for the next cell
        }
    }
    return dp[n];
}

// Only candidates within distance k: compute the band |i − j| <= k, O(k·n)
bool withinK(const std::string& a, const std::string& b, int k) {
    int m = (int)a.size(), n = (int)b.size();
    if (std::abs(m - n) > k) return false;           // the lengths alone differ by more than k
    const int BIG = k + 1;
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, BIG));
    for (int i = 0; i <= std::min(m, k); i++) dp[i][0] = i;
    for (int j = 0; j <= std::min(n, k); j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = std::max(1, i - k); j <= std::min(n, i + k); j++)
            dp[i][j] = std::min(BIG, a[i - 1] == b[j - 1] ? dp[i - 1][j - 1]
                                     : 1 + std::min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]}));
    return dp[m][n] <= k;
}

int main() {
    std::cout << editDistance("horse", "ros") << ' ' << editDistance("intention", "execution") << '\\n';   // 3 5
    std::cout << withinK("kitten", "sitting", 2) << ' ' << withinK("kitten", "sitting", 3) << '\\n';     // 0 1
}`;

export const skeleton: LessonSkeleton = {
  demo: <EditDistanceDemo />,
  code: { python, cpp },
};
