import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ivfodi.com";//change to your real domain

  return [
    { url: base, priority: 1 },
    { url: `${base}/shop`, priority: 0.9 },
    { url: `${base}/bespoke`, priority: 0.8 },
    { url: `${base}/contact`, priority: 0.7 },
  ];
}