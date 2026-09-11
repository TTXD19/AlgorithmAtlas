"use client";

/** 循環切換：跟隨系統 → 深色 → 淺色。 */
export function ThemeToggle() {
  const cycle = () => {
    const root = document.documentElement;
    const cur = root.getAttribute("data-theme");
    const next = cur === null ? "dark" : cur === "dark" ? "light" : null;
    if (next) root.setAttribute("data-theme", next);
    else root.removeAttribute("data-theme");
    try {
      if (next) localStorage.setItem("atlas-theme", next);
      else localStorage.removeItem("atlas-theme");
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={cycle}
      title="切換深淺色"
      className="cursor-pointer rounded-md px-2.5 py-1.5 text-[13.5px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
    >
      ◐
    </button>
  );
}

/** 在首次繪製前套用使用者上次選的主題，避免閃爍。 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('atlas-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`;
