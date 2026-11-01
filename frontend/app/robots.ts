import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sschatbox.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/chat",
          "/chapter",
          "/textbooks",
          "/quiz",
          "/privacy",
          "/terms"
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/dashboard",
          "/settings/",
          "/settings",
          "/admin/",
          "/admin",
          "/login",
          "/signup"
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
