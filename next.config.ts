import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // 沒有把 mdx 加進 pageExtensions：課文的 .mdx 是被 import 的內容，
  // 不是路由本身，加了反而會讓 src/app 底下的 .mdx 變成頁面。
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
