"use client";

import { useEffect, useRef, useState } from "react";
import { useUser, signIn, signOut, displayName, type Provider } from "@/lib/auth";

const PROVIDERS: { id: Provider; label: string; icon: React.ReactNode }[] = [
  {
    id: "github",
    label: "用 GitHub 繼續",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
    ),
  },
  {
    id: "google",
    label: "用 Google 繼續",
    icon: (
      <svg viewBox="0 0 18 18" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
        <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
      </svg>
    ),
  },
];

export function AuthButton() {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Provider | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 點外面或按 Esc 關閉
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // session 還沒解析完時佔住同樣寬度，避免「登入」閃一下才變成頭像。
  // 跟 ThemeToggle 的 THEME_INIT_SCRIPT 是同一個考量。
  if (loading) return <div className="h-8 w-[52px]" aria-hidden="true" />;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={
          user
            ? "flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-accent text-[13px] font-bold text-accent-ink"
            : "cursor-pointer rounded-md px-2.5 py-1.5 text-[13.5px] font-medium whitespace-nowrap text-ink-2 hover:bg-surface-2 hover:text-ink"
        }
        title={user ? displayName(user) : "登入"}
      >
        {user ? displayName(user).charAt(0).toUpperCase() : "登入"}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-[248px] overflow-hidden rounded-[10px] border border-line bg-surface shadow-card"
        >
          {user ? (
            <>
              <div className="border-b border-line px-3.5 py-2.5">
                <div className="truncate text-[13.5px] font-semibold">{displayName(user)}</div>
                {user.email && <div className="truncate text-[12px] text-ink-3">{user.email}</div>}
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="w-full cursor-pointer px-3.5 py-2.5 text-left text-[13.5px] hover:bg-surface-2"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <div className="border-b border-line px-3.5 py-2.5 text-[12.5px] text-ink-3">
                登入後，學習進度會跨裝置同步。
              </div>
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="menuitem"
                  disabled={busy !== null}
                  onClick={() => {
                    setBusy(p.id);
                    void signIn(p.id);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] hover:bg-surface-2 disabled:opacity-50"
                >
                  {p.icon}
                  {busy === p.id ? "前往登入⋯" : p.label}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
