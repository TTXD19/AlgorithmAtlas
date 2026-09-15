import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { NQueensDemo } from "@/components/lesson/demos/NQueensDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# N 皇后（LeetCode 51）：逐列放置，三個集合記錄被攻擊的欄與對角線
def solve_n_queens(n):
    ans = []
    queens = []                  # queens[r] = 第 r 列皇后所在的欄
    cols = set()                 # 被佔用的欄
    diag1 = set()                # r - c 相同的格子在同一條「\\」對角線
    diag2 = set()                # r + c 相同的格子在同一條「/」對角線

    def dfs(r):
        if r == n:               # 每一列都放好了
            ans.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
            return
        for c in range(n):
            if c in cols or (r - c) in diag1 or (r + c) in diag2:
                continue         # 被攻擊，剪掉
            queens.append(c)     # 做選擇
            cols.add(c); diag1.add(r - c); diag2.add(r + c)
            dfs(r + 1)
            queens.pop()         # 撤銷選擇：三個集合都要復原
            cols.remove(c); diag1.remove(r - c); diag2.remove(r + c)

    dfs(0)
    return ans


# 只數解的數量（LeetCode 52）：用位元遮罩代替集合
# cols / d1 / d2 是 n 位元的整數，第 c 位為 1 代表這一列的欄 c 被攻擊
def total_n_queens(n):
    full = (1 << n) - 1

    def dfs(cols, d1, d2):
        if cols == full:                     # n 個欄都放了皇后
            return 1
        count = 0
        free = full & ~(cols | d1 | d2)      # 這一列還能放的位置
        while free:
            bit = free & -free               # 取最低的 1
            free ^= bit
            # 下一列：\\ 對角線往右一欄（<< 1），/ 對角線往左一欄（>> 1）
            count += dfs(cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1)
        return count

    return dfs(0, 0, 0)


if __name__ == "__main__":
    for row in solve_n_queens(4)[0]:
        print(row)                           # .Q.. / ...Q / Q... / ..Q.
    print(total_n_queens(8))                 # 92`;

