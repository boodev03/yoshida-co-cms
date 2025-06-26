import { getFirestore, collection, getDocs, query, where, orderBy, limit, doc, setDoc, addDoc, getDoc, deleteDoc } from "firebase/firestore";
import { app } from "@/configs/firebase.config";
import { Product } from "@/types/product";

const db = getFirestore(app);

/**
 * Fetches all equipment from the Firestore database
 * @param options Optional parameters for filtering and sorting
 * @returns Array of equipment data
 */
export const getAllEquipment = async (options?: {
    category?: string;
    sort?: 'latest';
    limit?: number;
    searchTitle?: string;
}): Promise<Product[]> => {
    try {
        const equipmentsCollection = collection(db, "equipments");
        let queryRef = query(equipmentsCollection);

        // Apply category filter if specified
        if (options?.category) {
            queryRef = query(queryRef, where("category", "==", options.category));
        }

        // Apply title search if specified
        if (options?.searchTitle) {
            // Firebase doesn't support native text search, so we're using a "starts with" query
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

        const equipment: Product[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as Omit<Product, 'id'>;

            // Parse sections if they're stored as a string
            if (typeof data.sections === 'string') {
                data.sections = JSON.parse(data.sections);
            }

            equipment.push({ ...data, id: doc.id });
        });

        return equipment;
    } catch (error) {
        console.error("Error fetching equipment:", error);
        throw error;
    }
};

/**
 * Saves equipment to the Firestore database
 * @param equipment The equipment data to save
 * @returns The ID of the saved equipment
 */
export const saveEquipment = async (equipment: Product): Promise<string> => {
    try {
        const equipmentData = {
            ...equipment,
            updatedAt: Date.now(),
            createdAt: equipment.createdAt || Date.now(),
            sections: equipment.sections || [],
        };

        if (equipment.id) {
            // Update existing equipment
            const equipmentRef = doc(db, "equipments", equipment.id);
            await setDoc(equipmentRef, equipmentData, { merge: true });
            return equipment.id;
        } else {
            // Create new equipment
            const equipmentsCollection = collection(db, "equipments");
            const docRef = await addDoc(equipmentsCollection, equipmentData);
            return docRef.id;
        }
    } catch (error) {
        console.error("Error saving equipment:", error);
        throw error;
    }
};

/**
 * Fetches equipment from the Firestore database
 * @param id The ID of the equipment to fetch
 * @returns The equipment data
 */
export const getEquipment = async (id: string): Promise<Product | null> => {
    try {
        const equipmentRef = doc(db, "equipments", id);
        const equipmentSnap = await getDoc(equipmentRef);

        if (equipmentSnap.exists()) {
            const data = equipmentSnap.data() as Product;
            // Parse sections if they're stored as a string
            if (typeof data.sections === 'string') {
                data.sections = JSON.parse(data.sections);
            }
            return { ...data, id: equipmentSnap.id };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching equipment:", error);
        throw error;
    }
};

/**
 * Deletes an equipment item from the Firestore database by ID
 * @param equipmentId The ID of the equipment to delete
 * @returns Promise that resolves when the equipment is deleted
 */
export const deleteEquipment = async (equipmentId: string): Promise<void> => {
    try {
        const equipmentRef = doc(db, "equipments", equipmentId);
        await deleteDoc(equipmentRef);
    } catch (error) {
        console.error("Error deleting equipment:", error);
        throw error;
    }
};
