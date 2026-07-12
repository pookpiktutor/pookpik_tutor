import { initializeApp } from "file:///C:/Users/Windows%2011/AppData/Roaming/npm/node_modules/firebase/app/dist/index.mjs";
import { getFirestore, collection, getDocs, limit, query } from "file:///C:/Users/Windows%2011/AppData/Roaming/npm/node_modules/firebase/firestore/dist/index.mjs";

const firebaseConfig = {
  apiKey: "AIzaSyDR73jjl4afmMVGgCWLXDmKeocmghGX1W4",
  authDomain: "pookpik-tutor.firebaseapp.com",
  projectId: "pookpik-tutor",
  storageBucket: "pookpik-tutor.firebasestorage.app",
  messagingSenderId: "1035837301501",
  appId: "1:1035837301501:web:c21be8f4d4f5b8ec6c5494",
  measurementId: "G-GLYLNRGZZ4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const collections = ["students", "enrollments", "ClassLogs", "teachers", "rooms", "users"];
  for (const col of collections) {
     const ref = collection(db, col);
     const snap = await getDocs(query(ref, limit(1)));
     console.log(`Collection ${col} size/presence: ${snap.size}`);
  }
}

main().catch(console.error);
