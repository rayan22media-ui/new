import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔴 هام جداً: قم باستبدال هذه القيم بالقيم الخاصة بمشروعك من Firebase Console
// Go to Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-YOUR-API-KEY-HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);