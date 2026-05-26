/** Stub — prevents real Firebase from loading during e2e. */
export const isFirebaseConfigured = false;

export const auth = {} as import("firebase/auth").Auth;
export const db = {} as import("firebase/firestore").Firestore;
