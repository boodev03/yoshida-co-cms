"use client";

import Gallery from "@/components/gallery";
import NormalContent from "@/components/normal-content";
import ProductInformation from "@/components/product-information";
import SeoConfig from "@/components/seo-config";
import TextContent from "@/components/text-content";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Video from "@/components/video";
import { useCategoriesByType } from "@/hooks/useCategory";
import { useEquipment } from "@/hooks/useEquipments";
import { Category, saveCategory } from "@/services/category";
import { saveEquipment } from "@/services/equipment";
import { useProductStore } from "@/stores/product-detail";
import { ContentSection } from "@/types/product";
import { Loader2, Plus, MoveUp, MoveDown, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EquipmentDetail() {
  const {
    product,
    setProduct,
    addSection,
    removeSection,
    moveSectionUp,
    moveSectionDown,
    updateField,
  } = useProductStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const params = useParams();
  const equipmentId = params?.id as string;

  const { data: equipmentData, isLoading, error } = useEquipment(equipmentId);
  const { data: categories, refetch } = useCategoriesByType("equipments");

  useEffect(() => {
    console.log("equipmentData", equipmentData);
    if (equipmentData) {
      setProduct(equipmentData);
      console.log("Equipment loaded successfully:", equipmentId);
    }
  }, [equipmentData, equipmentId, setProduct]);

  useEffect(() => {
    if (error) {
      console.error("Error loading equipment:", error);
      toast.error("Failed to load equipment");
    }
  }, [error]);

  const handleAddSection = (type: ContentSection["type"]) => {
    addSection(type);
  };

  const renderSection = (section: { id: string; type: string }) => {
    switch (section.type) {
      case "gallery":
        return <Gallery key={section.id} sectionId={section.id} />;
      case "normal":
        return <NormalContent key={section.id} sectionId={section.id} />;
      case "text-content":
        return <TextContent sectionId={section.id} key={section.id} />;
      case "video":
        return <Video />;
      default:
        return null;
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);

      // Prepare data for Firebase
      const firebaseData = {
        ...product,
        sections: (product.sections || [])
          .sort((a, b) => a.order - b.order)
          .map((section) => ({
            id: section.id,
            type: section.type,
            order: section.order,
            data: section.data,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt,
          })),
        updatedAt: Date.now(),
      };

      console.log("Publishing equipment to Firebase:", firebaseData);

      // Call Firebase save function
      const savedEquipmentId = await saveEquipment(firebaseData);
      console.log(
        "Equipment published successfully with ID:",
        savedEquipmentId
      );
      toast.success("Equipment published successfully");
    } catch (error) {
      console.error("Error publishing equipment:", error);
      toast.error("Failed to publish equipment");
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
      updateField("metaTitle", seoData.metaTitle);
      updateField("metaKeywords", seoData.metaKeywords);
      updateField("metaDescription", seoData.metaDescription);
      updateField("ogImage", seoData.ogImage);
      updateField("ogTwitter", seoData.ogTwitter);

      const equipmentId = params?.id as string;
      if (equipmentId) {
        await saveEquipment({
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

  const handleSaveCategory = async (
    category: Omit<Category, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await saveCategory(category);
      refetch();
      toast.success("Category saved successfully");
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto h-screen flex items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }

  const sections = product?.sections || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductInformation
        categories={categories || []}
        onSaveCategory={handleSaveCategory}
      />

      <div className="space-y-4">
        {sections.length > 0 &&
          sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <div key={section.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {section.type.toUpperCase()} #{section.order + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveSectionUp(section.id)}
                      disabled={index === 0}
                    >
                      <MoveUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveSectionDown(section.id)}
                      disabled={index === sections.length - 1}
                    >
                      <MoveDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeSection(section.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {renderSection(section)}
              </div>
            ))}
      </div>

      {/* Add Section Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="container mx-auto flex justify-end gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                新しいセクションを追加
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAddSection("gallery")}>
                ギャラリー
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAddSection("text-content")}
              >
                タイトルコンテンツ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSection("normal")}>
                通常コンテンツ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSection("video")}>
                動画
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            onClick={() => setSeoOpen(true)}
            disabled={isPublishing}
          >
            SEO設定
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? "公開中..." : "公開"}
          </Button>
        </div>
      </div>

      <SeoConfig
        open={seoOpen}
        onOpenChange={setSeoOpen}
        onSave={handleSeoSave}
        initialData={{
          metaTitle: product?.metaTitle || "",
          metaKeywords: product?.metaKeywords || "",
          metaDescription: product?.metaDescription || "",
          ogImage: product?.ogImage || "",
          ogTwitter: product?.ogTwitter || "",
        }}
      />
    </div>
  );
}
