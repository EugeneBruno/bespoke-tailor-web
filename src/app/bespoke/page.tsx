import type { Metadata } from "next";
import BespokePageClient from "./BespokePageClient";

export const metadata: Metadata = {
  title: "Book Bespoke Tailoring",
  description:
    "Request a bespoke consultation with IVFODI Clothing and submit your measurements for custom luxury garments crafted in Nigeria.",
};

export default function BespokePage() {
  return <BespokePageClient />;
}
