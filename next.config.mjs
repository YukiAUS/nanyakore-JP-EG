/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ビルド時のTypeScript型エラーを無視して強制的にビルドを通す
    ignoreBuildErrors: true,
  },
  eslint: {
    // ビルド時のESLintチェックを無視する
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
