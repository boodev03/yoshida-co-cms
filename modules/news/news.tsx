// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
// } from "@/components/ui/pagination";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { useNews } from "@/hooks/useNews";
// import { saveNews } from "@/services/news";
// import { Product } from "@/types/product";
// import { ArrowDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function News() {
//   const [page, setPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [searchTitle, setSearchTitle] = useState("");
//   const [sort, setSort] = useState<"latest">("latest");
//   const [isCreating, setIsCreating] = useState(false);
//   const router = useRouter();
//   const { data: news, isLoading, error } = useNews({ searchTitle, sort });

//   if (isLoading) return <div>Loading news...</div>;
//   if (error) return <div>Error loading news: {error.message}</div>;

//   // Calculate pagination
//   const totalPages =
//     news && news.length > 0 ? Math.ceil(news.length / itemsPerPage) : 1;

//   const paginatedNews =
//     news && news.length > 0
//       ? news.slice((page - 1) * itemsPerPage, page * itemsPerPage)
//       : [];

//   const handleSort = (sortType: "latest") => {
//     setSort(sortType);
//   };

//   const handleCreateNewNews = async () => {
//     try {
//       setIsCreating(true);
//       // Create an empty news and get its ID
//       const emptyNews = {
//         title: "",
//         category: "",
//       } as Product;
//       const newsId = await saveNews(emptyNews);
//       // Redirect to the news detail page
//       router.push(`/news/${newsId}`);
//     } catch (error) {
//       console.error("Error creating new news:", error);
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   return (
//     <div className="space-y-4 container mx-auto py-10 flex flex-col flex-1">
//       <div className="flex gap-4 mb-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search news..."
//             className="pl-8"
//             value={searchTitle}
//             onChange={(e) => setSearchTitle(e.target.value)}
//           />
//         </div>
//         <Button onClick={handleCreateNewNews} disabled={isCreating}>
//           {isCreating ? "Creating..." : "Create New News"}
//         </Button>
//       </div>

//       <div className="flex-1 flex flex-col">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>ID</TableHead>
//               <TableHead>Title</TableHead>
//               <TableHead>Category</TableHead>
//               <TableHead
//                 onClick={() => handleSort("latest")}
//                 className="cursor-pointer"
//               >
//                 Updated At
//                 {sort === "latest" && (
//                   <ArrowDown className="inline ml-1 h-4 w-4" />
//                 )}
//               </TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {paginatedNews.length > 0 ? (
//               paginatedNews.map((news) => (
//                 <TableRow key={news.id}>
//                   <TableCell className="font-medium">{news.id}</TableCell>
//                   <TableCell>{news.title}</TableCell>
//                   <TableCell>{news.category}</TableCell>
//                   <TableCell>
//                     {new Date(news.updatedAt || 0).toLocaleDateString()}
//                   </TableCell>
//                   <TableCell>
//                     <Button asChild size="sm">
//                       <Link href={`/news/${news.id}`}>View</Link>
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={5} className="text-center py-8">
//                   No news found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <Pagination className="mt-auto">
//         <PaginationContent>
//           <PaginationItem>
//             <PaginationLink
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               isActive={false}
//               aria-disabled={page === 1}
//               className={page === 1 ? "pointer-events-none opacity-50" : ""}
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </PaginationLink>
//           </PaginationItem>

//           {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//             (pageNum) => (
//               <PaginationItem key={pageNum}>
//                 <PaginationLink
//                   onClick={() => setPage(pageNum)}
//                   isActive={page === pageNum}
//                 >
//                   {pageNum}
//                 </PaginationLink>
//               </PaginationItem>
//             )
//           )}

//           <PaginationItem>
//             <PaginationLink
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               isActive={false}
//               aria-disabled={page === totalPages}
//               className={
//                 page === totalPages ? "pointer-events-none opacity-50" : ""
//               }
//             >
//               <ChevronRight className="h-4 w-4" />
//             </PaginationLink>
//           </PaginationItem>
//         </PaginationContent>
//       </Pagination>
//     </div>
//   );
// }
