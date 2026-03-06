import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact IVFODI Clothing",
  description:
    "Get in touch with IVFODI Clothing for order support, bespoke consultations, and luxury fashion inquiries from Lagos, Nigeria.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
