import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';


// Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyDP6pKONTDAjvNgOxziK1_WfIB7PX-KEWA",
  authDomain: "baylo-70ddf.firebaseapp.com",
  projectId: "baylo-70ddf",
  storageBucket: "baylo-70ddf.firebasestorage.app",
  messagingSenderId: "633041050379",
  appId: "1:633041050379:web:ef504796e88edbd487a00e",
  measurementId: "G-LWPDTTS1V8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
