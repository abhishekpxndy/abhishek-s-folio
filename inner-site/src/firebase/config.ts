import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCvxsizkSCIskvKJzKI2BIcNYgn5JDXeHs",
  authDomain: "portfolio-reviews-7da96.firebaseapp.com",
  projectId: "portfolio-reviews-7da96",
  storageBucket: "portfolio-reviews-7da96.firebasestorage.app",
  messagingSenderId: "155116341836",
  appId: "1:155116341836:web:2317671e0c0712335682e9",
  measurementId: "G-KEG54PMW1B"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
