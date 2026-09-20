import type { Comparison } from "@/lib/compare";

export const string: Comparison = {
  title: { "zh-Hant": "字串比對演算法比較", en: "String matching algorithms compared" },
  description: {
    "zh-Hant": "字串雜湊、Rabin-Karp、KMP、Z 演算法、Manacher、字典樹：預處理誰、保證什麼、各自擅長的問題形狀。",
    en: "String hashing, Rabin-Karp, KMP, the Z algorithm, Manacher and tries: what each preprocesses, what it guarantees, and the problem shape each is built for.",
  },
  columns: [
    { key: "pre", label: { "zh-Hant": "預處理", en: "Preprocesses" } },
    { key: "guarantee", label: { "zh-Hant": "保證", en: "Guarantee" } },
    { key: "shape", label: { "zh-Hant": "問題形狀", en: "Problem shape" } },
  ],
  rows: [
    {
      sub: "hashing",
      cells: {
        pre: { "zh-Hant": "文字（前綴雜湊）", en: "Text (prefix hashes)" },
        guarantee: { "zh-Hant": "機率正確", en: "Probabilistic" },
        shape: { "zh-Hant": "任意子字串 O(1) 比較", en: "Any two substrings compared in O(1)" },
      },
      pick: { "zh-Hant": "要比很多對子字串是否相等、找最長重複子字串、配合二分。用雙模數把碰撞機率壓到可忽略。", en: "Comparing many substring pairs, longest repeated substring, or pairing with binary search. Use two moduli to make collisions negligible." },
    },
    {
      sub: "rabin-karp",
      cells: {
        pre: { "zh-Hant": "模式（一個雜湊值）", en: "Pattern (one hash)" },
        guarantee: { "zh-Hant": "平均 O(n+m)", en: "Average O(n+m)" },
        shape: { "zh-Hant": "多個模式同時找", en: "Several patterns at once" },
      },
      pick: { "zh-Hant": "同時找很多個等長模式（抄襲比對、病毒特徵）：把所有模式的雜湊放進集合，滾動一遍文字。單一模式沒有比 KMP 好。", en: "Many equal-length patterns at once (plagiarism, signatures): put every pattern hash in a set and roll over the text once. For one pattern it is no better than KMP." },
    },
    {
      sub: "kmp",
      cells: {
        pre: { "zh-Hant": "模式（失敗函數）", en: "Pattern (failure function)" },
        guarantee: { "zh-Hant": "最壞 O(n+m)", en: "Worst case O(n+m)" },
        shape: { "zh-Hant": "單一模式、串流文字", en: "One pattern, streaming text" },
      },
      pick: { "zh-Hant": "單一模式的標準答案，文字可以一個字一個字餵進來（不必整段在記憶體）。失敗函數本身也能算週期、最短回文補齊。", en: "The standard answer for one pattern; the text can be streamed one character at a time. The failure function also yields periods and shortest palindromic completions." },
    },
    {
      sub: "z-algo",
      cells: {
        pre: { "zh-Hant": "模式 + 文字（串接）", en: "Pattern + text (concatenated)" },
        guarantee: { "zh-Hant": "最壞 O(n+m)", en: "Worst case O(n+m)" },
        shape: { "zh-Hant": "每個位置的最長前綴匹配", en: "Longest prefix match at every position" },
      },
      pick: { "zh-Hant": "問「每個位置往後能和開頭匹配多長」時比 KMP 直觀：字串週期、最短重複單元、前綴出現次數。", en: "When the question is 'how far does each position match the start': string periods, smallest repeating unit, prefix occurrence counts. More direct than KMP for these." },
    },
    {
      sub: "manacher",
      cells: {
        pre: { "zh-Hant": "文字（插入分隔符）", en: "Text (with separators)" },
        guarantee: { "zh-Hant": "O(n)", en: "O(n)" },
        shape: { "zh-Hant": "回文", en: "Palindromes" },
      },
      pick: { "zh-Hant": "最長回文子字串、以每個中心的回文半徑、回文子字串計數。只管回文，其他什麼都不做。", en: "Longest palindromic substring, palindrome radius at every centre, counting palindromic substrings. It does palindromes and nothing else." },
    },
    {
      sub: "trie-apps",
      cells: {
        pre: { "zh-Hant": "字典（所有模式）", en: "Dictionary (all patterns)" },
        guarantee: { "zh-Hant": "O(L) 每次查詢", en: "O(L) per query" },
        shape: { "zh-Hant": "前綴查詢、字典比對", en: "Prefix queries, dictionary lookups" },
      },
      pick: { "zh-Hant": "自動補全、以前綴計數、判斷一個字能否由字典拼出。模式集合固定、查詢很多次時最划算。", en: "Autocomplete, counting by prefix, whether a word can be built from a dictionary. Best when the pattern set is fixed and queried many times." },
    },
  ],
  guide: [
    { "zh-Hant": "**一個模式、一段文字** → KMP。要簡單一點可以用內建 `find`／`strstr`，它們通常也是線性的。", en: "**One pattern, one text** → KMP. For something simpler use the built-in `find` / `strstr`; they are usually linear too." },
    { "zh-Hant": "**很多模式** → 等長用 Rabin-Karp 的雜湊集合；不等長且要一次全找出來，是 Aho-Corasick（字典樹 + KMP 的合體，本站未收錄）。", en: "**Many patterns** → equal lengths: a Rabin-Karp hash set; mixed lengths found in one pass: Aho-Corasick (a trie plus KMP, not covered on this site)." },
    { "zh-Hant": "**子字串相等、重複、比較** → 字串雜湊。它是唯一能 O(1) 比較任意兩段的方法，代價是機率正確。", en: "**Substring equality, repeats, comparisons** → string hashing, the only O(1) way to compare two arbitrary substrings, at the price of being probabilistic." },
    { "zh-Hant": "**回文** → Manacher。中心擴展 O(n²) 在 n ≤ 1000 也夠用，先寫得對再換。", en: "**Palindromes** → Manacher. Centre expansion at O(n²) is fine for n ≤ 1000; get it right first, then switch." },
    { "zh-Hant": "**前綴** → 字典樹。**後綴或任意子字串的結構問題** → 後綴陣列／後綴自動機（本站未收錄）。", en: "**Prefixes** → a trie. **Suffixes or arbitrary substring structure** → suffix arrays or suffix automata (not covered on this site)." },
  ],
};
