import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPjZ3lu2dvuDgKcvpxLaarMnzj7n1si7Y",
  authDomain: "ev-recharge-bunk-dbd05.firebaseapp.com",
  projectId: "ev-recharge-bunk-dbd05",
  storageBucket: "ev-recharge-bunk-dbd05.firebasestorage.app",
  messagingSenderId: "376503343817",
  appId: "1:376503343817:web:564092ebe808ad8bbe4b18"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);


export const db = getFirestore(app);


export default app;