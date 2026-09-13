/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Почему без rewrites: фронт ходит на бэкенд напрямую через NEXT_PUBLIC_API_URL,
  // CORS настроен на стороне Fastify. Это проще при раздельном деплое.
}

module.exports = nextConfig
