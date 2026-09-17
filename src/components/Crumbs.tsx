import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "./JsonLd";

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <>
      <nav className="mb-3.5 flex items-center gap-2 text-[13px] text-ink-3" aria-label="麵包屑">
        {items.map((it, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="opacity-60">/</span>}
            {it.href ? <Link href={it.href} className="hover:text-ink">{it.label}</Link> : <span>{it.label}</span>}
          </span>
        ))}
      </nav>
      {/*
        BreadcrumbList 直接從畫面上那份 items 產生，Google 搜尋結果會拿它取代醜網址。
        最後一層（目前頁面）依規範可以不給 item 網址。
      */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((it, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: it.label,
            ...(it.href ? { item: `${SITE_URL}${it.href}` } : {}),
          })),
        }}
      />
    </>
  );
}
