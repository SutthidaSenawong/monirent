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
// fullName (optional) - partial match
// date from (required)
// date to (required)
// status (optional)
// pagination offset, limit
export async function getPurchaseOrders({
  fullName,
  dateFrom,
  dateTo,
  status,
  lastDoc,
  pageSize = 25,
}) {
  const ordersCollectionRef = collection(db, "purchaseOrders");
  let constraints = [];
  let countConstraints = [];

  // Build query based on available filters to avoid compound index requirements

  // Priority 1: If status is provided, use it as primary filter
  if (status) {
    constraints.push(where("status", "==", status));
    countConstraints.push(where("status", "==", status));

    // For status queries, we'll order by createdAt instead of rentalPeriodFrom
    // to avoid compound index requirements
    constraints.push(orderBy("createdAt", "desc"));
  } else {
    // Priority 2: If no status, use date range filters with rentalPeriodFrom
    if (dateFrom) {
      constraints.push(where("rentalPeriodFrom", ">=", dateFrom));
      countConstraints.push(where("rentalPeriodFrom", ">=", dateFrom));
    }
    if (dateTo) {
      constraints.push(where("rentalPeriodFrom", "<=", dateTo));
      countConstraints.push(where("rentalPeriodFrom", "<=", dateTo));
    }

    // Order by rentalPeriodFrom for date range queries
    constraints.push(orderBy("rentalPeriodFrom", "desc"));
  }

  // Get total count
  let totalCount = 0;
  try {
    const countQ = query(ordersCollectionRef, ...countConstraints);
    const countSnapshot = await getCountFromServer(countQ);
    totalCount = countSnapshot.data().count;
  } catch (err) {
    console.error("Error getting count:", err);
    // Fallback: get all docs and count them (less efficient but works)
    try {
      const fallbackQ = query(ordersCollectionRef, ...countConstraints);
      const fallbackSnapshot = await getDocs(fallbackQ);
      totalCount = fallbackSnapshot.docs.length;
    } catch (fallbackErr) {
      console.error("Fallback count also failed:", fallbackErr);
      totalCount = 0;
    }
  }

  // Add pagination
  constraints.push(limit(pageSize));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(ordersCollectionRef, ...constraints);
  const snapshot = await getDocs(q);

  let orders = snapshot.docs.map((doc) => ({
    ...doc.data(),
    // id is already in data, but good to ensure
  }));

  // Client-side filtering for fullName (partial match) and date range if status was used
  if (fullName || (status && (dateFrom || dateTo))) {
    orders = orders.filter((order) => {
      let matches = true;

      // Filter by fullName (case-insensitive partial match)
      if (fullName) {
        const orderName = (order.fullName || "").toLowerCase();
        const searchName = fullName.toLowerCase();
        matches = matches && orderName.includes(searchName);
      }

      // Filter by date range if status was used as primary filter
      if (status && (dateFrom || dateTo)) {
        const orderDate = new Date(order.rentalPeriodFrom);
        if (dateFrom) {
          matches = matches && orderDate >= new Date(dateFrom);
        }
        if (dateTo) {
          matches = matches && orderDate <= new Date(dateTo);
        }
      }

      return matches;
    });
  }

  return {
    orders,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    totalCount: fullName ? orders.length : totalCount,
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
