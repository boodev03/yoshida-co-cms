import { createDatabaseConnection } from "@/configs/database.config";
import { Product } from "@/types/product";

/**
 * Fetches all news from the Cloudflare D1 database
 * @param options Optional parameters for filtering and sorting
 * @returns Array of news data
 */
export const getAllNews = async (options?: {
    category?: string;
    sort?: 'latest';
    limit?: number;
    searchTitle?: string;
}): Promise<Product[]> => {
    try {
        const db = await createDatabaseConnection();
        
        let query = 'SELECT * FROM news WHERE 1=1';
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
        const news = result.results.map((item: any) => {
            // Parse sections if they're stored as a string
            if (typeof item.sections === 'string') {
                try {
                    item.sections = JSON.parse(item.sections);
                } catch {
                    item.sections = [];
                }
            }
            // Ensure all fields have default values
            return {
                ...item,
                cardDescription: item.cardDescription || '',
                thumbnail: item.thumbnail || '',
                sections: item.sections || [],
                metaTitle: item.metaTitle || '',
                metaKeywords: item.metaKeywords || '',
                metaDescription: item.metaDescription || '',
                ogImage: item.ogImage || '',
                ogTwitter: item.ogTwitter || ''
            };
        });

        return news as Product[];
    } catch (error) {
        console.error("Error fetching news:", error);
        throw error;
    }
};

/**
 * Saves news to the Cloudflare D1 database
 * @param news The news data to save
 * @returns The ID of the saved news
 */
export const saveNews = async (news: Product): Promise<string> => {
    try {
        const db = await createDatabaseConnection();
        const now = Date.now();
        const sectionsJson = JSON.stringify(news.sections || []);

        if (news.id) {
            // Update existing news
            await db.execute(
                `UPDATE news SET 
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
                    news.title,
                    news.category,
                    news.cardDescription || '',
                    news.thumbnail || '',
                    sectionsJson,
                    news.metaTitle || '',
                    news.metaKeywords || '',
                    news.metaDescription || '',
                    news.ogImage || '',
                    news.ogTwitter || '',
                    now,
                    news.id
                ]
            );
            return news.id;
        } else {
            // Create new news
            const result = await db.execute(
                `INSERT INTO news (
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
                    news.title,
                    news.category,
                    news.cardDescription || '',
                    news.thumbnail || '',
                    sectionsJson,
                    news.metaTitle || '',
                    news.metaKeywords || '',
                    news.metaDescription || '',
                    news.ogImage || '',
                    news.ogTwitter || '',
                    news.createdAt || now,
                    now
                ]
            );
            return result.results[0].id as string;
        }
    } catch (error) {
        console.error("Error saving news:", error);
        throw error;
    }
};

/**
 * Fetches news from the Cloudflare D1 database
 * @param id The ID of the news to fetch
 * @returns The news data
 */
export const getNews = async (id: string): Promise<Product | null> => {
    try {
        const db = await createDatabaseConnection();
        
        const result = await db.execute(
            'SELECT * FROM news WHERE id = ?',
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
        console.error("Error fetching news:", error);
        throw error;
    }
};

/**
 * Deletes a news item from the Cloudflare D1 database by ID
 * @param newsId The ID of the news to delete
 * @returns Promise that resolves when the news is deleted
 */
export const deleteNews = async (newsId: string): Promise<void> => {
    try {
        const db = await createDatabaseConnection();
        
        await db.execute(
            'DELETE FROM news WHERE id = ?',
            [newsId]
        );
    } catch (error) {
        console.error("Error deleting news:", error);
        throw error;
    }
};
