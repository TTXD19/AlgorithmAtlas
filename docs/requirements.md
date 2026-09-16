# algo-atlas 帳號與付費需求整理

> 整理日期：2026-09-16
> 狀態：待 Welsen 確認。標示「待決定」的項目會擋到動工，請先回答。

---

## 0. 前提事實（實測，非推測）

這些數字決定了下面所有的優先順序，先放最前面。

| 事實 | 量測方式 | 影響 |
|---|---|---|
| 專案 5 天大，15 個 commit | `git log`（2026-09-11 ~ 2026-09-16） | 沒有累積的技術債要繞過 |
| **尚未部署**，無 vercel.json / Dockerfile / .github | `ls -a` | **沒有任何使用者** |
| 使用者數 = 0 | 由上一條推導 | 沒有 localStorage 進度要遷移、沒有 SEO 排名要保護、沒有付費意願的證據 |
| 115 頁全靜態、零後端、零資料庫 | `npm run build` | 現況隨時可以直接上線 |
| 零測試、零 CI | `package.json` 只有 dev/build/start/lint | 不要為不存在的 CI 寫 gate |
| 有 GitHub remote | `git@github.com:TTXD19/AlgorithmAtlas.git` | 部署的前置條件已經具備 |

**這一條改寫了整份規劃的優先順序**：先前的討論花了大量篇幅在「既有使用者的 localStorage 怎麼合併」「已索引的 93 篇轉付費對 SEO 的衝擊」——這兩件事保護的都是不存在的東西。

---

## 0.5 已拍板決定（2026-09-16，Welsen）

| 決定 | 內容 |
|---|---|
| **既有 93 篇課程** | **永久免費。** 付費只可能適用於未來新增的課程 |
| **R4 收藏 / 筆記 / 練習紀錄** | 確定要做 |
| **執行順序** | v0 部署到 Vercel → 買網域並接上 → 才開始做 auth + Supabase → 再做收藏/筆記/練習紀錄 |

這個決定讓 §5 的 Q5（試閱粒度）整題消失，也連帶刪掉 `Lesson` 型別重構、93 個 content 檔的改動、`Rail` 錨點截斷、既有內容的 SEO 保全、「轉付費要不要追溯已標記學會的人」這一整串。

---

## 1. 你明確說過的需求

原話照錄，不加工。

| # | 需求 | 原話 |
|---|---|---|
| R1 | 帳號系統（註冊／登入） | 「想在上面加上登入註冊的功能」 |
| R2 | 學習進度跨裝置同步 | 選項：「進度跨裝置同步」 |
| R3 | 付費課程，且**免費/付費要能動態調整** | 「有時候會想決定哪些課程可以付費 哪些課程免費 然後可以動態調整」 |
| R4 | 筆記、收藏、練習紀錄 | 選項：「筆記、收藏、練習紀錄」→ 2026-09-16 再次確認要做 |
| R5 | 連續天數、排行榜 | 選項：「連續天數、排行榜等社群功能」 |
| R6 | 用 Supabase | 選項：「Supabase（推薦）」 |

---

## 2. 架構決定的修正

前兩則對話拍板過三件事：`@supabase/ssr` cookie session、開 `cacheComponents` + 靜態外殼串流、`proxy.ts`。

**這三件事全部只由 R3（付費牆）推導出來。** 把付費牆從第一版拿掉之後，三件事都不需要。

實測佐證：進度資料只被 `Sidebar.tsx`、`ProgressBits.tsx`、`RoadmapView.tsx` 三個 client component 經由 `useProgress()` 消費；`layout.tsx` 沒有任何 server 端 session 讀取；`[topic]/[sub]/page.tsx` 是純靜態渲染。**唯一強迫每頁在 server 讀 session 的東西就是付費牆。**

| | 有付費牆（原方案） | 無付費牆（建議的 v1） |
|---|---|---|
| Session | `@supabase/ssr` cookie，server 可讀 | 瀏覽器 client SDK |
| 權限執行 | server-only DAL + RLS | 純 RLS（`user_id = auth.uid()`） |
| 渲染 | `cacheComponents` + PPR，課程頁切 Suspense | **115 頁維持全靜態，不動** |
| `proxy.ts` | 需要 | 不需要 |
| `service_role` key | 需要保管（專案第一個危險 secret） | 不需要 |
| 工程量 | 7 階段 | **約 5 個檔案** |

