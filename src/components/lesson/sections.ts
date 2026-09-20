/**
 * 課程段落的 id 與順序。標題在 messages 裡，隨語言變。
 * quiz 是可選的：沒有題目的課程不渲染那一段，編號由 LessonBody 依實際段落算。
 *
 * 獨立成純資料模組，不放在 "use client" 的 Section.tsx 裡：server 元件
 * 從 client 模組 import 到的是 client reference，不是陣列本身。
 */
export const SECTIONS = ["why", "concept", "steps", "demo", "code", "quiz", "problems"] as const;
export type SectionId = (typeof SECTIONS)[number];
