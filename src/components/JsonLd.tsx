/**
 * 把一筆 schema.org 資料塞進 <script type="application/ld+json">。
 *
 * 內容都是站內自己的資料，但仍把 `<` 換成 <：這是 ld+json 的標準做法，
 * 確保任何一段文字都不可能提早關掉 <script> 標籤。
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
