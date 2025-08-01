import { useQuery } from "@tanstack/react-query";
import { getAllEquipment, getEquipment } from "@/services/equipment";
import { Product } from "@/types/product";

type EquipmentQueryOptions = {
  category?: string;
  sort?: "latest";
  limit?: number;
  searchTitle?: string;
  language?: string;
  type?: 'cases' | 'news' | 'equipments';
  enabled?: boolean;
};

export function useEquipments(options: EquipmentQueryOptions = {}) {
  const { enabled = true, ...queryOptions } = options;

  return useQuery<Product[], Error>({
    queryKey: ["equipments", queryOptions],
    queryFn: () => getAllEquipment(queryOptions),
    enabled,
  });
}

export function useEquipment(id: string, options: { enabled?: boolean; language?: string } = {}) {
  const { enabled = true, language = 'ja' } = options;
  return useQuery<Product | null, Error>({
    queryKey: ["equipment", id, language],
    queryFn: () => getEquipment(id, language),
    enabled: enabled && !!id,
  });
}
