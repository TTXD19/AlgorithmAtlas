import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { WordSearchDemo } from "@/components/lesson/demos/WordSearchDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# Word Search（LeetCode 79）：網格上 DFS，走過的格子暫時改成 '#'，回來時改回去
def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, i):
        if board[r][c] != word[i]:            # 這格字母不對
            return False
        if i == len(word) - 1:                # 最後一個字母也對上了
            return True
        ch = board[r][c]
        board[r][c] = "#"                     # 做選擇：標記為已走過
        for dr, dc in ((-1, 0), (0, 1), (1, 0), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and dfs(nr, nc, i + 1):
                board[r][c] = ch              # 找到了也要復原，別把棋盤留成髒的
                return True
        board[r][c] = ch                      # 撤銷選擇：回復標記
        return False

    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))


# 變形：列出迷宮裡從起點到終點的所有路徑（0 可走、1 是牆）
def all_paths(maze, start, goal):
    rows, cols = len(maze), len(maze[0])
    ans = []
    path = []
    visited = [[False] * cols for _ in range(rows)]

    def dfs(r, c):
        path.append((r, c))
        visited[r][c] = True
        if (r, c) == goal:
            ans.append(path[:])
        else:
            for dr, dc in ((-1, 0), (0, 1), (1, 0), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] == 0 and not visited[nr][nc]:
                    dfs(nr, nc)
        visited[r][c] = False                 # 回復標記：別條路徑還能經過這格
        path.pop()

    dfs(*start)
    return ans


if __name__ == "__main__":
    board = [list("ABCE"), list("SFCS"), list("ADEE")]
    print(exist(board, "SEE"), exist(board, "ABCCED"), exist(board, "ABCB"))   # True True False
    maze = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
    print(len(all_paths(maze, (0, 0), (2, 2))))                              # 2`;

