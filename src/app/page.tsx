import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Luxury Bespoke Fashion in Nigeria",
  description:
    "Explore IVFODI Clothing's luxury Nigerian fashion experience with premium ready-to-wear collections and personalized bespoke tailoring.",
};

export default function HomePage() {
  return <HomePageClient />;
}
