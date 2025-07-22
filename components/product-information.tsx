/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Category as CategoryType } from "@/services/category";
import { uploadFile } from "@/services/upload";
import { useProductStore } from "@/stores/product-detail";
import { Trash2, Upload } from "lucide-react";
import Category from "./category";

interface ProductInformationProps {
  className?: string;
  type: 'cases' | 'news' | 'equipments'; // Category type for this context
  categories: CategoryType[];
  onSaveCategory: (
    category: Omit<CategoryType, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
}

export default function ProductInformation({
  className,
  type,
  categories,
  onSaveCategory,
}: ProductInformationProps) {
  const { product, updateField } = useProductStore();

  const handleImageUpload = async (file: File) => {
    try {
      const publicUrl = await uploadFile({
        file,
        type: "image"
      });
      updateField("thumbnail", publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const removeImage = () => {
    updateField("thumbnail", "");
  };

  return (
    <div className={className}>
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                タイトル
              </Label>
              <Input
                id="title"
                value={product.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="タイトルを入力してください"
                className="w-full"
              />
            </div>

            {/* Category */}
            <Category
              value={product.category}
              onChange={(category) => updateField("category", category)}
              type={type}
              categories={categories}
              onSaveCategory={onSaveCategory}
            />

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                説明
              </Label>
              <Textarea
                id="description"
                value={product.cardDescription}
                onChange={(e) => updateField("cardDescription", e.target.value)}
                placeholder="商品説明を入力してください"
                className="w-full min-h-[120px] resize-none"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">画像</Label>
              {product.thumbnail ? (
                <div className="relative group">
                  <div className="aspect-video rounded-sm overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    onClick={removeImage}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-sm cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">クリックして</span>{" "}
                      ドラッグ&ドロップまたはファイルアップロード
                    </p>
                    <p className="text-xs text-gray-500">
                      最大10MBまでPNG, JPG, GIF形式
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
