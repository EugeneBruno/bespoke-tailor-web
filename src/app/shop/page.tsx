import ShopClient from "./ShopClient";
import { Metadata } from "next";

export const metadata = {
  title: "Shop",
  description: "Explore luxury dresses, bespoke pieces and elegant designs.",
};



export default function Page() {
  return <ShopClient />;
}