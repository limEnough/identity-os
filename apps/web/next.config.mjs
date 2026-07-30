/** @type {import('next').NextConfig} */
const nextConfig = {
  // MFE 승격 후보 패키지들 — 경계는 패키지, 배포는 (아직) 하나
  transpilePackages: [
    '@identity-os/identity-core',
    '@identity-os/design-system',
    '@identity-os/feature-identity',
    '@identity-os/feature-style',
  ],
};

export default nextConfig;
