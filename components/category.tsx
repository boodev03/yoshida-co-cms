"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Settings, X } from "lucide-react";
import { useState, useEffect } from "react";
import CategoryManagement from "./category-management";

interface CategoryProps {
  value?: string;
  onChange?: (category: string) => void;
  className?: string;
  categories: string[];
  onSaveCategory: (categoryName: string) => Promise<void>;
}

export default function Category({
  value,
  onChange,
  className,
  categories,
  onSaveCategory,
}: CategoryProps) {
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    value ? value.split(',').map(cat => cat.trim()).filter(Boolean) : []
  );
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Sync selectedCategories with value prop changes
  useEffect(() => {
    const newCategories = value ? value.split(',').map(cat => cat.trim()).filter(Boolean) : [];
    setSelectedCategories(newCategories);
  }, [value]);

  const handleAddCategory = (categoryName: string) => {
    if (categoryName && !selectedCategories.includes(categoryName)) {
      const updated = [...selectedCategories, categoryName];
      setSelectedCategories(updated);
      onChange?.(updated.join(', '));
    }
  };

  const handleRemoveCategory = (categoryName: string) => {
    const updated = selectedCategories.filter(cat => cat !== categoryName);
    setSelectedCategories(updated);
    onChange?.(updated.join(', '));
  };

  const handleAddNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed && !selectedCategories.includes(trimmed)) {
      handleAddCategory(trimmed);
      setNewCategoryInput('');
      // Also add to available categories
      onSaveCategory(trimmed);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewCategory();
    }
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

        {/* Selected Categories as Chips */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <div
                key={category}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border"
              >
                <span>{category}</span>
                <button
                  onClick={() => handleRemoveCategory(category)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Category from Existing */}
        <Select onValueChange={handleAddCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="既存のカテゴリーから選択..." />
          </SelectTrigger>
          <SelectContent>
            {categories
              .filter(cat => !selectedCategories.includes(cat))
              .map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Add New Category */}
        <div className="flex gap-2">
          <Input
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="新しいカテゴリーを追加..."
            className="flex-1"
          />
          <Button
            onClick={handleAddNewCategory}
            disabled={!newCategoryInput.trim() || selectedCategories.includes(newCategoryInput.trim())}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <CategoryManagement
          isOpen={isManagementOpen}
          onClose={() => setIsManagementOpen(false)}
          categories={categories}
          onSaveCategory={onSaveCategory}
        />
      </div>
    </div>
  );
}
