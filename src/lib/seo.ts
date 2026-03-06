export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ivfodi.com";

export const defaultOgImage = "/og-image.jpg";

export const brandName = "IVFODI Clothing";

export const defaultKeywords = [
  "Nigerian bespoke fashion",
  "luxury fashion Nigeria",
  "Lagos fashion designer",
  "ready-to-wear Nigeria",
  "custom made dresses",
  "African couture",
  "bespoke tailoring Lagos",
  "women's fashion Nigeria",
];

export type ProductRecord = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  image_back: string | null;
  price: string | null;
};

export function extractNumericPrice(price: string | null): number {
  if (!price) return 0;

  const parsed = Number.parseFloat(price.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}
