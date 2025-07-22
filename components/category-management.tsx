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
import {
  Category as CategoryType,
  deleteCategory,
  updateCategory,
} from "@/services/category";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CategoryManagementProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryType[];
  type: 'cases' | 'news' | 'equipments'; // Category type for this context
  onSaveCategory: (
    category: Omit<CategoryType, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onRefresh?: () => void;
}

export default function CategoryManagement({
  isOpen,
  onClose,
  categories,
  type,
  onSaveCategory,
  onRefresh,
}: CategoryManagementProps) {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleAddCategory = async () => {
    if (
      newCategory.trim() &&
      !categories.some((cat) => cat.category_name === newCategory.trim())
    ) {
      try {
        setIsSaving(true);
        await onSaveCategory({
          category_name: newCategory.trim(),
          type: type,
        });
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

  const handleUpdateCategory = async () => {
    if (
      editingCategory &&
      editingCategory.name.trim() &&
      !categories.some(
        (cat) =>
          cat.category_name === editingCategory.name.trim() &&
          cat.id !== editingCategory.id
      )
    ) {
      try {
        setIsSaving(true);
        await updateCategory(editingCategory.id, {
          category_name: editingCategory.name.trim(),
          type: type,
        });
        setEditingCategory(null);
        onRefresh?.();
        toast.success("Category updated successfully");
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error("Failed to update category");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsDeleting(categoryId);
      await deleteCategory(categoryId);
      onRefresh?.();
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingCategory) {
        handleUpdateCategory();
      } else {
        handleAddCategory();
      }
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
                  categories.some(
                    (cat) => cat.category_name === newCategory.trim()
                  )
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
                    key={category.id}
                    className="flex items-center gap-2 p-3 border rounded-lg"
                  >
                    {editingCategory?.id === category.id ? (
                      <>
                        <Input
                          value={editingCategory?.name}
                          onChange={(e) =>
                            setEditingCategory({
                              id: editingCategory?.id || "",
                              name: e.target.value,
                            })
                          }
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={handleUpdateCategory}
                          disabled={
                            isSaving ||
                            !editingCategory?.name.trim() ||
                            categories.some(
                              (cat) =>
                                cat.category_name ===
                                  editingCategory?.name.trim() &&
                                cat.id !== editingCategory?.id
                            )
                          }
                        >
                          保存
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCategory(null)}
                          disabled={isSaving}
                        >
                          キャンセル
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">
                          {category.category_name}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditingCategory({
                              id: category.id || "",
                              name: category.category_name,
                            })
                          }
                          disabled={isSaving || isDeleting !== null}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleDeleteCategory(category.id || "")
                          }
                          disabled={isSaving || isDeleting === category.id}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
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