const cpp = `#include <vector>
#include <string>
#include <utility>

// Word Search：走過的格子暫時改成 '#'，回來時改回去
bool dfsWord(std::vector<std::vector<char>>& board, const std::string& word, int r, int c, int i) {
    int rows = board.size(), cols = board[0].size();
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] != word[i]) return false;       // 這格字母不對（'#' 也不會等於任何字母）
    if (i == (int)word.size() - 1) return true;     // 最後一個字母也對上了
    char ch = board[r][c];
    board[r][c] = '#';                              // 做選擇：標記為已走過
    bool found = dfsWord(board, word, r - 1, c, i + 1) || dfsWord(board, word, r, c + 1, i + 1)
              || dfsWord(board, word, r + 1, c, i + 1) || dfsWord(board, word, r, c - 1, i + 1);
    board[r][c] = ch;                               // 撤銷選擇：回復標記
    return found;
}

bool exist(std::vector<std::vector<char>>& board, const std::string& word) {
    for (int r = 0; r < (int)board.size(); r++)
        for (int c = 0; c < (int)board[0].size(); c++)
            if (dfsWord(board, word, r, c, 0)) return true;
    return false;
}

// 變形：列出迷宮裡從起點到終點的所有路徑（0 可走、1 是牆）
void dfsMaze(const std::vector<std::vector<int>>& maze, int r, int c, std::pair<int, int> goal,
             std::vector<std::vector<bool>>& visited, std::vector<std::pair<int, int>>& path,
             std::vector<std::vector<std::pair<int, int>>>& ans) {
    int rows = maze.size(), cols = maze[0].size();
    path.push_back({r, c});
    visited[r][c] = true;
    if (std::make_pair(r, c) == goal) {
        ans.push_back(path);
    } else {
        const int dr[4] = {-1, 0, 1, 0}, dc[4] = {0, 1, 0, -1};
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] == 0 && !visited[nr][nc])
                dfsMaze(maze, nr, nc, goal, visited, path, ans);
        }
    }
    visited[r][c] = false;                          // 回復標記
    path.pop_back();
}

std::vector<std::vector<std::pair<int, int>>> allPaths(const std::vector<std::vector<int>>& maze, std::pair<int, int> start, std::pair<int, int> goal) {
    std::vector<std::vector<bool>> visited(maze.size(), std::vector<bool>(maze[0].size(), false));
    std::vector<std::pair<int, int>> path;
    std::vector<std::vector<std::pair<int, int>>> ans;
    dfsMaze(maze, start.first, start.second, goal, visited, path, ans);
    return ans;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "文字遊戲的答案檢查",
              problem: "Boggle 這類遊戲給一盤字母，玩家提交一個字，系統要判斷它能不能由相鄰的格子連出來，而且每格只能用一次。",
              why: "從每個字母相同的格子出發，往上下左右延伸比對下一個字母，走過的格子先標記起來，這條路走不通就取消標記換另一條。這就是網格上的回溯，「回復標記」讓別條路徑還能經過同一格。",
            },
            {
              title: "列出迷宮的所有走法",
              problem: "遊戲關卡設計師想知道從入口到出口有幾條不重複經過同一格的路，好判斷關卡是不是太簡單。",
              why: "BFS 只能找最短的一條，要列出全部就得 DFS 加回溯：每走一格標記，到終點就記錄一條路徑，退回來時取消標記。標記不回復，第二條路就找不到了。",
            },
            {
              title: "機器人手臂的可行動作序列",
              problem: "手臂要從初始姿態經過一連串動作到達目標，每一步只能做四種動作之一，有些中間姿態是禁止的。要列出所有合法的動作序列。",
              why: "姿態是格子、動作是四個方向、禁止姿態是牆，問題形狀和網格回溯一模一樣。網格只是最容易畫出來的狀態空間，同樣的程式套在任何「狀態加轉移」的問題上。",
            },
          ]}
          cue="網格、相鄰格子、每格只能用一次、找一條路徑或所有路徑、走過要標記、上下左右四個方向、走不通就回頭。"
        />
      </Section>

      <Section id="concept">
        <p>
          網格回溯把回溯的「選擇」變成<strong>往哪個方向走</strong>。從一個起點開始，比對目前格子的字母是不是 word[i]，對的話往四個鄰格找 word[i+1]，任一方向成功就整體成功。它和圖的 DFS 是同一件事，差別在 <strong>visited 的處理</strong>：DFS 找連通分量時走過就永遠不再進，網格回溯卻要在<strong>退回時取消標記</strong>，因為同一格可以出現在不同的路徑裡，只是不能在同一條路徑裡出現兩次。
        </p>
        <p>
          標記最省的做法是<strong>直接改棋盤</strong>：進入格子時把字母改成 <Code>#</Code>，離開時改回來。因為 <Code>#</Code> 不等於任何字母，「已走過」的檢查和「字母不對」的檢查合併成同一行 <Code>board[r][c] != word[i]</Code>。不想動輸入就另外開一個 visited 陣列，邏輯一樣。
        </p>
        <p>
          三步依然是<strong>做選擇</strong>（標記）、<strong>遞迴</strong>（四個方向）、<strong>撤銷選擇</strong>（回復標記）。這裡的<strong>剪枝</strong>是「字母不對就立刻 return」，比對發生在進入格子的瞬間，不對的分支連四個方向都不會展開。常見的加速還有：先數一遍棋盤裡各字母的數量，word 需要的字母不夠就直接 false；如果 word 開頭的字母在棋盤裡比結尾的多，反過來搜尋，起點會少很多。
        </p>
        <p>
          複雜度：m×n 個起點，每個起點最多走 L 層（L 是單字長度），每層 4 個方向（不走回頭路是 3 個），上界 <strong>O(m·n·4ᴸ)</strong>。空間是遞迴深度 <strong>O(L)</strong>。要在同一盤棋上找<strong>很多個</strong>單字（Word Search II），不要一個一個找，把所有單字放進 Trie，DFS 時沿 Trie 走，一次搜尋同時比對所有單字。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>對棋盤每一格 (r, c) 呼叫 <Code>dfs(r, c, 0)</Code>，任一個回傳 true 就是找到。</>,
            <>在 <Code>dfs(r, c, i)</Code> 裡先剪枝：出界或 <Code>board[r][c] != word[i]</Code> 就 return false。</>,
            <>若 <Code>i == len(word) - 1</Code>，最後一個字母也對上，return true。</>,
            <>做選擇：把 <Code>board[r][c]</Code> 改成 <Code>#</Code>，對上、右、下、左四個鄰格遞迴 <Code>dfs(nr, nc, i + 1)</Code>，任一個 true 就往上回傳 true。</>,
            <>撤銷選擇：不論結果如何，離開前把 <Code>board[r][c]</Code> 改回原字母。找到時也要復原，別把棋盤留成髒的。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>3×4 的網格裡找「SEE」。從左上開始掃起點，遇到 S 就往四個方向探。留意第一個 S 的三個方向都不通後回復標記，以及從第二個 S 出發時，走上面的 E 是死路、回復後才走下面的 E 成功。</p>
        <WordSearchDemo />
      </Section>

      <Section id="code">
        <p>Word Search 的原地標記版本，以及列出迷宮所有路徑的變形（用 visited 陣列，到終點不 return 而是記錄後繼續）。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 79", name: "Word Search", diff: "Medium" },
            { src: "LeetCode 1219", name: "Path with Maximum Gold（每條路徑走完都要回復標記）", diff: "Medium" },
            { src: "LeetCode 130", name: "Surrounded Regions（DFS 但不回復標記，比較差別）", diff: "Medium" },
            { src: "LeetCode 212", name: "Word Search II（配合 Trie）", diff: "Hard" },
            { src: "LeetCode 980", name: "Unique Paths III（列出所有走遍空格的路徑）", diff: "Hard" },
            { src: "LeetCode 2328", name: "Number of Increasing Paths in a Grid（嚴格遞增不會走回頭路，不必標記，改用記憶化）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const wordSearchLesson: Lesson = { prereq: "DFS、Matrix", Body };
