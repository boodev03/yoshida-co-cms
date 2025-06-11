"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category as CategoryType } from "@/services/category";
import { Plus } from "lucide-react";
import { useState } from "react";

interface CategoryProps {
  value?: string;
  onChange?: (category: string) => void;
  className?: string;
  categories: CategoryType[];
  onSaveCategory: (
    category: Omit<CategoryType, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
}

export default function Category({
  value,
  onChange,
  className,
  categories,
  onSaveCategory,
}: CategoryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const handleCategorySelect = (category: string) => {
    onChange?.(category);
  };

  const handleAddCategory = async () => {
    if (
      newCategory.trim() &&
      !categories.some((cat) => cat.category_name === newCategory.trim())
    ) {
      try {
        setIsSaving(true);
        await onSaveCategory({
          category_name: newCategory.trim(),
          type: "cases",
        });
        setNewCategory("");
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error saving category:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCategory();
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">カテゴリー</Label>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>新しいカテゴリーを追加</DialogTitle>
                <DialogDescription>
                  新しいカテゴリー名を入力してください。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="category-name"
                    className="text-sm font-medium"
                  >
                    カテゴリー名
                  </Label>
                  <Input
                    id="category-name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="カテゴリー名を入力"
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setNewCategory("");
                    }}
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleAddCategory}
                    disabled={
                      isSaving ||
                      !newCategory.trim() ||
                      categories.some(
                        (cat) => cat.category_name === newCategory.trim()
                      )
                    }
                  >
                    追加
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
      </div>
    </div>
  );
}
