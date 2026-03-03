// 🔥 Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Firestore
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚙️ Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCS6Ymb1KbGVtHha0J8dDSX1T0on48qXGc",
  authDomain: "proyectolov-46c4f.firebaseapp.com",
  projectId: "proyectolov-46c4f",
  storageBucket: "proyectolov-46c4f.appspot.com",
  messagingSenderId: "1029490111991",
  appId: "1:1029490111991:web:ea0c193999d1f7b0f3eaf2"
};

// 🚀 Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 📦 Servicios
export const db = getFirestore(app);

// 🔁 Exportar helpers
export {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc
};
