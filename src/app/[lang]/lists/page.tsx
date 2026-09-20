import type { Metadata } from "next";
import { Crumbs } from "@/components/Crumbs";
import { ProblemLists } from "@/components/ProblemLists";
import { problemLessonMap } from "@/lib/problem-lessons";
import { getMessages } from "@/lib/messages";
import { pageMeta } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/lists">): Promise<Metadata> {
  const { lang } = await params;
  const t18n = getMessages(lang as Locale);
  return pageMeta(lang as Locale, "/lists", { title: t18n.lists.title, description: t18n.lists.description, siteName: t18n.site.name });
}

export default async function ListsPage({ params }: PageProps<"/[lang]/lists">) {
  const { lang } = await params;
  const t18n = getMessages(lang as Locale);
  const lessonsByProblem = await problemLessonMap();
  return (
    <>
      <Crumbs label={t18n.lesson.breadcrumb} items={[{ href: `/${lang}`, label: t18n.nav.topics }, { label: t18n.nav.lists }]} />
      <div className="mb-7">
        <div className="eyebrow">Interview prep</div>
        <h1 className="display mt-1.5 mb-2 text-[clamp(30px,4vw,42px)] leading-[1.08] font-extrabold">{t18n.lists.title}</h1>
        <p className="m-0 max-w-[62ch] text-[15px] text-ink-2">{t18n.lists.lede}</p>
      </div>
      <ProblemLists lessonsByProblem={lessonsByProblem} />
    </>
  );
}
