import { createDatabaseConnection } from "@/configs/database.config";
import { Product } from "@/types/product";

/**
 * Fetches all products from the Cloudflare D1 database
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
        const db = await createDatabaseConnection();
        
        let query = 'SELECT * FROM products WHERE 1=1';
        const params: any[] = [];

        // Apply category filter if specified
        if (options?.category) {
            query += ' AND category = ?';
            params.push(options.category);
        }

        // Apply title search if specified
        if (options?.searchTitle) {
            query += ' AND title LIKE ?';
            params.push(`%${options.searchTitle}%`);
        }

        // Apply sorting - we only sort by updatedAt now
        if (options?.sort === 'latest' || !options?.sort) {
            query += ' ORDER BY updatedAt DESC';
        }

        // Apply limit if specified
        if (options?.limit) {
            query += ' LIMIT ?';
            params.push(options.limit);
        }

        const result = await db.execute(query, params);
        const products = result.results.map((item: any) => {
            // Parse sections if they're stored as a string
            if (typeof item.sections === 'string') {
                try {
                    item.sections = JSON.parse(item.sections);
                } catch {
                    item.sections = [];
                }
            }
            return item;
        });

        return products as Product[];
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

/**
 * Deletes a product from the Cloudflare D1 database by ID
 * @param productId The ID of the product to delete
 * @returns Promise that resolves when the product is deleted
 */
export const deleteProduct = async (productId: string): Promise<void> => {
    try {
        const db = await createDatabaseConnection();
        
        await db.execute(
            'DELETE FROM products WHERE id = ?',
            [productId]
        );
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};
