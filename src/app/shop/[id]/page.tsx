import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { defaultOgImage, ProductRecord } from "@/lib/seo";
import ProductDetailClient from "./ProductDetailClient";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getProduct(id: string): Promise<ProductRecord | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, image, image_back, price")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "This product is currently unavailable.",
    };
  }

  const description =
    product.description ?? `Shop ${product.name} from IVFODI Clothing's luxury collection.`;
  const image = product.image ?? defaultOgImage;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: [
        {
          url: image,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [image],
    },
  };
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ProductDetailClient params={params} />;
}
