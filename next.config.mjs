/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
// GitHub Pages: /<repo-name>/ 配下に配信
const REPO = "lst-admin-prototype";

const nextConfig = {
  output: "export",
  // GitHub Pages 用 basePath / assetPrefix
  basePath: isProd ? `/${REPO}` : "",
  assetPrefix: isProd ? `/${REPO}/` : "",
  trailingSlash: true,
  images: { unoptimized: true },
  // GitHub Pages は .html を好むので trailingSlash=true で各 route をフォルダ化
};

export default nextConfig;