這不是說原本的技術判斷錯了——**給定要做 server 端付費牆，那三個決定是對的**。是「現在不做付費牆」讓它們變成不必要。

---

## 3. 建議的優先順序

### v0：現況部署上線（進行中）

把目前這 115 頁靜態站部署到 Vercel，買網域接上去，順便把 README 從 create-next-app 樣板換掉。

狀態：README 已重寫；等 Vercel 匯入與網域。

理由：部署是其他每一個決定的前置條件。沒有線上站，就不知道有沒有人看、哪幾篇有人看（那才是該考慮收費的那幾篇）、跨裝置同步值不值得做。這是整份文件投入產出比最高的一項。

### v1：最小可交付 — 帳號 + 進度同步

做完這三樣，網站就是完整可用的狀態：

- **R1** 帳號：Google OAuth（見 §5 待決定 Q1）
- **R2** 進度同步：`progress` 表 + 改 `src/lib/progress.ts` 一個檔案
- 登出
- **手機端可標記已學會**（見 §4 阻擋性缺口）

架構：Supabase client SDK + RLS，115 頁維持靜態。

要動的檔案：`src/lib/supabase.ts`（新增）、`src/lib/progress.ts`（改）、`src/components/AuthButton.tsx`（新增）、`src/app/login/page.tsx`（新增）、`.env.local`。

### v2：各自獨立，隨時可做可不做

- **R4a** 收藏 — `bookmarks` 表，形狀跟 progress 一樣
- **R4b** 筆記 — `notes(user_id, lesson_key, body, updated_at)`，主鍵 `(user_id, lesson_key)`，後寫的贏
- **R4c** 練習紀錄 — **先把練習題變成可點的外連**（現在 `parts.tsx:42-56` 的 Problems 只是三個字串的展示清單，連結都沒有，點不下去）。做過沒用一個 checkbox，key 用 `${lessonKey}#${src}`，存進跟收藏同一張表

### later：綁觸發條件，條件不成立就不要開始

| 需求 | 觸發條件 | 為什麼要等 |
|---|---|---|
| **R5** 連續天數 | v1 上線後 | 需要 `completed_at`，v1 建表時順手加就好 |
| **R5** 排行榜 | 註冊使用者 ≥ 50 | 個位數使用者的排行榜是尷尬不是功能；而且總完成數上限只有 93，早期使用者會長期卡榜 |
| **R3** 付費牆 | **已經有人用任何方式實際付過一次錢** | 驗證付費意願不需要付費牆。在那之前收錢的方式就是手動：收款後自己在 Supabase 加一列 |

---

## 4. 阻擋性缺口：手機上根本不能標記已學會

**這是這輪盤點找到最嚴重的產品問題，而且跟 R2 直接衝突。**

實測：

- `MarkDone` 全站只在一個地方被 render：`src/components/lesson/Rail.tsx:33`
- `Rail` 的 class 是 `sticky top-20 hidden self-start text-[13px] lg:block` → **1024px 以下完全不顯示**
- `Sidebar` 是 `hidden ... md:block` → 768px 以下看不到進度數字與小圓點

也就是說：**在手機上目前沒有任何按鈕可以標記已學會。** 而「跨裝置同步」最典型的第二台裝置就是手機。同步做完了，手機端仍然只能讀不能寫，R2 的價值直接折半。

v1 必須一併處理。建議把 `MarkDone` 從 `Rail` 抽出來，改放在課文結尾（所有斷點都顯示），`Rail` 只留目錄。

---

## 5. 待決定（會擋到動工）

### Q1. 註冊方式 — 建議現在就拍板

**建議：只開 Google OAuth。**

- 一次刪掉：密碼重設流程、它的 callback route、寄信範本、弱密碼與撞庫風險、整類「我登不進去」的客服
- 這是演算法教學站，讀者幾乎都有 Google 帳號
- 也避開 magic link 的實際失敗情境：PKCE 通常要求在「發出請求的同一個瀏覽器」開啟連結，而手機使用者常在 Gmail／LINE 的內建瀏覽器點開

