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
// import { useEquipments } from "@/hooks/useEquipments";
// import { saveEquipment } from "@/services/equipment";
// import { Product } from "@/types/product";
// import { ArrowDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function Equipments() {
//   const [page, setPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [searchTitle, setSearchTitle] = useState("");
//   const [sort, setSort] = useState<"latest">("latest");
//   const [isCreating, setIsCreating] = useState(false);
//   const router = useRouter();
//   const {
//     data: equipments,
//     isLoading,
//     error,
//   } = useEquipments({ searchTitle, sort });

//   if (isLoading) return <div>Loading equipments...</div>;
//   if (error) return <div>Error loading equipments: {error.message}</div>;

//   // Calculate pagination
//   const totalPages =
//     equipments && equipments.length > 0
//       ? Math.ceil(equipments.length / itemsPerPage)
//       : 1;

//   const paginatedEquipments =
//     equipments && equipments.length > 0
//       ? equipments.slice((page - 1) * itemsPerPage, page * itemsPerPage)
//       : [];

//   const handleSort = (sortType: "latest") => {
//     setSort(sortType);
//   };

//   const handleCreateNewEquipment = async () => {
//     try {
//       setIsCreating(true);
//       // Create an empty equipment and get its ID
//       const emptyEquipment = {
//         title: "",
//         category: "",
//       } as Product;
//       const equipmentId = await saveEquipment(emptyEquipment);
//       // Redirect to the equipment detail page
//       router.push(`/equipments/${equipmentId}`);
//     } catch (error) {
//       console.error("Error creating new equipment:", error);
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
//             placeholder="Search equipments..."
//             className="pl-8"
//             value={searchTitle}
//             onChange={(e) => setSearchTitle(e.target.value)}
//           />
//         </div>
//         <Button onClick={handleCreateNewEquipment} disabled={isCreating}>
//           {isCreating ? "Creating..." : "Create New Equipment"}
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
//             {paginatedEquipments.length > 0 ? (
//               paginatedEquipments.map((equipment) => (
//                 <TableRow key={equipment.id}>
//                   <TableCell className="font-medium">{equipment.id}</TableCell>
//                   <TableCell>{equipment.title}</TableCell>
//                   <TableCell>{equipment.category}</TableCell>
//                   <TableCell>
//                     {new Date(equipment.updatedAt || 0).toLocaleDateString()}
//                   </TableCell>
//                   <TableCell>
//                     <Button asChild size="sm">
//                       <Link href={`/equipments/${equipment.id}`}>View</Link>
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={5} className="text-center py-8">
//                   No equipments found
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
