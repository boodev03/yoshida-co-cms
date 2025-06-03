"use client";

import SeoConfig from "@/components/seo-config";
import { Button } from "@/components/ui/button";
import { saveProduct } from "@/services/product-detail";
import { useProductStore } from "@/stores/product-detail";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProductCard from "../../components/product-card";
import ProductHeader from "../../components/product-header";
import ProductLinks from "../../components/product-links";
import ProductMainContent from "../../components/product-main-content";
import Title1 from "../../components/title-1";
import Title2 from "../../components/title-2";
import Title3 from "../../components/title-3";
import Video from "../../components/video";
import { useProduct } from "@/hooks/useProducts";

export default function ProductDetail() {
  const { product, setProduct, updateField } = useProductStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const params = useParams();
  const productId = params?.id as string;

  const { data: productData, isLoading, error } = useProduct(productId);

  useEffect(() => {
    if (productData) {
      setProduct(productData);
      console.log("Product loaded successfully:", productId);
    }
  }, [productData, productId, setProduct]);

  useEffect(() => {
    if (error) {
      console.error("Error loading product:", error);
      toast.error("Failed to load product");
    }
  }, [error]);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const productId = await saveProduct(product);
      console.log("Product published successfully with ID:", productId);
      toast.success("Product published successfully");
    } catch (error) {
      console.error("Error publishing product:", error);
      toast.error("Failed to publish product");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSeoSave = async (seoData: {
    metaTitle: string;
    metaKeywords: string;
    metaDescription: string;
    ogImage: string;
    ogTwitter: string;
  }) => {
    try {
      // Update local state
      updateField("metaTitle", seoData.metaTitle);
      updateField("metaKeywords", seoData.metaKeywords);
      updateField("metaDescription", seoData.metaDescription);
      updateField("ogImage", seoData.ogImage);
      updateField("ogTwitter", seoData.ogTwitter);

      // Use the same save method as handlePublish
      const productId = params?.id as string;
      if (productId) {
        await saveProduct({
          ...product,
          metaTitle: seoData.metaTitle,
          metaKeywords: seoData.metaKeywords,
          metaDescription: seoData.metaDescription,
          ogImage: seoData.ogImage,
          ogTwitter: seoData.ogTwitter,
        });
        toast.success("SEO settings saved to database");
      } else {
        toast.warning(
          "SEO settings updated locally only - publish to save permanently"
        );
      }

      setSeoOpen(false);
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      toast.error("Failed to save SEO settings to database");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto h-screen flex items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <section className="container mx-auto px-4 py-8 pb-20">
        <ProductHeader />
        <ProductCard />
        <ProductMainContent />
        <Video />
        <Title1 />
        <Title2 />
        <Title3 />
        <ProductLinks />
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="container mx-auto flex justify-end gap-4">
          <Button variant="outline" onClick={() => setSeoOpen(true)}>
            SEO Settings
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      <SeoConfig
        open={seoOpen}
        onOpenChange={setSeoOpen}
        onSave={handleSeoSave}
        initialData={{
          metaTitle: product.metaTitle,
          metaKeywords: product.metaKeywords,
          metaDescription: product.metaDescription,
          ogImage: product.ogImage,
          ogTwitter: product.ogTwitter,
        }}
      />
    </>
  );
}
