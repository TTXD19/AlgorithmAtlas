import type { GlyphId } from "@/lib/topics";

const PATHS: Record<GlyphId, React.ReactNode> = {
  foundations: (
    <>
      <path d="M3 20h18M3 20V4" />
      <path d="M4 19c4-1 7-4 9-8s3-6 7-7" />
    </>
  ),
  arrays: (
    <>
      <rect x="2.5" y="8" width="19" height="8" rx="1.5" />
      <path d="M7.5 8v8M12 8v8M16.5 8v8" />
    </>
  ),
  "linked-list": (
    <>
      <rect x="2" y="9" width="5" height="6" rx="1.2" /><rect x="9.5" y="9" width="5" height="6" rx="1.2" /><rect x="17" y="9" width="5" height="6" rx="1.2" />
      <path d="M7 12h2.5M14.5 12H17" />
    </>
  ),
  stack: (
    <>
      <rect x="5" y="15" width="14" height="4" rx="1" /><rect x="5" y="10" width="14" height="4" rx="1" /><rect x="5" y="5" width="14" height="4" rx="1" />
    </>
  ),
  heap: (
    <>
      <circle cx="12" cy="5" r="2.2" /><circle cx="7" cy="12" r="2.2" /><circle cx="17" cy="12" r="2.2" />
      <circle cx="4.5" cy="19" r="1.8" /><circle cx="9.5" cy="19" r="1.8" />
      <path d="M10.6 6.6 8.4 10M13.4 6.6l2.2 3.4M6.2 14l-1 3.2M7.8 14l1 3.2" />
    </>
  ),
  tree: (
    <>
      <circle cx="12" cy="4.5" r="2.2" /><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="12" r="2.2" />
      <circle cx="3.5" cy="19.5" r="2" /><circle cx="8.5" cy="19.5" r="2" />
      <path d="M10.5 6.2 7.2 10M13.5 6.2l3.3 3.8M5 14.1l-1 3.5M7 14.1l1 3.5" />
    </>
  ),
  "graph-ds": (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="18" cy="6" r="1.4" fill="currentColor" /><circle cx="6" cy="18" r="1.4" fill="currentColor" />
    </>
  ),
  sort: <path d="M4 20V13M9 20V6M14 20v-9M19 20V9" />,
  search: (
    <>
      <path d="M3 12h18" /><path d="M6 9v6M10 9v6M14 9v6M18 9v6" /><path d="M12 5v4" strokeWidth="2.4" />
    </>
  ),
  backtracking: (
    <>
      <path d="M12 3v6M12 9 6 15M12 9l6 6M6 15l-2 5M6 15l2 5M18 15l-2 5M18 15l2 5" />
      <circle cx="12" cy="9" r="1.6" fill="currentColor" />
    </>
  ),
  divide: (
    <>
      <rect x="3" y="4" width="18" height="6" rx="1.2" />
      <rect x="3" y="14" width="8" height="6" rx="1.2" /><rect x="13" y="14" width="8" height="6" rx="1.2" />
      <path d="M8 10v4M16 10v4" />
    </>
  ),
  greedy: (
    <>
      <path d="M4 19 9 9l4 6 3-4 4 8" /><circle cx="9" cy="9" r="1.6" fill="currentColor" />
    </>
  ),
  graph: (
    <>
      <circle cx="5" cy="18" r="2.5" /><circle cx="19" cy="18" r="2.5" /><circle cx="12" cy="5" r="2.5" />
      <path d="M12 7.5 6 16M12 7.5l6 8.5M7.5 18h9" />
    </>
  ),
  dp: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </>
  ),
  string: (
    <>
      <rect x="3" y="8" width="4" height="8" /><rect x="10" y="8" width="4" height="8" /><rect x="17" y="8" width="4" height="8" />
      <path d="M7 12h3M14 12h3" />
    </>
  ),
  bits: (
    <>
      <path d="M4 8h2v8H4zM10 8h2v8h-2zM16 8h2v8h-2z" />
      <path d="M7.5 8v8M13.5 8v8M19.5 8v8" strokeDasharray="1.5 1.5" />
    </>
  ),
  math: (
    <>
      <path d="M5 5h14l-8 7 8 7H5" />
    </>
  ),
};

export function TopicGlyph({ id, className }: { id: GlyphId; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      {PATHS[id]}
    </svg>
  );
}
