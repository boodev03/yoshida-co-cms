/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProductStore } from "@/stores/product-detail";
import Image from "next/image";

export default function Title2() {
  const { product, updateField } = useProductStore();
  const {
    title2 = "",
    description2 = "",
    imageUrl2 = "",
    imageAlt2 = "",
  } = product;

  const handleChange = (field: string, value: string) => {
    updateField(field as any, value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleChange("imageUrl2", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mt-12 md:mt-20">
      <div className="flex flex-col md:flex-row md:items-center gap-8">
        <div className="space-y-4 md:space-y-6 flex-1">
          <label htmlFor="title2" className="text-sm font-medium">
            Paragraph 2
          </label>
          <Input
            value={title2}
            onChange={(e) => handleChange("title2", e.target.value)}
            placeholder="Enter title"
            className="text-base font-bold text-web-dark"
          />
          <Textarea
            value={description2}
            onChange={(e) => handleChange("description2", e.target.value)}
            placeholder="Enter description"
            className="min-h-[200px] text-base font-normal text-web-dark whitespace-pre-wrap resize-none"
          />
        </div>

        <div className="space-y-2 flex-1">
          <div className="aspect-video relative group">
            {imageUrl2 ? (
              <>
                <Image
                  src={imageUrl2}
                  alt={imageAlt2}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer bg-white text-black py-1 px-3 rounded text-sm">
                    Update Image
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
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
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
          <Input
            value={imageAlt2}
            onChange={(e) => handleChange("imageAlt2", e.target.value)}
            placeholder="Image alt text"
            className="text-base"
          />
        </div>
      </div>
    </div>
  );
}
