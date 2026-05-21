import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfigJson from "../firebase-applet-config.json";

// Prefer Vite env vars in development/production. Fallback to the checked-in json for quick dev.
const metaEnv: any = (import.meta as any).env || {};
const firebaseConfig = {
	apiKey: (metaEnv.VITE_FIREBASE_API_KEY as string) || firebaseConfigJson.apiKey,
	authDomain: (metaEnv.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfigJson.authDomain,
	projectId: (metaEnv.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfigJson.projectId,
	storageBucket: (metaEnv.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfigJson.storageBucket,
	messagingSenderId: (metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfigJson.messagingSenderId,
	appId: (metaEnv.VITE_FIREBASE_APP_ID as string) || firebaseConfigJson.appId,
	// optional multi-db id
	firestoreDatabaseId: (metaEnv.VITE_FIRESTORE_DATABASE_ID as string) || (firebaseConfigJson as any).firestoreDatabaseId
};

const app = initializeApp(firebaseConfig as any);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
