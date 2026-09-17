import type { ComponentType } from "react";
import { DEFAULT_LOCALE, type Locale } from "./i18n";
import type { LessonSkeleton, LessonText } from "./lesson-model";
import { isTranslated } from "@/content/registry";

export interface LoadedLesson {
  skeleton: LessonSkeleton;
  text: LessonText;
  Concept: ComponentType;
  prereq: string;
  /** false 代表這個語言還沒翻，內容是原始語言 */
  translated: boolean;
}

/**
 * 組出一篇課程：結構一份（與語言無關）＋ 文字一份（依語言，缺就退回原始語言）。
 *
 * 呼叫端已經先用 getSubtopicBy 確認過 key 存在（不存在就 notFound），
 * 而 generateStaticParams 只會產生有效的 key，所以這裡不再重複檢查。
 */
export async function loadLesson(key: string, locale: Locale): Promise<LoadedLesson> {
  const translated = isTranslated(key, locale);
  const from: Locale = translated ? locale : DEFAULT_LOCALE;

  const [{ skeleton }, { text }, { default: Concept }] = await Promise.all([
    import(`@/content/lessons/${key}.tsx`),
    import(`@/content/text/${from}/${key}.ts`),
    import(`@/content/text/${from}/${key}.mdx`),
  ]);

  return { skeleton, text, Concept, prereq: text.prereq, translated };
}
