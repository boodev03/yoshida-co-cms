"use client";

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
import { saveProduct } from "@/services/product-detail";
import { Product } from "@/types/product";
import { ArrowDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Products() {
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTitle, setSearchTitle] = useState("");
  const [sort, setSort] = useState<"latest">("latest");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const {
    data: products,
    isLoading,
    error,
  } = useProducts({ searchTitle, sort });

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products: {error.message}</div>;
  if (!products) return <div>No products found</div>;

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

  return (
    <div className="space-y-4 container mx-auto py-10 flex flex-col flex-1">
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateNewProduct} disabled={isCreating}>
          {isCreating ? "Creating..." : "Create New Product"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead
              onClick={() => handleSort("latest")}
              className="cursor-pointer"
            >
              Updated At
              {sort === "latest" && (
                <ArrowDown className="inline ml-1 h-4 w-4" />
              )}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.id}</TableCell>
              <TableCell>{product.title}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                {new Date(product.updatedAt || 0).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button asChild size="sm">
                  <Link href={`/cases/${product.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              isActive={false}
              aria-disabled={page === 1}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
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
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
