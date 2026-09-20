import type { ComponentType } from "react";
import { Section, Steps, Problems, Applications, SECTIONS, type SectionId } from "./parts";
import { CodeTabs } from "./CodeTabs";
import { Quiz } from "./Quiz";
import { inline } from "@/lib/inline";
import type { LessonSkeleton, LessonText } from "@/lib/lesson-model";
import type { Locale } from "@/lib/i18n";

/** 這篇課程實際會渲染的段落。quiz 只在有題目時出現，Rail 用同一份清單。 */
export function lessonSections(text: LessonText): SectionId[] {
  return SECTIONS.filter((id) => id !== "quiz" || (text.quiz && text.quiz.length > 0));
}

/**
 * 所有課程共用的版面。93 篇的段落順序完全一致，所以這裡是唯一一份實作，
 * 每篇課程只提供結構（demo / code / problems）與文字。
 */
export function LessonBody({
  skeleton,
  text,
  Concept,
  locale,
  lessonId,
}: {
  skeleton: LessonSkeleton;
  text: LessonText;
  Concept: ComponentType;
  locale: Locale;
  lessonId: string;
}) {
  const n = (id: SectionId) => lessonSections(text).indexOf(id) + 1;
  return (
    <>
      <Section id="why" n={n("why")}>
        <Applications items={text.applications} cue={text.cue} locale={locale} />
      </Section>

      <Section id="concept" n={n("concept")}>
        <Concept />
      </Section>

      <Section id="steps" n={n("steps")}>
        <Steps items={text.steps.map(inline)} />
      </Section>

      <Section id="demo" n={n("demo")}>
        <p>{inline(text.demoNote)}</p>
        {skeleton.demo}
      </Section>

      <Section id="code" n={n("code")}>
        <p>{inline(text.codeNote)}</p>
        <CodeTabs samples={skeleton.code} />
      </Section>

      {text.quiz && text.quiz.length > 0 && (
        <Section id="quiz" n={n("quiz")}>
          <Quiz items={text.quiz} lessonId={lessonId} />
        </Section>
      )}

      <Section id="problems" n={n("problems")}>
        {text.problemsNote && <p>{inline(text.problemsNote)}</p>}
        <Problems items={text.problems} />
      </Section>
    </>
  );
}
