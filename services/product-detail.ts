import { createDatabaseConnection } from "@/configs/database.config";
import { Product } from "@/types/product";

/**
 * Saves a product to the Cloudflare D1 database
 * @param product The product data to save
 * @returns The ID of the saved product
 */
export const saveProduct = async (product: Product): Promise<string> => {
    try {
        const db = await createDatabaseConnection();
        const now = Date.now();
        const sectionsJson = JSON.stringify(product.sections || []);

        if (product.id) {
            // Update existing product
            await db.execute(
                `UPDATE products SET 
                    title = ?, 
                    category = ?, 
                    cardDescription = ?, 
                    thumbnail = ?, 
                    sections = ?, 
                    metaTitle = ?, 
                    metaKeywords = ?, 
                    metaDescription = ?, 
                    ogImage = ?, 
                    ogTwitter = ?, 
                    updatedAt = ? 
                WHERE id = ?`,
                [
                    product.title,
                    product.category,
                    product.cardDescription || '',
                    product.thumbnail || '',
                    sectionsJson,
                    product.metaTitle || '',
                    product.metaKeywords || '',
                    product.metaDescription || '',
                    product.ogImage || '',
                    product.ogTwitter || '',
                    now,
                    product.id
                ]
            );
            return product.id;
        } else {
            // Create new product
            const result = await db.execute(
                `INSERT INTO products (
                    title, 
                    category, 
                    cardDescription, 
                    thumbnail, 
                    sections, 
                    metaTitle, 
                    metaKeywords, 
                    metaDescription, 
                    ogImage, 
                    ogTwitter, 
                    createdAt, 
                    updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
                [
                    product.title,
                    product.category,
                    product.cardDescription || '',
                    product.thumbnail || '',
                    sectionsJson,
                    product.metaTitle || '',
                    product.metaKeywords || '',
                    product.metaDescription || '',
                    product.ogImage || '',
                    product.ogTwitter || '',
                    product.createdAt || now,
                    now
                ]
            );
            return result.results[0].id as string;
        }
    } catch (error) {
        console.error("Error saving product:", error);
        throw error;
    }
};

/**
 * Fetches a product from the Cloudflare D1 database
 * @param id The ID of the product to fetch
 * @returns The product data
 */
export const getProduct = async (id: string): Promise<Product | null> => {
    try {
        const db = await createDatabaseConnection();
        
        const result = await db.execute(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );

        if (result.results.length > 0) {
            const data = result.results[0] as any;
            // Parse sections if they're stored as a string
            if (typeof data.sections === 'string') {
                try {
                    data.sections = JSON.parse(data.sections);
                } catch {
                    data.sections = [];
                }
            }
            // Ensure all required fields have default values
            return {
                id: data.id,
                title: data.title || '',
                category: data.category || '',
                cardDescription: data.cardDescription || '',
                thumbnail: data.thumbnail || '',
                sections: data.sections || [],
                metaTitle: data.metaTitle || '',
                metaKeywords: data.metaKeywords || '',
                metaDescription: data.metaDescription || '',
                ogImage: data.ogImage || '',
                ogTwitter: data.ogTwitter || '',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            } as Product;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
    }
};
