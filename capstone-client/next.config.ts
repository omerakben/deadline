// Next.js config
import path from "path";

// Only use workspace root for local development
const isDev = process.env.NODE_ENV === "development";
const workspaceRoot = isDev ? path.join(__dirname, "..") : undefined;

const config = {
  ...(workspaceRoot && { outputFileTracingRoot: workspaceRoot }),
  ...(isDev &&
    workspaceRoot && {
      turbopack: {
        root: workspaceRoot,
      },
    }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons",
      },
    ],
  },
};

export default config;
