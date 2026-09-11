import { GraphDemo } from "@/components/lesson/GraphDemo";
import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import deque

def bfs(adj, start):
    # adj: dict[node, list[node]]，回傳每個節點到 start 的距離
    dist = {start: 0}
    queue = deque([start])
    while queue:
        u = queue.popleft()          # 從前端取出
        for v in adj[u]:
            if v not in dist:        # 尚未發現
                dist[v] = dist[u] + 1
                queue.append(v)      # 放到尾端
    return dist`;

const cpp = `#include <vector>
#include <queue>

// adj[u] 是 u 的鄰居列表，回傳每個節點到 start 的距離（-1 表示不可達）
std::vector<int> bfs(const std::vector<std::vector<int>>& adj, int start) {
    std::vector<int> dist(adj.size(), -1);
    std::queue<int> q;
    dist[start] = 0;
    q.push(start);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return dist;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "社群平台的「你可能認識的人」",
              problem: "Facebook 或 LinkedIn 要推薦「好友的好友」。從你出發，走一步是好友，走兩步是好友的好友，走三步的人通常就不推了。",
              why: "BFS 是唯一天生「一層一層」往外找的走訪方式。第一層看完才看第二層，所以能精確控制「幾度人脈」。",
            },
            {
              title: "迷宮與地圖的最少步數",
              problem: "掃地機器人要從充電座走到廚房，格子地圖上每一步代價都一樣。遊戲裡的 NPC 尋路、Google Maps 問「最少轉幾次車」也是同一類問題。",
              why: "在每一步代價相同的圖上，BFS 第一次碰到目標時走過的步數就是最少步數，不需要更複雜的 Dijkstra。",
            },
            {
              title: "網路爬蟲與訊息擴散",
              problem: "搜尋引擎從首頁出發抓網頁：先抓首頁上的所有連結，再抓那些頁面上的連結。傳染病模型、網路廣播封包也是同樣的擴散方式。",
              why: "「先近後遠」讓爬蟲優先涵蓋離入口最近、通常也最重要的頁面，而且能設定最大深度就停。",
            },
          ]}
          cue="最少步數、最短路徑（無權重）、幾層／幾度、離某點最近的、一圈一圈擴散。"
        />
      </Section>

      <Section id="concept">
        <p>
          BFS 從起點出發，<strong>先把距離 1 的節點全部看完，再看距離 2 的</strong>，像水波一圈一圈往外擴。之所以能做到「一圈一圈」，是因為它用 <strong>佇列（Queue）</strong> 記住待處理的節點：先被發現的先處理。
        </p>
        <p>這個性質帶來 BFS 最重要的結論：在<strong>無權重</strong>的圖上，BFS 第一次碰到某個節點時，走過的邊數就是起點到它的最短距離。</p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>把起點放入佇列，並標記為「已發現」，避免之後重複加入。</>,
            <>從佇列<strong>前端</strong>取出一個節點 <Code>u</Code>。</>,
            <>看 <Code>u</Code> 的每個鄰居 <Code>v</Code>：若 <Code>v</Code> 尚未被發現，標記它，記下 <Code>dist[v] = dist[u] + 1</Code>，然後放入佇列<strong>尾端</strong>。</>,
            <>重複步驟 2–3，直到佇列為空。此時所有從起點可達的節點都已走訪。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>從節點 A 開始。按「下一步」看佇列如何一層一層推進，節點下方的數字是與 A 的距離。</p>
        <GraphDemo algo="bfs" />
      </Section>

      <Section id="code">
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1091", name: "Shortest Path in Binary Matrix", diff: "Medium" },
            { src: "LeetCode 994", name: "Rotting Oranges", diff: "Medium" },
            { src: "LeetCode 127", name: "Word Ladder", diff: "Medium" },
            { src: "LeetCode 200", name: "Number of Islands", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const bfsLesson: Lesson = { prereq: "Queue、鄰接串列", Body };