**若要併用 magic link，必須同時決定**：Supabase 內建寄信只適合測試（有很低的每小時上限，請以官方當期文件為準），正式環境要自備 SMTP（Resend / SES / Postmark），而它又相依於「正式網域是什麼」。兩個未決事項會卡在一起。

### Q2. 兩種登入方式併用時，同 email 算同一個人嗎？

只有 Q1 選「兩種都開」才需要回答。Google OAuth 與 magic link 用同一個 email 時，會是同一個 `user_id` 還是兩個？付費權限綁 `user_id`，一旦同一個人拿到第二個 `user_id`，症狀就是「我付了錢但看不到」。選項：(a) 只開一種，從源頭消滅 (b) 開「同 email 自動連結身分」 (c) 接受重複帳號，先寫好合併 SQL。

### Q3. 進度的「取消已學會」怎麼同步？

`src/lib/progress.ts:45-50` 的 toggle 是可逆的（再按一次 `delete` 掉那個 key）。所以跨裝置同步不能簡單用聯集，否則 A 裝置的取消會被 B 裝置的舊資料復原。

**建議：一課一列、保留列、`is_done` + `updated_at`，per-row last-write-wins。** 那個 `updated_at` 正好就是連續天數需要的時間戳，一次解決兩個需求。

### Q4. 93 篇既有課程會不會轉付費？ — ✅ 已決定：不會

**已拍板：目前這 93 篇永久免費，付費只適用於未來新增的課程。**

這一句話刪掉的東西比任何其他單一決定都多：試閱深度問題消失、`Lesson` 型別不用改、93 個 content 檔不用動、`Rail` 的錨點截斷問題消失、既有頁面的可索引內容自動維持、「轉付費要不要追溯已標記學會的人」消失。

而且把免費看過的內容改成付費，對讀者是背信。

### Q5. 試閱粒度 — ⬛ 因 Q4 已決定而消失（保留供未來新課參考）

工程量差一個數量級：

- **整篇鎖** → 只改 `src/app/[topic]/[sub]/page.tsx` 一處
- **前 N 段試閱** → 要改 `Lesson` 介面 + 93 個 content 檔（目前每篇的 `Body` 是單一 JSX 一次吐出六個 Section）

建議整篇鎖。若要段落試閱，切點定義成「前 N 段」而不是「切在 concept 之後」——`SECTIONS` 近期才從五段變成六段（`lessons.ts:99` 與 `parts.tsx:3` 的註解都還寫「五段」），它不是凍結契約。

### Q6. 部署與環境（v0 的前置）

- 部署平台？
- 幾個 Supabase project（正式／preview／本地）？
- schema 版控：用 supabase CLI 的 migration 檔進 git，還是在 Studio 手改？

第三項特別重要：若不決定，RLS policy 會只存在於正式專案的 Studio 裡，沒有 code review、沒有 diff、沒有回退。

---

## 6. 硬限制（實測，設計時繞不開）

1. **`topicId/subId` 這個字串同時是四個地方的硬編碼主鍵**：URL 片段、`LESSONS` 的 93 個字面 key、`ROADMAP_NODES` 的 93 個字面 key、localStorage 的 key。寫進 Supabase 之後，改名的影響範圍會從單一裝置擴大到整個帳號的資料。
   *結論：不需要建 alias 表或代理主鍵。93 個 key 由你一個人完全掌控、5 天內一次都沒改過，真要改名的成本是跑一句 `UPDATE`。*

2. **三個消費端都要求「同步、一次拿到全部 93 筆」的 API**：`Sidebar` 為 17 個主題各算一次、`RoadmapView` 為 22 個節點各算一次再掃全部找「建議下一步」、`DoneTotal` 直接數 `Object.keys().length`。不能設計成每頁 lazy 查一筆。
   *結論：localStorage 續留當本地同步快取，`useProgress()` 維持同步介面，三個消費端一行都不用改。*

3. **`src/lib/progress.ts` 是 `"use client"` 且被 root layout 的 Sidebar 消費**，所以它 import 的任何東西都會進全站 115 頁的 client bundle。目前 runtime 相依只有 next / react / react-dom 三個。加 Supabase SDK 要意識到這件事。

4. **課程內容目前烘進預渲染 HTML**：`generateStaticParams` 預渲染 93 篇，`<lesson.Body />` 在 build 時就渲染完成。任何前端的「遮住」都無效——付費牆只能靠「不 render」。

