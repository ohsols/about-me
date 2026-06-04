import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, where, getDocs, orderBy, limit, getDocFromServer, FirestoreError, serverTimestamp, updateDoc, setLogLevel } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Silence Firestore internal logging to prevent "Uncaught Error in snapshot listener" for quota errors
setLogLevel('silent');

// Use initializeFirestore with force long polling to address assertion errors in proxy environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(console.error);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  console.log("Starting Google Sign-In...");

  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google Sign-In successful:", result.user.email);
    
    // Create user doc if it doesn't exist
    const userDoc = doc(db, 'users', result.user.uid);
    let docSnap;
    try {
      docSnap = await getDoc(userDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
      return result.user; // Return user even if doc fetch fails due to quota
    }
    
    // Check if user is an allowed admin
    let isAllowedAdmin = false;
    if (result.user.email) {
      try {
        const allowedAdminDoc = await getDoc(doc(db, 'allowed_admins', result.user.email.toLowerCase()));
        isAllowedAdmin = allowedAdminDoc.exists();
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'allowed_admins');
      }
    }

    const adminEmails = ['darkfn1234567890@gmail.com', 'calabcoleman2187@gmail.com', 'raypolebobby15@gmail.com', 'cringboi9000@gmail.com'];
    const isDefaultAdmin = adminEmails.includes(result.user.email || '') && result.user.emailVerified;

    if (!docSnap || !docSnap.exists()) {
      console.log("Creating new user document for:", result.user.email);
      
      try {
        await setDoc(userDoc, {
          uid: result.user.uid,
          email: result.user.email || null,
          displayName: result.user.displayName || null,
          photoURL: result.user.photoURL || null,
          role: (result.user.uid === 'HfjrcUIslZPCvNI3fxiQJVK1ebB3' || isAllowedAdmin || isDefaultAdmin) ? 'admin' : 'user',
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'users');
      }
    } else {
      // Update role if they should be admin but aren't
      const currentData = docSnap.data();
      const shouldBeAdmin = result.user.uid === 'HfjrcUIslZPCvNI3fxiQJVK1ebB3' || isAllowedAdmin || isDefaultAdmin;
      
      if (shouldBeAdmin && currentData.role !== 'admin') {
         try {
           await updateDoc(userDoc, { role: 'admin' });
         } catch(e) {
           console.warn("Could not auto-promote user to admin:", e);
         }
      }
    }
    return result.user;
  } catch (error) {
    console.warn("Error signing in with Google:", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, pass: string, username: string) => {
  console.log("Starting Email Sign-Up for:", email);

  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    console.log("Email Sign-Up successful:", result.user.email);
    await updateProfile(result.user, { displayName: username });
    
    // Create user doc
    console.log("Creating user document for:", email);
    
    const emailLower = email.toLowerCase();
    const adminEmails = ['darkfn1234567890@gmail.com', 'calabcoleman2187@gmail.com', 'raypolebobby15@gmail.com', 'cringboi9000@gmail.com'];
    const isDefaultAdmin = adminEmails.includes(emailLower);
    let isAllowedAdmin = false;
    if (emailLower) {
      try {
        const allowedAdminDoc = await getDoc(doc(db, 'allowed_admins', emailLower));
        isAllowedAdmin = allowedAdminDoc.exists();
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'allowed_admins');
      }
    }

    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email || null,
        displayName: username || null,
        photoURL: result.user.photoURL || null,
        role: (result.user.uid === 'HfjrcUIslZPCvNI3fxiQJVK1ebB3' || isAllowedAdmin || isDefaultAdmin) ? 'admin' : 'user',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    }
    
    return result.user;
  } catch (error) {
    console.warn("Error signing up with email:", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  console.log("Starting Email Login for:", email);

  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    console.log("Email Login successful:", result.user.email);

    const userDocRef = doc(db, 'users', result.user.uid);
    let docSnap;
    try {
      docSnap = await getDoc(userDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
    }
    
    if (docSnap && docSnap.exists()) {
      // Logic for existing user login can go here
    }

    return result.user;
  } catch (error) {
    console.warn("Error logging in with email:", error);
    throw error;
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

// Quota management
export let isQuotaExceeded = false;

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  const errorString = JSON.stringify(errInfo);
  
  if (errInfo.error.includes('Quota limit exceeded') || errInfo.error.includes('Quota exceeded') || errInfo.error.includes('resource-exhausted')) {
    isQuotaExceeded = true;
    // Silent return - no error logged, no event dispatched
    return;
  }

  console.error('Firestore Error: ', errorString);
  throw new Error(errorString);
}

// Test connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
