import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyACYVL79kwIOU6wgaa74c-jpqJO7TfmfDw",
  authDomain: "loudas-84d21.firebaseapp.com",
  databaseURL: "https://loudas-84d21-default-rtdb.firebaseio.com",
  projectId: "loudas-84d21",
  storageBucket: "loudas-84d21.firebasestorage.app",
  messagingSenderId: "20220252263",
  appId: "1:20220252263:web:992fd5df6a45b3dfd1c4c2",
  measurementId: "G-QQK4NJB3DB"
};

export const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
