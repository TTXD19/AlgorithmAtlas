/**
 * 原始語言的 UI 字串，同時也是其他語言字典的型別來源。
 *
 * 其他語言的檔案宣告成 `const en: Messages`，所以漏翻任何一個鍵
 * 都會是 tsc 錯誤，不會靜默地掉回中文。
 */
export const zhHant = {
  site: {
    name: "演算法圖鑑",
    tagline: "Algorithm Atlas",
  },
  nav: {
    topics: "主題",
    roadmap: "學習路線",
    theme: "切換深淺色",
    language: "切換語言",
  },
  auth: {
    signIn: "登入",
    signOut: "登出",
    signingIn: "前往登入⋯",
    withGitHub: "用 GitHub 繼續",
    withGoogle: "用 Google 繼續",
    hint: "登入後，學習進度會跨裝置同步。",
  },
  progress: {
    markDone: "標記為已學會",
    done: "✓ 已學會",
    doneLabel: "已學會",
    learnable: "可學習",
    draft: "撰寫中",
  },
  lesson: {
    breadcrumb: "麵包屑",
    apply: "用在：",
    time: "時間複雜度",
    space: "空間複雜度",
    level: "難度",
    prereq: "前置知識",
    prev: "上一篇",
    next: "下一篇",
    untranslated: "這篇課程還沒有翻譯，以下是原文。",
  },
} as const;

/** 其他語言字典必須符合的形狀。 */
export type Messages = {
  [K in keyof typeof zhHant]: { [P in keyof (typeof zhHant)[K]]: string };
};
