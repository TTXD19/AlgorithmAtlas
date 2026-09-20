import type { ReactNode } from "react";

/** 課程程式碼支援的語言。分頁順序與名稱在 CodeTabs；每篇課程只需提供其中幾種。 */
export type Lang = "python" | "cpp" | "javascript" | "java" | "go";

export const LANG_LABEL: Record<Lang, string> = { python: "Python", cpp: "C++", javascript: "JavaScript", java: "Java", go: "Go" };

/** 分頁顯示順序 */
export const LANG_ORDER: Lang[] = ["python", "cpp", "javascript", "java", "go"];

const KEYWORDS: Record<Lang, Set<string>> = {
  python: new Set(["from", "import", "def", "return", "while", "for", "in", "if", "else", "elif", "not", "and", "or", "continue", "break", "set", "None", "True", "False", "reversed", "len", "class", "pass", "yield", "range", "enumerate", "dict", "list", "tuple", "sorted", "any", "max", "min", "sum"]),
  cpp: new Set(["#include", "int", "bool", "void", "const", "auto", "return", "while", "for", "if", "else", "true", "false", "std", "vector", "queue", "class", "struct", "template", "typename", "public", "static", "constexpr", "double", "char", "long", "size_t", "string", "unordered_map", "unordered_set", "list", "pair", "using", "nullptr", "continue", "break"]),
  javascript: new Set(["const", "let", "var", "function", "return", "while", "for", "of", "in", "if", "else", "true", "false", "null", "undefined", "new", "class", "this", "continue", "break", "export", "import", "from", "default", "typeof", "instanceof", "throw", "try", "catch", "async", "await", "yield", "Math", "Map", "Set", "Array", "Number", "Infinity"]),
  java: new Set(["import", "public", "private", "static", "final", "class", "interface", "void", "int", "long", "double", "boolean", "char", "String", "return", "while", "for", "if", "else", "true", "false", "null", "new", "this", "continue", "break", "throw", "throws", "try", "catch", "extends", "implements", "var", "List", "ArrayList", "Map", "HashMap", "Set", "HashSet", "Deque", "ArrayDeque", "Arrays", "Collections", "Integer", "Math"]),
  go: new Set(["package", "import", "func", "return", "var", "const", "type", "struct", "interface", "map", "chan", "range", "for", "if", "else", "switch", "case", "default", "break", "continue", "go", "defer", "select", "true", "false", "nil", "int", "int64", "string", "bool", "byte", "rune", "float64", "len", "cap", "append", "make", "new", "copy", "fmt", "sort", "math"]),
};

// C 家族共用：// 註解、字串（JS 多支援反引號）、數字、函式名、識別字
const C_LIKE = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(-?\b\d+\b)|(\b[A-Za-z_]\w*)(?=\()|(#?[A-Za-z_]\w*)/gm;

const RULES: Record<Lang, RegExp> = {
  python: /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\b)|(\b[A-Za-z_]\w*)(?=\()|(#?\b[A-Za-z_]\w*\b)/gm,
  cpp: /(\/\/.*$)|("(?:[^"\\]|\\.)*"|(?<=#include\s*)<[a-z_]+>)|(-?\b\d+\b)|(\b[A-Za-z_]\w*)(?=\()|(#?[A-Za-z_]\w*)/gm,
  javascript: /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(-?\b\d+\b)|(\b[A-Za-z_$]\w*)(?=\()|([A-Za-z_$]\w*)/gm,
  java: C_LIKE,
  go: /(\/\/.*$)|("(?:[^"\\]|\\.)*"|`[^`]*`|'(?:[^'\\]|\\.)*')|(-?\b\d+\b)|(\b[A-Za-z_]\w*)(?=\()|([A-Za-z_]\w*)/gm,
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
