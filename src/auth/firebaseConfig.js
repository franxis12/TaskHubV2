// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtHnbiGw-SucX8RvRvZz3NkWKWeLynt_w",
  authDomain: "tasking-app-e4211.firebaseapp.com",
  projectId: "tasking-app-e4211",
  storageBucket: "tasking-app-e4211.firebasestorage.app",
  messagingSenderId: "959510889883",
  appId: "1:959510889883:web:4de1d0e9c236884200cd3e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;