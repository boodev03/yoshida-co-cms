/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useProductStore } from "@/stores/product-detail";

export default function Title1() {
  const { product, updateField } = useProductStore();
  const { title1 = "", description1 = "" } = product;

  const handleChange = (field: string, value: string) => {
    updateField(field as any, value);
  };

  return (
    <div className="space-y-4 md:space-y-6 my-6 md:my-12">
      <div>
        <label htmlFor="title1" className="text-sm font-medium">
          Paragraph 1
        </label>
        <Input
          value={title1}
          onChange={(e) => handleChange("title1", e.target.value)}
          placeholder="Enter title"
          className="text-base font-bold mb-3 bg-transparent !opacity-100 shadow-none"
        />
      </div>

      <Textarea
        value={description1}
        onChange={(e) => handleChange("description1", e.target.value)}
        placeholder="Enter description"
        className="text-base font-normal text-web-dark whitespace-pre-wrap min-h-[160px] transition-colors border border-gray-300 shadow-sm"
      />
    </div>
  );
}
