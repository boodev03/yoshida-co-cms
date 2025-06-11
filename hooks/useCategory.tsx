import { useQuery } from "@tanstack/react-query";
import { getCategoriesByType, getAllCategories } from "@/services/category";
import { Category } from "@/services/category";

type CategoryQueryOptions = {
  type?: Category["type"];
  enabled?: boolean;
};

export function useCategories(options: CategoryQueryOptions = {}) {
  const { enabled = true, type } = options;

  return useQuery<Category[], Error>({
    queryKey: ["categories", { type }],
    queryFn: () => (type ? getCategoriesByType(type) : getAllCategories()),
    enabled,
  });
}

export function useCategoriesByType(
  type: Category["type"],
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  return useQuery<Category[], Error>({
    queryKey: ["categories", type],
    queryFn: () => getCategoriesByType(type),
    enabled: enabled && !!type,
  });
}
