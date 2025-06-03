import { getFirestore, collection, doc, setDoc, addDoc, getDoc } from "firebase/firestore";
import { app } from "@/configs/firebase.config";
import { Product } from "@/types/product";

const db = getFirestore(app);

/**
 * Saves a product to the Firestore database
 * @param product The product data to save
 * @returns The ID of the saved product
 */
export const saveProduct = async (product: Product): Promise<string> => {
    try {
        const productData = {
            ...product,
            updatedAt: Date.now(),
            createdAt: product.createdAt || Date.now(),
            additionalImages: JSON.stringify(product?.additionalImages || []),
        };

        if (product.id) {
            // Update existing product
            const productRef = doc(db, "products", product.id);
            await setDoc(productRef, productData, { merge: true });
            return product.id;
        } else {
            // Create new product
            const productsCollection = collection(db, "products");
            const docRef = await addDoc(productsCollection, productData);
            return docRef.id;
        }
    } catch (error) {
        console.error("Error saving product:", error);
        throw error;
    }
};

/**
 * Fetches a product from the Firestore database
 * @param id The ID of the product to fetch
 * @returns The product data
 */
export const getProduct = async (id: string): Promise<Product | null> => {
    try {
        const productRef = doc(db, "products", id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
            const data = productSnap.data() as Product;
            // Parse additional images if they're stored as a string
            if (typeof data.additionalImages === 'string') {
                data.additionalImages = JSON.parse(data.additionalImages);
            }
            return { ...data, id: productSnap.id };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
    }
};
