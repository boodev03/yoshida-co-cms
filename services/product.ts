import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { app } from "@/configs/firebase.config";
import { Product } from "@/types/product";

const db = getFirestore(app);

/**
 * Fetches all products from the Firestore database
 * @param options Optional parameters for filtering and sorting
 * @returns Array of product data
 */
export const getAllProducts = async (options?: {
    category?: string;
    sort?: 'latest';
    limit?: number;
    searchTitle?: string;
}): Promise<Product[]> => {
    try {
        const productsCollection = collection(db, "products");
        let queryRef = query(productsCollection);

        // Apply category filter if specified
        if (options?.category) {
            queryRef = query(queryRef, where("category", "==", options.category));
        }

        // Apply title search if specified
        if (options?.searchTitle) {
            // Firebase doesn't support native text search, so we're using a "starts with" query
            // Note: For a more robust search, consider using Algolia or other search service
            const searchEnd = options.searchTitle + '\uf8ff';
            queryRef = query(
                queryRef,
                where("title", ">=", options.searchTitle),
                where("title", "<=", searchEnd)
            );
        }

        // Apply sorting - we only sort by updatedAt now
        if (options?.sort === 'latest' || !options?.sort) {
            queryRef = query(queryRef, orderBy("updatedAt", "desc"));
        }

        // Apply limit if specified
        if (options?.limit) {
            queryRef = query(queryRef, limit(options.limit));
        }

        const querySnapshot = await getDocs(queryRef);

        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as Omit<Product, 'id'>;

            products.push({ ...data, id: doc.id });
        });

        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};
