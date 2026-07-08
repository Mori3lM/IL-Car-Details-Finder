/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Security headers (CSP/HSTS/etc.) are added at the production-migration step
  // (05_BUILD_SPEC §6.4). Code is kept CSP-friendly from day one: no inline event
  // handlers, no eval, no dangerouslySetInnerHTML.
};

export default nextConfig;
