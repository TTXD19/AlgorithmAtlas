import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * 全站都歡迎爬，並指出 sitemap 的位置。
 *
 * 沒有需要擋的路徑：全站都是靜態的公開課程內容，登入是 Supabase 的
 * client-side OAuth，沒有任何自己的 API 或後台路由。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
