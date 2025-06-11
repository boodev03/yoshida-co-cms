// import { useQuery } from "@tanstack/react-query";
// import { getAllEquipment, getEquipment } from "@/services/equipment";
// import { Product } from "@/types/product";

// type EquipmentQueryOptions = {
//   category?: string;
//   sort?: "latest";
//   limit?: number;
//   searchTitle?: string;
//   enabled?: boolean;
// };

// export function useEquipments(options: EquipmentQueryOptions = {}) {
//   const { enabled = true, ...queryOptions } = options;

//   return useQuery<Product[], Error>({
//     queryKey: ["equipments", queryOptions],
//     queryFn: () => getAllEquipment(queryOptions),
//     enabled,
//   });
// }

// export function useEquipment(id: string, options: { enabled?: boolean } = {}) {
//   const { enabled = true } = options;
//   return useQuery<Product | null, Error>({
//     queryKey: ["equipment", id],
//     queryFn: () => getEquipment(id),
//     enabled: enabled && !!id,
//   });
// }
