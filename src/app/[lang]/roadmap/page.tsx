import type { Metadata } from "next";
import { RoadmapView } from "@/components/RoadmapView";
import { Crumbs } from "@/components/Crumbs";
import { validateRoadmap } from "@/lib/roadmap";
import { getMessages } from "@/lib/messages";
import { pageMeta } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/roadmap">): Promise<Metadata> {
  const { lang } = await params;
  const t18n = getMessages(lang as Locale);
  return pageMeta(lang as Locale, "/roadmap", {
    title: t18n.roadmap.title,
    description: t18n.roadmap.description,
    siteName: t18n.site.name,
  });
}

export default async function RoadmapPage({ params }: PageProps<"/[lang]/roadmap">) {
  const { lang } = await params;
  const t18n = getMessages(lang as Locale);
  // 建置時檢查路線圖是否涵蓋所有課程，有問題直接讓 build 失敗
  const problems = validateRoadmap();
  if (problems.length) throw new Error(`路線圖資料有誤：\n${problems.join("\n")}`);
  return (
    <>
      <Crumbs items={[{ href: `/${lang}`, label: t18n.nav.topics }, { label: t18n.nav.roadmap }]} />
      <RoadmapView />
    </>
  );
}
