"use client";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProducts } from "@/hooks/useProducts";
import { deleteProduct } from "@/services/product";
import { saveProduct } from "@/services/product-detail";
import { reorderPosts } from "@/services/reorder";
import { Product } from "@/types/product";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowDown, Search, GripVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable row component
function SortableTableRow({
  product,
  isJapanese,
  deletingIds,
  openDeleteModal,
}: {
  product: Product;
  isJapanese: boolean;
  deletingIds: Set<number>;
  openDeleteModal: (product: Product) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <TableCell className="font-medium text-gray-900">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          {product.id}
        </div>
      </TableCell>
      <TableCell className="text-gray-700 max-w-48 whitespace-pre-wrap break-words">
        {product.title}
      </TableCell>
      <TableCell className="text-gray-700">{product.category}</TableCell>
      <TableCell className="text-gray-700">
        {isJapanese
          ? product.type === "cases"
            ? "事例"
            : product.type === "news"
            ? "ニュース"
            : product.type === "equipments"
            ? "設備"
            : product.type
          : product.type}
      </TableCell>
      <TableCell className="text-gray-600">
        {product.display_order || 0}
      </TableCell>
      <TableCell className="text-gray-600">
        {product.date.split("T")[0] || "未設定"}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href={`/cases/${product.id}`}>
              {isJapanese ? "表示" : "View"}
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDeleteModal(product)}
            disabled={deletingIds.has(product.id!)}
          >
            {isJapanese ? "削除" : "Delete"}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function Products() {
  const [searchTitle, setSearchTitle] = useState("");
  const [sort, setSort] = useState<"latest">("latest");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [lastSavedOrder, setLastSavedOrder] = useState<number[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const { language, isJapanese } = useLanguage();
  const router = useRouter();
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useProducts({
    searchTitle,
    sort,
    language,
    type: "cases", // Filter to only show cases type products
  });

  // Update local products when server data changes
  useEffect(() => {
    if (products) {
      setLocalProducts(products);
      setLastSavedOrder(products.map((p) => p.id));
    }
  }, [products]);

  // Check if current order differs from saved order
  const hasUnsavedChanges =
    JSON.stringify(localProducts.map((p) => p.id)) !==
    JSON.stringify(lastSavedOrder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag and drop reordering with optimistic updates
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !localProducts || active.id === over.id) return;

    const oldIndex = localProducts.findIndex((item) => item.id === active.id);
    const newIndex = localProducts.findIndex((item) => item.id === over.id);

    if (oldIndex !== newIndex) {
      // Optimistic update - immediately show the new order
      const reorderedItems = arrayMove(localProducts, oldIndex, newIndex);
      setLocalProducts(reorderedItems);

      try {
        setIsReordering(true);
        const postIds = reorderedItems.map((item) => item.id);

        // Debounced API call to avoid multiple rapid requests
        const timeoutId = setTimeout(async () => {
          try {
            await reorderPosts(postIds, "cases");
            // Update last saved order
            setLastSavedOrder(reorderedItems.map((item) => item.id));
            // Only refetch if there are no other pending changes
            if (!isReordering) {
              await refetch();
            }
            toast.success(
              isJapanese ? "順序を保存しました" : "Order saved successfully"
            );
          } catch (error) {
            console.error("Error reordering products:", error);
            toast.error(
              isJapanese ? "順序の更新に失敗しました" : "Failed to update order"
            );
            // Revert optimistic update on error
            setLocalProducts(products || []);
          }
        }, 500); // 500ms debounce

        // Cleanup timeout if component unmounts
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error("Error reordering products:", error);
        toast.error(
          isJapanese ? "順序の更新に失敗しました" : "Failed to update order"
        );
        // Revert optimistic update on error
        setLocalProducts(products || []);
      } finally {
        setIsReordering(false);
      }
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 text-center py-10">
        {isJapanese ? "製品の読み込みエラー: " : "Error loading products: "}
        {error.message}
      </div>
    );
  if (!products)
    return (
      <div className="text-gray-600 text-center py-10">
        {isJapanese ? "製品が見つかりません" : "No products found"}
      </div>
    );

  const handleSort = (sortType: "latest") => {
    setSort(sortType);
  };

  const handleCreateNewProduct = async () => {
    try {
      setIsCreating(true);
      // Create an empty product and get its ID
      const emptyProduct = {
        id: 0, // Will be set by database
        title: "",
        category: "",
        type: "cases" as const,
        thumbnail: "",
        sections: [],
        ogImage: "",
        ogTwitter: "",
        date: "",
        cardDescription: "",
        metaTitle: "",
        metaKeywords: "",
        metaDescription: "",
      } as Product;
      const productId = await saveProduct(emptyProduct, language);
      // Redirect to the product detail page
      router.push(`/cases/${productId}`);
    } catch (error) {
      console.error("Error creating new product:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      setDeletingIds((prev) => new Set(prev).add(productId));
      await deleteProduct(productId);
      toast.success(
        isJapanese
          ? "製品が正常に削除されました"
          : "Product deleted successfully"
      );
      refetch(); // Refresh the products list
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        isJapanese ? "製品の削除に失敗しました" : "Failed to delete product"
      );
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await handleDeleteProduct(productToDelete.id!);
      closeDeleteModal();
    }
  };

  return (
    <div className="space-y-4 container mx-auto py-10 flex flex-col flex-1">
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isJapanese ? "製品を検索..." : "Search products..."}
            className="pl-8 rounded-sm"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </div>
        {hasUnsavedChanges && (
          <Button
            variant="outline"
            onClick={() => {
              const postIds = localProducts.map((item) => item.id);
              reorderPosts(postIds, "cases")
                .then(() => {
                  setLastSavedOrder(postIds);
                  toast.success(
                    isJapanese
                      ? "順序を保存しました"
                      : "Order saved successfully"
                  );
                })
                .catch(() => {
                  toast.error(
                    isJapanese ? "保存に失敗しました" : "Failed to save"
                  );
                });
            }}
            disabled={isReordering}
          >
            {isJapanese ? "順序を保存" : "Save Order"}
          </Button>
        )}
        <Button onClick={handleCreateNewProduct} disabled={isCreating}>
          {isCreating
            ? isJapanese
              ? "作成中..."
              : "Creating..."
            : isJapanese
            ? "新しい製品を作成"
            : "Create New Product"}
        </Button>
      </div>

      {/* Product count summary */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {isJapanese
            ? `全${localProducts.length}件の製品`
            : `${localProducts.length} total products`}
        </div>
        {searchTitle && (
          <div className="text-sm text-gray-500">
            {isJapanese
              ? `"${searchTitle}"で検索中`
              : `Searching for "${searchTitle}"`}
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-sm overflow-hidden">
        {isReordering && (
          <div className="bg-blue-50 border-b border-blue-200 p-2 text-center text-blue-700 text-sm">
            {isJapanese ? "順序を更新中..." : "Updating order..."}
          </div>
        )}
        {hasUnsavedChanges && !isReordering && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-2 text-center text-yellow-700 text-sm">
            {isJapanese ? "変更を保存中..." : "Saving changes..."}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-100">
                <TableHead className="text-gray-900 font-semibold">
                  {isJapanese ? "ID" : "ID"}
                </TableHead>
                <TableHead className="text-gray-900 font-semibold">
                  {isJapanese ? "タイトル" : "Title"}
                </TableHead>
                <TableHead className="text-gray-900 font-semibold">
                  {isJapanese ? "カテゴリ" : "Category"}
                </TableHead>
                <TableHead className="text-gray-900 font-semibold">
                  {isJapanese ? "タイプ" : "Type"}
                </TableHead>
                <TableHead className="text-gray-900 font-semibold">
                  <div className="flex items-center gap-2">
                    {isJapanese ? "表示順" : "Display Order"}
                    {hasUnsavedChanges && (
                      <div
                        className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
                        title={isJapanese ? "未保存の変更" : "Unsaved changes"}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("latest")}
                  className="cursor-pointer text-gray-900 font-semibold hover:text-gray-700"
                >
                  {isJapanese ? "日付" : "Date"}
                  {sort === "latest" && (
                    <ArrowDown className="inline ml-1 h-4 w-4 text-gray-600" />
                  )}
                </TableHead>
                <TableHead className="text-gray-900 font-semibold">
                  {isJapanese ? "操作" : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localProducts.length > 0 ? (
                <SortableContext
                  items={localProducts.map((product) => product.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {localProducts.map((product) => (
                    <SortableTableRow
                      key={product.id}
                      product={product}
                      isJapanese={isJapanese}
                      deletingIds={deletingIds}
                      openDeleteModal={openDeleteModal}
                    />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    {isJapanese ? "製品が見つかりません" : "No products found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isJapanese ? "製品の削除確認" : "Confirm Product Deletion"}
            </DialogTitle>
            <DialogDescription>
              {isJapanese
                ? `「${
                    productToDelete?.title || ""
                  }」を削除してもよろしいですか？この操作は元に戻せません。`
                : `Are you sure you want to delete "${
                    productToDelete?.title || ""
                  }"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>
              {isJapanese ? "キャンセル" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingIds.has(productToDelete?.id ?? 0)}
            >
              {deletingIds.has(productToDelete?.id ?? 0)
                ? isJapanese
                  ? "削除中..."
                  : "Deleting..."
                : isJapanese
                ? "削除"
                : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