5. **`src/app` 底下沒有 `error.tsx` / `not-found.tsx`**。做付費牆時，Supabase 掛掉的錯誤會在 shell 已送出後才拋出（HTTP 早就 200），沒有 error boundary 接住的話整頁會壞，**免費課程也會一起壞掉**。

6. **全站沒有 footer**，新頁面（登入、我的收藏、帳號設定、隱私說明）沒有地方掛。而且站上沒有任何聯絡方式——手動開通的前提是使用者找得到你。

7. **`.next` 目前不可當基線**：`next.config.ts` 沒有開 `cacheComponents`，但磁碟上的建置產物是 `cacheComponents: true`（最可能是還在跑的 dev server 覆寫的）。任何「產物比對」的驗收條件都要先跑一次乾淨 build 重新量。

---

## 7. 付費牆的三選二（等 R3 真的要做時再讀）

這三條在 Next 16 的文件事實下**不可能同時成立**：

- (a) 免費課程的內文留在靜態外殼裡（CDN 直出、SEO 最佳）
- (b) `lesson_access` 翻成付費後立即對新請求生效
- (c) `next build` 不需要 Supabase 憑證

原因：靜態外殼可以直接從 CDN 送出、不回源，所以 (a) 成立時 (b) 不可能立即生效；而用 `use cache` 包 `lesson_access` 讓內文進外殼，會讓 build 當下就真的去連 Supabase，牴觸 (c)。

**建議選 (b)+(c)**：內文一律在 Suspense 後即時判定（free/paid 都一樣），放棄課程內文的預渲染，換到真正的即時生效與零憑證 build。你真正要的是「server 端付費牆」與「後台改就生效」，「免費內文留在靜態外殼」不是你提過的需求。

另外：開 `cacheComponents` 之前**必須先把 Sidebar 包進 Suspense**。實測現在 19 個 unknown-param 靜態外殼是 0 bytes（Sidebar 是 client component 且在 root layout 直接呼叫 `usePathname()`，外層沒有 Suspense）。順序反了會讓打錯字的 URL 先收到一張全白頁再被 upgrade 成 404。

---

## 8. 我從清單裡砍掉的東西（以及為什麼）

盤點過程產生了 63 條需求候選、68 個待決定。以下是刻意不放進來的，列出來讓你確認我沒砍錯：

| 砍掉的 | 原因 |
|---|---|
| localStorage 遷移的整套設計（tombstone、source 欄位、離線佇列、雙寫、匯入端點白名單） | 使用者數 0，沒有資料要遷移。v1 保留一句：首次登入若讀得到 `atlas-done` 就聯集匯入 |
| SEO 基線保護、轉付費的排名衝擊分析 | 沒有一篇被索引過，沒有 baseline 可以維持 |
| 密碼重設的整條需求鏈 | Q1 若選 OAuth，整條消失 |
| 帳號刪除、資料匯出、隱私說明頁 | 你沒提過。唯一該保留的是「建表當下決定所有 FK 的 `on delete` 行為」——這跟要不要做刪帳號 UI 無關 |
| 筆記的樂觀鎖與衝突偵測、`section_id` 預留欄位 | 單一帳號同時在兩台裝置編輯同一篇的機率接近零。加欄位是一行 `ALTER TABLE` |
| lesson key 的防漂移機制（alias 表、CI 漂移檢查、同步 script） | 三個視角各提了一套。93 個 key 你完全掌控，改名成本是一句 `UPDATE` |
| 離線可用性、service worker、PWA | 你從頭到尾沒提過 |
| 營運手冊（排查 SQL snippet、audit trail、備份方案、平台月費估算） | 零使用者零營收，寫了也不準。只保留：README 寫下環境變數名稱與本地起站方式 |
| 7 階段計畫 + CI gate script | 專案 5 天大、零 CI。一人開發最可能的失敗模式是做到一半停擺，不是選錯順序 |
| 排行榜的暱稱欄位進註冊流程 | 暱稱在使用者按下「我要上榜」時才問，跟註冊流程解耦。另外：**禁止**從 email 前綴或 OAuth 的 name 帶入預設值（Google 回傳的通常是真名） |

