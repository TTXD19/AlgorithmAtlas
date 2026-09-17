"use client";

import { useT } from "./LocaleProvider";

/**
 * 在深淺色之間切換。
 *
 * 下一個主題依「目前實際看到的外觀」決定，不依 data-theme 的值：未設定時
 * 外觀由系統偏好決定，照設定值推進的話會產生一次顏色完全沒變的點擊
 * （原本的三段循環就是這樣，系統深色時第一下等於沒按）。
 *
 * 沒按過的訪客仍然跟隨系統——那是 globals.css 的 media query 在管，
 * 只要 localStorage 沒有值就成立。按下去之後才固定成明確的選擇。
 */
export function ThemeToggle() {
  const t = useT();
  const toggle = () => {
    const root = document.documentElement;
    const set = root.getAttribute("data-theme");
    const isDark = set ? set === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = isDark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("atlas-theme", next);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={toggle}
      title={t.nav.theme}
      aria-label={t.nav.theme}
      className="cursor-pointer rounded-md px-2.5 py-1.5 text-[13.5px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
    >
      ◐
    </button>
  );
}

/** 在首次繪製前套用使用者上次選的主題，避免閃爍。 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('atlas-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`;
