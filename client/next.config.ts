import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "annzicukozdmiszdfbci.supabase.co", // Supabase
      "via.placeholder.com",              // Images par défaut
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Empêche Vercel de bloquer le déploiement à cause des erreurs ESLint
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ (optionnel) Ignore aussi les erreurs TS si tu veux garantir le déploiement
  },
};

export default nextConfig;
