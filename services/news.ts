// import { getFirestore, collection, getDocs, query, where, orderBy, limit, doc, setDoc, addDoc, getDoc } from "firebase/firestore";
// import { app } from "@/configs/firebase.config";
// import { Product } from "@/types/product";

// const db = getFirestore(app);

// /**
//  * Fetches all news from the Firestore database
//  * @param options Optional parameters for filtering and sorting
//  * @returns Array of news data
//  */
// export const getAllNews = async (options?: {
//     category?: string;
//     sort?: 'latest';
//     limit?: number;
//     searchTitle?: string;
// }): Promise<Product[]> => {
//     try {
//         const newsCollection = collection(db, "news");
//         let queryRef = query(newsCollection);

//         // Apply category filter if specified
//         if (options?.category) {
//             queryRef = query(queryRef, where("category", "==", options.category));
//         }

//         // Apply title search if specified
//         if (options?.searchTitle) {
//             // Firebase doesn't support native text search, so we're using a "starts with" query
//             const searchEnd = options.searchTitle + '\uf8ff';
//             queryRef = query(
//                 queryRef,
//                 where("title", ">=", options.searchTitle),
//                 where("title", "<=", searchEnd)
//             );
//         }

//         // Apply sorting - we only sort by updatedAt now
//         if (options?.sort === 'latest' || !options?.sort) {
//             queryRef = query(queryRef, orderBy("updatedAt", "desc"));
//         }

//         // Apply limit if specified
//         if (options?.limit) {
//             queryRef = query(queryRef, limit(options.limit));
//         }

//         const querySnapshot = await getDocs(queryRef);

//         const news: Product[] = [];
//         querySnapshot.forEach((doc) => {
//             const data = doc.data() as Omit<Product, 'id'>;

//             // Parse additional images if they're stored as a string
//             if (typeof data.additionalImages === 'string') {
//                 data.additionalImages = JSON.parse(data.additionalImages);
//             }

//             news.push({ ...data, id: doc.id });
//         });

//         return news;
//     } catch (error) {
//         console.error("Error fetching news:", error);
//         throw error;
//     }
// };

// /**
//  * Saves news to the Firestore database
//  * @param news The news data to save
//  * @returns The ID of the saved news
//  */
// export const saveNews = async (news: Product): Promise<string> => {
//     try {
//         const newsData = {
//             ...news,
//             updatedAt: Date.now(),
//             createdAt: news.createdAt || Date.now(),
//             additionalImages: JSON.stringify(news?.additionalImages || []),
//         };

//         if (news.id) {
//             // Update existing news
//             const newsRef = doc(db, "news", news.id);
//             await setDoc(newsRef, newsData, { merge: true });
//             return news.id;
//         } else {
//             // Create new news
//             const newsCollection = collection(db, "news");
//             const docRef = await addDoc(newsCollection, newsData);
//             return docRef.id;
//         }
//     } catch (error) {
//         console.error("Error saving news:", error);
//         throw error;
//     }
// };

// /**
//  * Fetches news from the Firestore database
//  * @param id The ID of the news to fetch
//  * @returns The news data
//  */
// export const getNews = async (id: string): Promise<Product | null> => {
//     try {
//         const newsRef = doc(db, "news", id);
//         const newsSnap = await getDoc(newsRef);

//         if (newsSnap.exists()) {
//             const data = newsSnap.data() as Product;
//             // Parse additional images if they're stored as a string
//             if (typeof data.additionalImages === 'string') {
//                 data.additionalImages = JSON.parse(data.additionalImages);
//             }
//             return { ...data, id: newsSnap.id };
//         } else {
//             return null;
//         }
//     } catch (error) {
//         console.error("Error fetching news:", error);
//         throw error;
//     }
// };
