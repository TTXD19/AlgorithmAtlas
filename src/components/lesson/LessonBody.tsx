import type { ComponentType } from "react";
import { Section, Steps, Problems, Applications } from "./parts";
import { CodeTabs } from "./CodeTabs";
import { inline } from "@/lib/inline";
import type { LessonSkeleton, LessonText } from "@/lib/lesson-model";
import type { Locale } from "@/lib/i18n";

/**
 * 所有課程共用的版面。93 篇的段落順序完全一致，所以這裡是唯一一份實作，
 * 每篇課程只提供結構（demo / code / problems）與文字。
 */
export function LessonBody({
  skeleton,
  text,
  Concept,
  locale,
}: {
  skeleton: LessonSkeleton;
  text: LessonText;
  Concept: ComponentType;
  locale: Locale;
}) {
  return (
    <>
      <Section id="why">
        <Applications items={text.applications} cue={text.cue} locale={locale} />
      </Section>

      <Section id="concept">
        <Concept />
      </Section>

      <Section id="steps">
        <Steps items={text.steps.map(inline)} />
      </Section>

      <Section id="demo">
        <p>{inline(text.demoNote)}</p>
        {skeleton.demo}
      </Section>

      <Section id="code">
        <p>{inline(text.codeNote)}</p>
        <CodeTabs samples={skeleton.code} />
      </Section>

      <Section id="problems">
        {text.problemsNote && <p>{inline(text.problemsNote)}</p>}
        <Problems items={text.problems} />
      </Section>
    </>
  );
}
