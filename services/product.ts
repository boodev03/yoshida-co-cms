import { createDatabaseConnection } from "@/configs/database.config";
import { Product } from "@/types/product";

/**
 * Fetches all products from the multilingual database with translations
 * @param options Optional parameters for filtering and sorting
 * @returns Array of product data with current language translations
 */
export const getAllProducts = async (options?: {
    category?: string;
    sort?: 'latest';
    limit?: number;
    searchTitle?: string;
    language?: string;
    type?: 'cases' | 'news' | 'equipments';
}): Promise<Product[]> => {
    try {
        const db = await createDatabaseConnection();
        const language = options?.language || 'ja'; // Default to Japanese
        
        let query = `
            SELECT 
                p.id,
                p.type,
                p.thumbnail,
                p.ogImage,
                p.ogTwitter,
                p.date,
                p.createdAt,
                p.updatedAt,
                pt.category,
                pt.title,
                pt.cardDescription,
                pt.sections,
                pt.metaTitle,
                pt.metaKeywords,
                pt.metaDescription
            FROM posts p
            LEFT JOIN post_translations pt ON p.id = pt.post_id AND pt.language_code = ?
            WHERE 1=1
        `;
        const params: any[] = [language];

        // Apply type filter (cases, news, equipments)
        if (options?.type) {
            query += ' AND p.type = ?';
            params.push(options.type);
        }

        // Apply category filter if specified
        if (options?.category) {
            query += ' AND pt.category LIKE ?';
            params.push(`%${options.category}%`);
        }

        // Apply title search if specified
        if (options?.searchTitle) {
            query += ' AND pt.title LIKE ?';
            params.push(`%${options.searchTitle}%`);
        }

        // Apply sorting - we only sort by updatedAt now
        if (options?.sort === 'latest' || !options?.sort) {
            query += ' ORDER BY p.updatedAt DESC';
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
            return {
                id: item.id,
                type: item.type,
                category: item.category || '',
                thumbnail: item.thumbnail || '',
                sections: item.sections || [],
                ogImage: item.ogImage || '',
                ogTwitter: item.ogTwitter || '',
                date: item.date || '',
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                title: item.title || '',
                cardDescription: item.cardDescription || '',
                metaTitle: item.metaTitle || '',
                metaKeywords: item.metaKeywords || '',
                metaDescription: item.metaDescription || ''
            } as Product;
        });

        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

/**
 * Deletes a product from the multilingual database by ID
 * @param productId The ID of the product to delete
 * @returns Promise that resolves when the product is deleted
 */
export const deleteProduct = async (productId: number): Promise<void> => {
    try {
        const db = await createDatabaseConnection();
        
        // Delete from posts table (cascading deletes will handle translations)
        await db.execute(
            'DELETE FROM posts WHERE id = ?',
            [productId]
        );
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};

/**
 * Fetches all unique categories for a specific type
 * @param type The post type to get categories for
 * @param language The language for getting categories (default: 'ja')
 * @returns Array of unique category strings
 */
export const getCategories = async (type: 'cases' | 'news' | 'equipments', language: string = 'ja'): Promise<string[]> => {
    try {
        const db = await createDatabaseConnection();
        
        const query = `
            SELECT DISTINCT pt.category
            FROM posts p
            JOIN post_translations pt ON p.id = pt.post_id 
            WHERE p.type = ? AND pt.language_code = ? AND pt.category IS NOT NULL AND pt.category != ''
            ORDER BY pt.category
        `;

        const result = await db.execute(query, [type, language]);
        return result.results
            .map((item: any) => item.category)
            .filter(Boolean)
            .flatMap((category: string) => category.split(',').map((c: string) => c.trim()))
            .filter((category: string, index: number, self: string[]) => self.indexOf(category) === index);
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};
