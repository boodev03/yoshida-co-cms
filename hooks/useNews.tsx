// import { useQuery } from "@tanstack/react-query";
// import { getAllNews, getNews } from "@/services/news";
// import { Product } from "@/types/product";

// type NewsQueryOptions = {
//   category?: string;
//   sort?: "latest";
//   limit?: number;
//   searchTitle?: string;
//   enabled?: boolean;
// };

// export function useNews(options: NewsQueryOptions = {}) {
//   const { enabled = true, ...queryOptions } = options;

//   return useQuery<Product[], Error>({
//     queryKey: ["news", queryOptions],
//     queryFn: () => getAllNews(queryOptions),
//     enabled,
//   });
// }

// export function useNewsItem(id: string, options: { enabled?: boolean } = {}) {
//   const { enabled = true } = options;
//   return useQuery<Product | null, Error>({
//     queryKey: ["news", id],
//     queryFn: () => getNews(id),
//     enabled: enabled && !!id,
//   });
// }
