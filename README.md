# 演算法圖鑑 Algorithm Atlas

主題式的繁體中文演算法學習網站。17 個主題、93 篇課程，每一篇都有相同的結構：概念、步驟、可以親手按的互動示範、程式碼，以及對應的練習題。

## 開發

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build   # 正式建置，會預渲染全部 115 頁
npm run lint
```

需要 Node 20 以上。目前沒有任何環境變數。

## 技術

Next.js 16（App Router）、React 19、Tailwind CSS v4、TypeScript。

全站靜態預渲染，零後端、零資料庫。深淺色主題與學習進度存在瀏覽器 localStorage（`atlas-theme`、`atlas-done`）。

## 專案結構

```
src/
  app/
    page.tsx              首頁：主題總覽
    roadmap/page.tsx      學習路線圖
    [topic]/page.tsx      單一主題頁
    [topic]/[sub]/page.tsx  課程頁
  lib/
    topics.ts             主題與細項的定義（全站的資料來源）
    lessons.ts            課程 key → 課程內容的對照表
    roadmap.ts            學習路線圖的節點與連線
    progress.ts           學習進度（localStorage）
  content/<topic>/<sub>.tsx   課程內容本體
  components/
    lesson/parts.tsx      課程的六段結構
    lesson/demos/         各課程的互動示範
```

## 新增一篇課程

課程 key 的格式是 `topicId/subId`（例如 `graph/bfs`），四個地方都要一致：

1. **`src/lib/topics.ts`** — 在對應主題的 `subs` 裡加一筆（名稱、中文、複雜度、難度）
2. **`src/content/<topic>/<sub>.tsx`** — 寫內容，export 一個 `Lesson { prereq, Body }`
3. **`src/lib/lessons.ts`** — 把它註冊進 `LESSONS`，key 用 `topic/sub`
4. **`src/lib/roadmap.ts`** — 把 key 加進某一個節點的 `lessons` 陣列

第 4 步會被檢查：`validateRoadmap()` 要求每一篇課程**恰好**出現在一個節點裡，缺少、重複或指向不存在的課程都會讓 `npm run build` 直接失敗。

課程內容用 `src/components/lesson/parts.tsx` 的六段結構：

| id | 標題 |
|---|---|
| `why` | 為什麼需要它 |
| `concept` | 核心概念 |
| `steps` | 演算法步驟 |
| `demo` | 互動示範 |
| `code` | 程式碼 |
| `problems` | 練習題 |

## 部署

正式站：**[beginalgo.com](https://beginalgo.com)**，部署在 Vercel。

分支流程：

1. 所有改動先進 `pilot`，push 後 Vercel 會產生 preview 部署
2. 在 preview 上確認沒問題
3. 才合併進 `main` — `main` 一有新 commit 就自動部署到正式站

## 規劃

帳號系統、進度雲端同步、收藏、筆記、練習紀錄的需求整理在 [`docs/requirements.md`](docs/requirements.md)。

**目前這 93 篇課程永久免費。**
