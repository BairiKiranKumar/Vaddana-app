import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the Craft System AGENTS.md. Next would otherwise append its own rules on `next dev`.
  agentRules: false,
};

export default nextConfig;
