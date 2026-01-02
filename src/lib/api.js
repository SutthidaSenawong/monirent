import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyCT9et8S7SA-IdSMxPylb7LUJUNdQnIdFA",
  authDomain: "monirent-a6071.firebaseapp.com",
  projectId: "monirent-a6071",
  storageBucket: "monirent-a6071.appspot.com",
  messagingSenderId: "900448426661",
  appId: "1:900448426661:web:4b8fa995fb04fbebd94b4c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Refactoring the fetching functions below
const monitorsCollectionRef = collection(db, "monitors");

export async function getItems() {
  // กำหนด query เรียง category ก่อน แล้วเรียง id ต่อ
  // const q = query(
  //   monitorsCollectionRef,
  //   orderBy('category', 'asc'),
  //   orderBy('id', 'asc')
  // );

  const snapshot = await getDocs(monitorsCollectionRef);
  const monitors = snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
  // console.log(monitors);
  monitors.sort((a, b) => {
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    // แปลง id เป็น number ถ้า id เป็น string
    return Number(a.id) - Number(b.id);
  });
  return monitors;
}
export async function getItem(id) {
  const docRef = doc(db, "monitors", id);
  const snapshot = await getDoc(docRef);
  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

/**
 * @typedef {Object} PurchaseOrder
 * @property {string} id - primary key (UUID)
 * @property {string} rentalPeriodFrom - ISO date string
 * @property {string} rentalPeriodTo - ISO date string
 * @property {string} fullName
 * @property {string} email
 * @property {string} whatsappNumber
 * @property {string} deliveryAddress
 * @property {string} hotelOrAccommodationName
 * @property {string} [roomNumber]
 * @property {Array<{id: number, name: string, imageUrl: string, quantity: number}>} rentItems
 * @property {number} dailyRentRate
 * @property {number} weeklyRentRate
 * @property {number} totalFee
 * @property {string} status - "WAITING_FOR_DELIVERY" | "DELIVERED" | "ITEM_RETURNED" | "CANCELLED"
 * @property {string} createdAt - ISO date string
 * @property {string} updatedAt - ISO date string
 * @property {Array<{timestamp: string, message: string}>} logs
 */

/**
 * Save purchase info to Firestore
 * @param {PurchaseInfo} purchaseOrder
 */
export async function savePurchaseInfo(purchaseOrder) {
  // const ordersCollectionRef = collection(db, "purchaseOrders");
  try {
    // Use the provided ID as the document key
    await setDoc(
      doc(db, "purchaseOrders", String(purchaseOrder.id)),
      purchaseOrder
    );
    return purchaseOrder.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}

// param:
// id (optional)
// date from (required)
// date to (required)
// status (optional)
// pagination offset, limit
export async function getPurchaseOrders({
  id,
  dateFrom,
  dateTo,
  status,
  lastDoc,
  pageSize = 25,
}) {
  const ordersCollectionRef = collection(db, "purchaseOrders");
  const constraints = [];

  if (id) {
    // If ID is provided, we can just fetch that specific document or filter by it.
    // Since ID is unique, filtering by it returns 0 or 1 result.
    // However, user said "first 6 char" in display, but "id (text, optional)" in input.
    // If they type full ID, we search. If partial, Firestore doesn't support native partial search well.
    // Let's assume exact ID for now or maybe >= ID and <= ID + '\uf8ff' for prefix?
    // But we can't combine range on ID with range on rentalPeriodFrom.
    // So if ID is present, we might prioritize it or just use equality.
    // Let's try equality first.
    constraints.push(where("id", "==", id));
  } else {
    // Only apply other filters if ID is not present (or we can try to combine if Firestore allows, but usually range on multiple fields is no-go)
    // Actually, if ID is present, we probably don't need date range?
    // But the requirement says "calendar ... (require)".
    // Let's stick to the requirements.
    // If ID is provided, we might ignore date range if we want to find a specific order.
    // But if the user wants to filter within date range...
    // Let's assume if ID is provided, we search by ID.
    // If not, we use date range.

    if (status) {
      constraints.push(where("status", "==", status));
    }

    if (dateFrom) {
      constraints.push(where("rentalPeriodFrom", ">=", dateFrom));
    }
    if (dateTo) {
      constraints.push(where("rentalPeriodFrom", "<=", dateTo));
    }

    // Order by rentalPeriodFrom for the range filter
    constraints.push(orderBy("rentalPeriodFrom", "desc"));
  }

  // Create a separate query for counting before adding pagination limits
  const countQ = query(ordersCollectionRef, ...constraints);
  let totalCount = 0;
  try {
    const countSnapshot = await getCountFromServer(countQ);
    totalCount = countSnapshot.data().count;
  } catch (err) {
    console.error("Error getting count:", err);
  }

  constraints.push(limit(pageSize));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(ordersCollectionRef, ...constraints);
  const snapshot = await getDocs(q);

  const orders = snapshot.docs.map((doc) => ({
    ...doc.data(),
    // id is already in data, but good to ensure
  }));

  return {
    orders,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    totalCount,
  };
}

export async function updatePurchaseOrderStatus(id, newStatus, oldStatus) {
  const orderRef = doc(db, "purchaseOrders", id);
  const timestamp = new Date().toISOString();

  try {
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: timestamp,
      logs: arrayUnion({
        timestamp: timestamp,
        message: `update status from ${oldStatus} to ${newStatus}`,
      }),
    });
    return true;
  } catch (e) {
    console.error("Error updating status: ", e);
    throw e;
  }
}
