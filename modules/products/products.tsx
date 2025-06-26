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
import { useProducts } from "@/hooks/useProducts";
import { deleteProduct } from "@/services/product";
import { saveProduct } from "@/services/product-detail";
import { Product } from "@/types/product";
import { ArrowDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Products() {
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTitle, setSearchTitle] = useState("");
  const [sort, setSort] = useState<"latest">("latest");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useProducts({ searchTitle, sort });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 text-center py-10">
        Error loading products: {error.message}
      </div>
    );
  if (!products)
    return (
      <div className="text-gray-600 text-center py-10">No products found</div>
    );

  // Calculate pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSort = (sortType: "latest") => {
    setSort(sortType);
  };

  const handleCreateNewProduct = async () => {
    try {
      setIsCreating(true);
      // Create an empty product and get its ID
      const emptyProduct = {
        title: "",
        category: "",
      } as Product;
      const productId = await saveProduct(emptyProduct);
      // Redirect to the product detail page
      router.push(`/cases/${productId}`);
    } catch (error) {
      console.error("Error creating new product:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setDeletingIds((prev) => new Set(prev).add(productId));
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
      refetch(); // Refresh the products list
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-4 container mx-auto py-10 flex flex-col flex-1">
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8 rounded-sm"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateNewProduct} disabled={isCreating}>
          {isCreating ? "Creating..." : "Create New Product"}
        </Button>
      </div>

      <div className="border border-gray-200 rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-100">
              <TableHead className="text-gray-900 font-semibold">ID</TableHead>
              <TableHead className="text-gray-900 font-semibold">
                Title
              </TableHead>
              <TableHead className="text-gray-900 font-semibold">
                Category
              </TableHead>
              <TableHead
                onClick={() => handleSort("latest")}
                className="cursor-pointer text-gray-900 font-semibold hover:text-gray-700"
              >
                Updated At
                {sort === "latest" && (
                  <ArrowDown className="inline ml-1 h-4 w-4 text-gray-600" />
                )}
              </TableHead>
              <TableHead className="text-gray-900 font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {product.id}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {product.title}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {product.category}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(product.updatedAt || 0).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={`/cases/${product.id}`}>View</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id!)}
                        disabled={deletingIds.has(product.id!)}
                      >
                        {deletingIds.has(product.id!)
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No products found
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
    </div>
  );
}
