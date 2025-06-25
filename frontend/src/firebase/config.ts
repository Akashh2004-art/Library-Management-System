// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDonc_KNusR0Z0rmNKhYwNgGBDIpkk01C8",
  authDomain: "library-management-syste-c41a5.firebaseapp.com",
  projectId: "library-management-syste-c41a5",
  storageBucket: "library-management-syste-c41a5.firebasestorage.app",
  messagingSenderId: "60071521337",
  appId: "1:60071521337:web:2facc84714df751b98b1e8",
  measurementId: "G-1XRR55X233"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
getAnalytics(app);
