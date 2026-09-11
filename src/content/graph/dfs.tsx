import { GraphDemo } from "@/components/lesson/GraphDemo";
import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import type { Lesson } from "@/lib/lessons";

const python = `def dfs(adj, start):
    # adj: dict[node, list[node]]，回傳走訪順序
    order = []
    visited = set()

    def go(u):
        visited.add(u)
        order.append(u)
        for v in adj[u]:
            if v not in visited:
                go(v)                # 先走完 v 這條路再看下一個鄰居
        # 這裡是 u 的「完成」時刻（回溯點）

    go(start)
    return order


def dfs_iterative(adj, start):
    # 用明確的堆疊取代遞迴，順序與遞迴版可能略有不同
    order, visited = [], set()
    stack = [start]
    while stack:
        u = stack.pop()              # 從頂端取出
        if u in visited:
            continue
        visited.add(u)
        order.append(u)
        for v in reversed(adj[u]):    # 反向壓入，才會先處理第一個鄰居
            if v not in visited:
                stack.append(v)
    return order`;

const cpp = `#include <vector>

// adj[u] 是 u 的鄰居列表；order 收集走訪順序
void dfs(int u, const std::vector<std::vector<int>>& adj,
         std::vector<bool>& visited, std::vector<int>& order) {
    visited[u] = true;
    order.push_back(u);
    for (int v : adj[u]) {
        if (!visited[v]) {
            dfs(v, adj, visited, order);   // 先深入 v
        }
    }
    // u 的鄰居都處理完：回溯
}

std::vector<int> dfsFrom(const std::vector<std::vector<int>>& adj, int start) {
    std::vector<bool> visited(adj.size(), false);
    std::vector<int> order;
    dfs(start, adj, visited, order);
    return order;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "計算資料夾大小",
              problem: "Finder 或 du 指令要算一個資料夾佔多少空間：進入子資料夾，算完它的大小再回到上一層加總，一路往下直到沒有子資料夾。",
              why: "「進去、處理完、再回來」正是 DFS 的遞迴結構。樹狀的東西（檔案系統、DOM、JSON）幾乎都用 DFS 走。",
            },
            {
              title: "小畫家的油漆桶",
              problem: "點一下，整片連在一起的同色區域都被填色。影像處理的 flood fill、遊戲裡消除相連的同色方塊、地圖上數島嶼，都是找「連通區域」。",
              why: "DFS 從一個點出發把能到的全部走完，走完的那一團就是一個連通分量。程式碼比 BFS 短，用遞迴幾行就寫完。",
            },
            {
              title: "偵測循環依賴",
              problem: "模組 A import B、B import C、C 又 import A，打包工具要在出事前發現這個環。Excel 公式互相參照、套件版本相依也一樣。",
              why: "DFS 能區分「正在探索中」和「已完成」的節點。走到一個還在探索中的節點，就代表有環。BFS 做不到這個判斷。",
            },
          ]}
          cue="連通區域、填色、有沒有環、所有路徑／所有組合、樹狀結構走訪、需要回溯。"
        />
      </Section>

      <Section id="concept">
        <p>
          DFS 挑一條路<strong>一直往深處走，走到沒路了才退回上一個岔路口</strong>，換另一條沒走過的路繼續。這種「先深入、再回頭」的順序，正好就是<strong>堆疊（Stack）</strong>後進先出的行為，所以最自然的寫法是遞迴：函式呼叫本身就是一個堆疊。
        </p>
        <p>
          和 BFS 相比，DFS <strong>不保證找到最短路徑</strong>，但它能記住「我是怎麼走到這裡的」，這條路徑資訊讓它成為偵測環、找連通分量、拓撲排序與列舉所有路徑的基礎。
        </p>
        <p>
          每個節點會經歷三種狀態：<strong>未發現</strong>、<strong>探索中</strong>（已進入但鄰居還沒看完，正待在堆疊裡）、<strong>已完成</strong>（所有鄰居都處理完，已從堆疊彈出）。很多進階應用都靠這個區別，例如「探索中」的節點再被碰到一次，就表示圖裡有環。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>從起點呼叫 <Code>dfs(u)</Code>，把 <Code>u</Code> 標記為已發現，並記錄走訪順序。</>,
            <>依序看 <Code>u</Code> 的每個鄰居 <Code>v</Code>：若 <Code>v</Code> 尚未發現，<strong>立刻</strong>遞迴呼叫 <Code>dfs(v)</Code>，先把 <Code>v</Code> 那條路走完再回來看下一個鄰居。</>,
            <>當 <Code>u</Code> 的鄰居全部看完，<Code>dfs(u)</Code> 返回，也就是<strong>回溯</strong>到呼叫它的節點。</>,
            <>起點的 <Code>dfs</Code> 返回時，所有從起點可達的節點都已走訪。若要走訪整張圖，對每個尚未發現的節點再呼叫一次，每呼叫一次就是一個連通分量。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>同一張圖，同樣從 A 開始，鄰居按字母順序處理。留意堆疊怎麼長高又縮回，以及節點下方的走訪編號：和 BFS 的層次順序完全不同。</p>
        <GraphDemo algo="dfs" />
      </Section>

      <Section id="code">
        <p>遞迴版最貼近概念；圖很深時可能超過遞迴深度限制，那時改用明確的堆疊（迭代版）。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 695", name: "Max Area of Island", diff: "Medium" },
            { src: "LeetCode 133", name: "Clone Graph", diff: "Medium" },
            { src: "LeetCode 797", name: "All Paths From Source to Target", diff: "Medium" },
            { src: "LeetCode 207", name: "Course Schedule", diff: "Medium" },
            { src: "LeetCode 547", name: "Number of Provinces", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const dfsLesson: Lesson = { prereq: "Stack、遞迴、鄰接串列", Body };
