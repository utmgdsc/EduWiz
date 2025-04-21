import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Import the JSON statically
import firebaseLocal from "@/firebase.json";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Services
const firestore = getFirestore(app);
const realtime = getDatabase(app);
const auth = getAuth(app);

// Firestore Emulator Service
if (process.env.NODE_ENV !== "production") {
  connectFirestoreEmulator(
    firestore,
    "127.0.0.1",
    firebaseLocal.emulators.firestore.port,
  );
  connectDatabaseEmulator(
    realtime,
    "127.0.0.1",
    firebaseLocal.emulators.database.port,
  );
  connectAuthEmulator(
    auth,
    `http://localhost:${firebaseLocal.emulators.auth.port}`,
    { disableWarnings: true },
  );
}

export default app;
export { firestore, realtime, auth };