const cpp = `#include <vector>
#include <string>
#include <unordered_set>

// N 皇后：逐列放置，三個集合記錄被攻擊的欄與對角線
class NQueens {
    int n;
    std::vector<int> queens;                 // queens[r] = 第 r 列皇后所在的欄
    std::unordered_set<int> cols, diag1, diag2;
    std::vector<std::vector<std::string>> ans;

    void dfs(int r) {
        if (r == n) {                        // 每一列都放好了
            std::vector<std::string> board(n, std::string(n, '.'));
            for (int i = 0; i < n; i++) board[i][queens[i]] = 'Q';
            ans.push_back(board);
            return;
        }
        for (int c = 0; c < n; c++) {
            if (cols.count(c) || diag1.count(r - c) || diag2.count(r + c)) continue;   // 被攻擊
            queens.push_back(c);             // 做選擇
            cols.insert(c); diag1.insert(r - c); diag2.insert(r + c);
            dfs(r + 1);
            queens.pop_back();               // 撤銷選擇：三個集合都要復原
            cols.erase(c); diag1.erase(r - c); diag2.erase(r + c);
        }
    }
public:
    std::vector<std::vector<std::string>> solve(int size) {
        n = size; ans.clear(); queens.clear();
        cols.clear(); diag1.clear(); diag2.clear();
        dfs(0);
        return ans;
    }
};

// 只數解的數量：位元遮罩，第 c 位為 1 代表這一列的欄 c 被攻擊
int countQueens(int cols, int d1, int d2, int full) {
    if (cols == full) return 1;              // n 個欄都放了皇后
    int count = 0;
    int free = full & ~(cols | d1 | d2);     // 這一列還能放的位置
    while (free) {
        int bit = free & -free;              // 取最低的 1
        free ^= bit;
        // 下一列：\\ 對角線往右一欄（<< 1），/ 對角線往左一欄（>> 1）
        count += countQueens(cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1, full);
    }
    return count;
}

int totalNQueens(int n) {
    return countQueens(0, 0, 0, (1 << n) - 1);   // full 的低 n 位全是 1
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "自動排課",
              problem: "每門課要選一個時段和教室，同一位老師不能同時上兩門課、同一間教室不能同時有兩班、某些課不能排在同一天。一百多門課，手排要花幾個星期。",
              why: "一次處理一門課，從可用的時段裡挑一個不衝突的，往下排下一門；全部時段都衝突就退回上一門課換一個時段。N 皇后是這種「約束滿足問題」最小的教科書版本：每一列放一個皇后，不能和已放的同欄、同對角線。",
            },
            {
              title: "值班表與座位安排",
              problem: "護理站每天要排三班，每個人有不能值的日子、連續值班的上限、和某些人不能同班的限制。要找出一份滿足所有規則的班表。",
              why: "逐格填、每填一格就檢查所有規則、違反就回頭改上一格，這正是回溯。關鍵在「檢查衝突要快」：N 皇后用三個集合把每次檢查壓到 O(1)，排班則用同樣的思路預先建立每個人、每一天的佔用表。",
            },
            {
              title: "數獨與填字遊戲的求解器",
              problem: "手機上的數獨 app 要能驗證任何一盤有解，還要能給提示。人腦解法是「填一格、看看有沒有矛盾、有就擦掉重填」。",
              why: "程式解法和人腦一模一樣：逐格嘗試 1 到 9，用列、欄、宮三組集合檢查衝突，走不通就回溯。數獨是 N 皇后的直接延伸，差別只在約束的形狀。",
            },
          ]}
          cue="不能衝突、每列每欄只能一個、排課排班、約束滿足、放置後要檢查、走不通就換上一步、數獨。"
        />
      </Section>

      <Section id="concept">
        <p>
          N 皇后要在 n×n 的棋盤放 n 個皇后，任兩個不能在同一列、同一欄或同一對角線。第一個洞見是<strong>一列恰好一個</strong>：既然不能同列而且要放 n 個，每列必定剛好一個，所以只要決定「第 r 列的皇后放在哪一欄」。搜尋空間從「任選 n 格」變成「每列選一欄」，一下子小很多。
        </p>
        <p>
          第二個洞見是<strong>衝突檢查要 O(1)</strong>。同欄的格子 c 相同；同一條「\」對角線的格子 r−c 相同；同一條「/」對角線的格子 r+c 相同。用三個集合記錄已放皇后的 c、r−c、r+c，判斷一格能不能放只要查三次。放皇后時把三個值加進去，<strong>撤銷時三個都要移除</strong>，漏掉一個之後的分支就會誤判。
        </p>
        <p>
          搜尋本身就是回溯的三步：對第 r 列的每一欄 c，被攻擊就跳過（<strong>剪枝</strong>），否則做選擇、遞迴到 r+1、撤銷。若第 r+1 列每一欄都被攻擊，遞迴會直接返回，這就是「回溯」的時刻：拿掉第 r 列的皇后，換下一欄。整個過程是一棵深度 n 的樹上的 DFS，每個節點的分支數是那一列還沒被攻擊的欄數。
        </p>
        <p>
          複雜度是<strong>指數</strong>的，粗略上界 O(n!)，剪枝後實際小得多；8 皇后有 92 組解，搜尋節點約兩千個。只數解不列出棋盤時，可以用<strong>位元遮罩</strong>取代集合：三個整數的第 c 位表示欄 c 是否被攻擊，換到下一列時「\」對角線整體左移一位、「/」對角線右移一位。這是 N 皇后最快的寫法，也是「用整數當集合」這個技巧的經典範例。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>準備 <Code>queens</Code>（每列的欄）和三個集合 <Code>cols</Code>、<Code>diag1</Code>（r−c）、<Code>diag2</Code>（r+c）。<Code>dfs(r)</Code> 表示「正在放第 r 列」。</>,
            <>終止條件：<Code>r == n</Code>，n 列都放好了，把 <Code>queens</Code> 轉成棋盤收進答案。</>,
            <>對每個欄 c：若 <Code>c in cols</Code> 或 <Code>r-c in diag1</Code> 或 <Code>r+c in diag2</Code>，被攻擊，跳過。</>,
            <>做選擇：<Code>queens.append(c)</Code>，三個集合各加一個值，遞迴 <Code>dfs(r + 1)</Code>。</>,
            <>撤銷選擇：<Code>queens.pop()</Code>，三個集合各移除一個值。這一列所有欄試完仍無解，就自然返回到上一列，也就是回溯。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>4 皇后。一列一列放，淺黃格是被現有皇后攻擊的位置，每次試到被攻擊的格子會標出原因。當某一列每一欄都被攻擊，就拿掉上一列的皇后換下一欄，直到找到第一組解。</p>
        <NQueensDemo />
      </Section>

      <Section id="code">
        <p>列出所有解的集合版本，以及只數解數量的位元遮罩版本。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 36", name: "Valid Sudoku（先練衝突檢查）", diff: "Medium" },
            { src: "LeetCode 473", name: "Matchsticks to Square（每根火柴放進四條邊之一，排序後剪枝）", diff: "Medium" },
            { src: "LeetCode 51", name: "N-Queens", diff: "Hard" },
            { src: "LeetCode 52", name: "N-Queens II（位元遮罩）", diff: "Hard" },
            { src: "LeetCode 37", name: "Sudoku Solver（列、欄、宮三組集合）", diff: "Hard" },
            { src: "LeetCode 1655", name: "Distribute Repeating Integers（約束滿足加剪枝）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const nQueensLesson: Lesson = { prereq: "Combinations & Combination Sum、Hash Table", Body };
