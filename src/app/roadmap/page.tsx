import type { Metadata } from "next";
import { RoadmapView } from "@/components/RoadmapView";
import { Crumbs } from "@/components/Crumbs";
import { validateRoadmap } from "@/lib/roadmap";

export const metadata: Metadata = { title: "學習路線" };

export default function RoadmapPage() {
  // 建置時檢查路線圖是否涵蓋所有課程，有問題直接讓 build 失敗
  const problems = validateRoadmap();
  if (problems.length) throw new Error(`路線圖資料有誤：\n${problems.join("\n")}`);
  return (
    <>
      <Crumbs items={[{ href: "/", label: "主題" }, { label: "學習路線" }]} />
      <RoadmapView />
    </>
  );
}
