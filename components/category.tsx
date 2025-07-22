"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category as CategoryType } from "@/services/category";
import { Settings } from "lucide-react";
import { useState } from "react";
import CategoryManagement from "./category-management";

interface CategoryProps {
  value?: string;
  onChange?: (category: string) => void;
  className?: string;
  type: 'cases' | 'news' | 'equipments'; // Category type for this context
  categories: CategoryType[];
  onSaveCategory: (
    category: Omit<CategoryType, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onUpdateCategory?: (
    categoryId: string,
    category: Omit<CategoryType, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
}

export default function Category({
  value,
  onChange,
  className,
  type,
  categories,
  onSaveCategory,
}: CategoryProps) {
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  const handleCategorySelect = (category: string) => {
    onChange?.(category);
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">カテゴリー</Label>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsManagementOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <Select value={value} onValueChange={handleCategorySelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="カテゴリーを選択してください" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.category_name}>
                {category.category_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <CategoryManagement
          isOpen={isManagementOpen}
          onClose={() => setIsManagementOpen(false)}
          categories={categories}
          type={type}
          onSaveCategory={onSaveCategory}
        />
      </div>
    </div>
  );
}
