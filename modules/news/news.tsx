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
import { useNews } from "@/hooks/useNews";
import { deleteNews } from "@/services/news";
import { saveNews } from "@/services/news";
import { Product } from "@/types/product";
import { ArrowDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function News() {
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTitle, setSearchTitle] = useState("");
  const [sort, setSort] = useState<"latest">("latest");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const {
    data: news,
    isLoading,
    error,
    refetch,
  } = useNews({ searchTitle, sort });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 text-center py-10">
        Error loading news: {error.message}
      </div>
    );
  if (!news)
    return <div className="text-gray-600 text-center py-10">No news found</div>;

  // Calculate pagination
  const totalPages = Math.ceil(news.length / itemsPerPage);
  const paginatedNews = news.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSort = (sortType: "latest") => {
    setSort(sortType);
  };

  const handleCreateNewNews = async () => {
    try {
      setIsCreating(true);
      // Create an empty news and get its ID
      const emptyNews = {
        title: "",
        category: "",
      } as Product;
      const newsId = await saveNews(emptyNews);
      // Redirect to the news detail page
      router.push(`/news/${newsId}`);
    } catch (error) {
      console.error("Error creating new news:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    try {
      setDeletingIds((prev) => new Set(prev).add(newsId));
      await deleteNews(newsId);
      toast.success("News deleted successfully");
      refetch(); // Refresh the news list
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Failed to delete news");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(newsId);
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
            placeholder="Search news..."
            className="pl-8 rounded-sm"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateNewNews} disabled={isCreating}>
          {isCreating ? "Creating..." : "Create New News"}
        </Button>
      </div>

      <div className="border border-gray-200 rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-100">
              <TableHead className="text-gray-900 font-semibold">ID</TableHead>
              <TableHead className="text-gray-900 font-semibold w-48">
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
            {paginatedNews.length > 0 ? (
              paginatedNews.map((newsItem) => (
                <TableRow key={newsItem.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {newsItem.id}
                  </TableCell>
                  <TableCell className="text-gray-700 max-w-48 whitespace-pre-wrap break-words">
                    {newsItem.title}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {newsItem.category}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(newsItem.updatedAt || 0).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={`/news/${newsItem.id}`}>View</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteNews(newsItem.id!)}
                        disabled={deletingIds.has(newsItem.id!)}
                      >
                        {deletingIds.has(newsItem.id!)
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
                  No news found
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
