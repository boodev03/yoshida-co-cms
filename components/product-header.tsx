"use client";

import { Input } from "@/components/ui/input";
import { useProductStore } from "@/stores/product-detail";
import { Product } from "@/types/product";

export default function ProductHeader() {
  const { product, updateField } = useProductStore();
  const { title, category } = product;

  const handleChange = (field: string, value: string) => {
    updateField(field as keyof Product, value);
  };

  return (
    <div className="space-y-5 pb-6 md:pb-8">
      <div className="relative">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input
          value={title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Enter title"
          className="bg-transparent !opacity-100 shadow-none text-jp-h2 transition-colors"
        />
      </div>
      <div className="flex items-center justify-end gap-4">
        <div className="relative">
          <Input
            value={category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="Category"
            className="w-32 text-sm h-9 leading-[1.625] tracking-[0.02em] transition-colors bg-transparent !opacity-100 shadow-none"
          />
        </div>
      </div>
    </div>
  );
}
