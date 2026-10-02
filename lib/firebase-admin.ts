import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfigData from '../firebase-applet-config.json';

function getAdminApp(): App {
  const existingApps = getApps();
  if (Array.isArray(existingApps) && existingApps.length > 0) {
    return existingApps[0];
  }

  try {
    return initializeApp({
      projectId: firebaseConfigData.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    });
  } catch (err) {
    try {
      return initializeApp();
    } catch (fallbackErr) {
      console.warn('Firebase Admin fallback initialization notice:', fallbackErr);
      return getApp();
    }
  }
}

export const adminApp = getAdminApp();
export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);

