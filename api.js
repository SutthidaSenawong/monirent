import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: 'AIzaSyCT9et8S7SA-IdSMxPylb7LUJUNdQnIdFA',
  authDomain: 'monirent-a6071.firebaseapp.com',
  projectId: 'monirent-a6071',
  storageBucket: 'monirent-a6071.appspot.com',
  messagingSenderId: '900448426661',
  appId: '1:900448426661:web:4b8fa995fb04fbebd94b4c',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Refactoring the fetching functions below
const monitorsCollectionRef = collection(db, 'monitors');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}
export async function getMonitors() {
  const snapshot = await getDocs(monitorsCollectionRef);
  const monitors = snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
  // console.log(monitors);
  return monitors;
}
export async function getMonitor(id) {
  const docRef = doc(db, 'monitors', id);
  const snapshot = await getDoc(docRef);
  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

// export async function getMonitors(id) {
//   const url = id ? `/api/monitors/${id}` : '/api/monitors';
//   const res = await fetch(url);
//   if (!res.ok) {
//     throw {
//       message: 'Failed to fetch monitors',
//       statusText: res.statusText,
//       status: res.status,
//     };
//   }
//   const data = await res.json();
//   return data.monitors;
// }
