import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
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
 * @property {number} id - primary key
 * @property {string} rentalPeriodFrom - ISO date string
 * @property {string} rentalPeriodTo - ISO date string
 * @property {string} fullName
 * @property {string} email
 * @property {string} whatsappNumber
 * @property {string} deliveryAddress
 * @property {string} hotelOrAccommodationName
 * @property {string} [roomNumber]
 * @property {Array<{monitorId: number, quantity: number}>} rentItems
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
  const ordersCollectionRef = collection(db, "purchaseOrders");
  try {
    const docRef = await addDoc(ordersCollectionRef, purchaseOrder);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}
