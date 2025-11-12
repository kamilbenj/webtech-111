import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "annzicukozdmiszdfbci.supabase.co", // ton domaine Supabase
      "via.placeholder.com",              // domaine pour les affiches par défaut
    ],
  },
};

export default nextConfig;
