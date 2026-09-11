import type { ReactNode } from "react";

export type Lang = "python" | "cpp";

const KEYWORDS: Record<Lang, Set<string>> = {
  python: new Set(["from", "import", "def", "return", "while", "for", "in", "if", "else", "elif", "not", "and", "or", "continue", "break", "set", "None", "True", "False", "reversed", "len"]),
  cpp: new Set(["#include", "int", "bool", "void", "const", "auto", "return", "while", "for", "if", "else", "true", "false", "std", "vector", "queue", "class", "struct"]),
};

const RULES: Record<Lang, RegExp> = {
  python: /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\b)|(\b[A-Za-z_]\w*)(?=\()|(#?\b[A-Za-z_]\w*\b)/gm,
  cpp: /(\/\/.*$)|("(?:[^"\\]|\\.)*"|(?<=#include\s*)<[a-z_]+>)|(-?\b\d+\b)|(\b[A-Za-z_]\w*)(?=\()|(#?[A-Za-z_]\w*)/gm,
};

/** 極簡的語法上色：註解、字串、數字、函式名、關鍵字。 */
export function highlight(code: string, lang: Lang): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  const kw = KEYWORDS[lang];
  for (const m of code.matchAll(RULES[lang])) {
    const idx = m.index!;
    if (idx > last) out.push(code.slice(last, idx));
    const [text, cm, str, num, fn, word] = m;
    if (cm) out.push(<span key={key++} className="text-code-cm italic">{text}</span>);
    else if (str || num) out.push(<span key={key++} className="text-code-str">{text}</span>);
    else if (fn) out.push(kw.has(fn) ? <span key={key++} className="text-code-kw">{text}</span> : <span key={key++} className="text-code-fn">{text}</span>);
    else if (word && kw.has(word)) out.push(<span key={key++} className="text-code-kw">{text}</span>);
    else out.push(text);
    last = idx + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
