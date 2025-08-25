"use client";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
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
import { useEquipments } from "@/hooks/useEquipments";
import { deleteEquipment } from "@/services/equipment";
import { saveEquipment } from "@/services/equipment";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/types/product";
import { ArrowDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Equipments() {
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTitle, setSearchTitle] = useState("");
  const [sort, setSort] = useState<"latest">("latest");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Product | null>(null);
  const { language, isJapanese } = useLanguage();
  const router = useRouter();
  const {
    data: equipments,
    isLoading,
    error,
    refetch,
  } = useEquipments({ 
    searchTitle, 
    sort, 
    language,
    type: 'equipments'
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 text-center py-10">
        {isJapanese ? "設備の読み込みエラー: " : "Error loading equipments: "}{error.message}
      </div>
    );
  if (!equipments)
    return (
      <div className="text-gray-600 text-center py-10">
        {isJapanese ? "設備が見つかりません" : "No equipments found"}
      </div>
    );

  // Calculate pagination
  const totalPages = Math.ceil(equipments.length / itemsPerPage);
  const paginatedEquipments = equipments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSort = (sortType: "latest") => {
    setSort(sortType);
  };

  const handleCreateNewEquipment = async () => {
    try {
      setIsCreating(true);
      // Create an empty equipment and get its ID
      const emptyEquipment = {
        id: 0, // Will be set by database
        title: "",
        category: "",
        type: 'equipments' as const,
        thumbnail: "",
        sections: [],
        ogImage: "",
        ogTwitter: "",
        date: "",
        cardDescription: "",
        metaTitle: "",
        metaKeywords: "",
        metaDescription: ""
      } as Product;
      const equipmentId = await saveEquipment(emptyEquipment, language);
      // Redirect to the equipment detail page
      router.push(`/equipments/${equipmentId}`);
    } catch (error) {
      console.error("Error creating new equipment:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEquipment = async (equipmentId: number) => {
    try {
      setDeletingIds((prev) => new Set(prev).add(equipmentId));
      await deleteEquipment(equipmentId);
      toast.success(isJapanese ? "設備が正常に削除されました" : "Equipment deleted successfully");
      refetch(); // Refresh the equipments list
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error(isJapanese ? "設備の削除に失敗しました" : "Failed to delete equipment");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(equipmentId);
        return newSet;
      });
    }
  };

  const openDeleteModal = (equipment: Product) => {
    setEquipmentToDelete(equipment);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setEquipmentToDelete(null);
  };

  const confirmDelete = async () => {
    if (equipmentToDelete) {
      await handleDeleteEquipment(equipmentToDelete.id!);
      closeDeleteModal();
    }
  };

  return (
    <div className="space-y-4 container mx-auto py-10 flex flex-col flex-1">
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isJapanese ? "設備を検索..." : "Search equipments..."}
            className="pl-8 rounded-sm"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateNewEquipment} disabled={isCreating}>
          {isCreating 
            ? (isJapanese ? "作成中..." : "Creating...") 
            : (isJapanese ? "新しい設備を作成" : "Create New Equipment")
          }
        </Button>
      </div>

      <div className="border border-gray-200 rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-100">
              <TableHead className="text-gray-900 font-semibold">ID</TableHead>
              <TableHead className="text-gray-900 font-semibold w-48">
                {isJapanese ? "タイトル" : "Title"}
              </TableHead>
              <TableHead className="text-gray-900 font-semibold">
                {isJapanese ? "カテゴリー" : "Category"}
              </TableHead>
              <TableHead className="text-gray-900 font-semibold">
                {isJapanese ? "タイプ" : "Type"}
              </TableHead>
              <TableHead
                onClick={() => handleSort("latest")}
                className="cursor-pointer text-gray-900 font-semibold hover:text-gray-700"
              >
                {isJapanese ? "更新日" : "Updated At"}
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
            {paginatedEquipments.length > 0 ? (
              paginatedEquipments.map((equipment) => (
                <TableRow key={equipment.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {equipment.id}
                  </TableCell>
                  <TableCell className="text-gray-700 max-w-48 whitespace-pre-wrap break-words">
                    {equipment.title}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {equipment.category}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {isJapanese ? 
                      (equipment.type === 'cases' ? '事例' : 
                       equipment.type === 'news' ? 'ニュース' : 
                       equipment.type === 'equipments' ? '設備' : equipment.type) 
                      : equipment.type}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(equipment.updatedAt || 0).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={`/equipments/${equipment.id}`}>
                          {isJapanese ? "表示" : "View"}
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(equipment)}
                        disabled={deletingIds.has(equipment.id!)}
                      >
                        {isJapanese ? "削除" : "Delete"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {isJapanese ? "設備が見つかりません" : "No equipments found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              isActive={false}
              aria-disabled={page === 1}
              className={`rounded-sm border-gray-200 hover:bg-gray-50 hover:text-gray-700 ${
                page === 1 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => setPage(pageNum)}
                  isActive={page === pageNum}
                  className={`rounded-sm border-gray-200 hover:bg-gray-50 hover:text-gray-700 ${
                    page === pageNum
                      ? "bg-primary text-white hover:bg-primary/90 hover:text-white"
                      : ""
                  }`}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationLink
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              isActive={false}
              aria-disabled={page === totalPages}
              className={`rounded-sm border-gray-200 hover:bg-gray-50 hover:text-gray-700 ${
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isJapanese ? "設備の削除確認" : "Confirm Equipment Deletion"}
            </DialogTitle>
            <DialogDescription>
              {isJapanese
                ? `「${equipmentToDelete?.title || ""}」を削除してもよろしいですか？この操作は元に戻せません。`
                : `Are you sure you want to delete "${equipmentToDelete?.title || ""}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>
              {isJapanese ? "キャンセル" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingIds.has(equipmentToDelete?.id!)}
            >
              {deletingIds.has(equipmentToDelete?.id!)
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
