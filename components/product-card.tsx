/* eslint-disable @next/next/no-img-element */
"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProductStore } from "@/stores/product-detail";
import { Product } from "@/types/product";
import { toast } from "sonner";

export default function ProductCard() {
  const { product, updateField } = useProductStore();
  const { cardDescription, thumbnail } = product;

  const handleChange = (field: keyof Product, value: string) => {
    updateField(field, value);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUploadAsBase64 = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Convert and store as base64
        const base64Image = await convertToBase64(file);
        handleChange("thumbnail", base64Image);
      } catch (error) {
        console.error("Error converting image to base64:", error);
        toast.error("Failed to process image");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="cardDescription" className="text-sm font-medium">
          Card Description
        </label>
        <Textarea
          id="cardDescription"
          value={cardDescription || ""}
          onChange={(e) => handleChange("cardDescription", e.target.value)}
          placeholder="Brief description for card view"
          className="w-full resize-vertical"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="thumbnail" className="text-sm font-medium">
          Thumbnail Image
        </label>
        <div className="relative" style={{ width: "300px" }}>
          <div className="h-full w-full relative">
            <div className="relative aspect-video size-full mt-2 group">
              {thumbnail ? (
                <>
                  <img
                    src={thumbnail}
                    alt="Thumbnail preview"
                    className="object-contain h-full w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-white text-black py-1 px-3 rounded text-sm">
                      Update Image
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUploadAsBase64}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  <label className="cursor-pointer text-gray-400 flex flex-col items-center">
                    <span>Click to upload image</span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUploadAsBase64}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
