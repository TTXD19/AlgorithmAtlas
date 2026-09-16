import type { ComponentType } from "react";
import { DEFAULT_LOCALE, type Locale } from "./i18n";
import type { LessonSkeleton, LessonText } from "./lesson-model";
import { MIGRATED, isTranslated } from "@/content/registry";
import { LESSONS, type Lesson } from "./lessons";

export type LoadedLesson =
  | {
      kind: "modern";
      skeleton: LessonSkeleton;
      text: LessonText;
      Concept: ComponentType;
      prereq: string;
      /** false 代表這個語言還沒翻，內容是原始語言 */
      translated: boolean;
    }
  | { kind: "legacy"; lesson: Lesson }
  | null;

/**
 * 組出一篇課程：結構一份（與語言無關）＋ 文字一份（依語言，缺就退回原始語言）。
 *
 * 遷移期間兩套模型並存：還沒轉換的課程走舊的 LESSONS map。
 */
export async function loadLesson(key: string, locale: Locale): Promise<LoadedLesson> {
  if (!MIGRATED.has(key)) {
    const lesson = LESSONS[key];
    return lesson ? { kind: "legacy", lesson } : null;
  }

  const translated = isTranslated(key, locale);
  const from: Locale = translated ? locale : DEFAULT_LOCALE;

  const [{ skeleton }, { text }, { default: Concept }] = await Promise.all([
    import(`@/content/lessons/${key}.tsx`),
    import(`@/content/text/${from}/${key}.ts`),
    import(`@/content/text/${from}/${key}.mdx`),
  ]);

  return { kind: "modern", skeleton, text, Concept, prereq: text.prereq, translated };
}
