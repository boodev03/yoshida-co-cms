/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProductStore } from "@/stores/product-detail";

export default function Title3() {
  const { product, updateField } = useProductStore();
  const { title3 = "", description3 = "" } = product;

  const handleChange = (field: string, value: string) => {
    updateField(field as any, value);
  };

  return (
    <div className="space-y-4 md:space-y-8 my-8 md:my-16">
      <div>
        <label htmlFor="title3" className="text-sm font-medium">
          Paragraph 3
        </label>
        <Input
          value={title3}
          onChange={(e) => handleChange("title3", e.target.value)}
          placeholder="Enter title"
          className="text-jp-h3 font-bold text-web-dark bg-transparent !opacity-100 shadow-none"
        />
      </div>

      <Textarea
        value={description3}
        onChange={(e) => handleChange("description3", e.target.value)}
        placeholder="Enter first paragraph"
        className="text-jp-p1 font-normal text-web-dark whitespace-pre-wrap min-h-[120px] bg-transparent !opacity-100 shadow-none resize-none"
      />
    </div>
  );
}
