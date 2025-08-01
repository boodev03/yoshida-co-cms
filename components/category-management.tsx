"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CategoryManagementProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onSaveCategory: (categoryName: string) => Promise<void>;
}

export default function CategoryManagement({
  isOpen,
  onClose,
  categories,
  onSaveCategory,
}: CategoryManagementProps) {
  const [newCategory, setNewCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCategory = async () => {
    if (
      newCategory.trim() &&
      !categories.includes(newCategory.trim())
    ) {
      try {
        setIsSaving(true);
        await onSaveCategory(newCategory.trim());
        setNewCategory("");
        toast.success("Category added successfully");
      } catch (error) {
        console.error("Error saving category:", error);
        toast.error("Failed to add category");
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>カテゴリー管理</DialogTitle>
          <DialogDescription>
            カテゴリーの追加、編集、削除を行えます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add New Category Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <Label className="text-sm font-medium">
                新しいカテゴリーを追加
              </Label>
            </div>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="カテゴリー名を入力"
                className="flex-1"
              />
              <Button
                onClick={handleAddCategory}
                disabled={
                  isSaving ||
                  !newCategory.trim() ||
                  categories.includes(newCategory.trim())
                }
              >
                追加
              </Button>
            </div>
          </div>

          {/* Existing Categories Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">既存のカテゴリー</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  カテゴリーがありません
                </p>
              ) : (
                categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center gap-2 p-3 border rounded-lg"
                  >
                    <span className="flex-1 text-sm">
                      {category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
