import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "@/services/product";
import { Product } from "@/types/product";
import { getProduct } from "@/services/product-detail";

type ProductQueryOptions = {
  category?: string;
  sort?: "latest";
  limit?: number;
  searchTitle?: string;
  language?: string;
  type?: 'cases' | 'news' | 'equipments';
  enabled?: boolean;
};

export function useProducts(options: ProductQueryOptions = {}) {
  const { enabled = true, ...queryOptions } = options;

  return useQuery<Product[], Error>({
    queryKey: ["products", queryOptions],
    queryFn: () => getAllProducts(queryOptions),
    enabled,
  });
}

export function useProduct(id: string, options: { enabled?: boolean; language?: string } = {}) {
  const { enabled = true, language = 'ja' } = options;

  return useQuery<Product | null, Error>({
    queryKey: ["product", id, language],
    queryFn: () => getProduct(id, language),
    enabled: enabled && !!id,
  });
}
