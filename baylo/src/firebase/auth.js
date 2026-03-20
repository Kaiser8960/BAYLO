import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  setPersistence, 
  browserLocalPersistence,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Create user account
export const createUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Note: Firestore profile will be created in setup-profile flow
    // This ensures new users are directed to profile setup
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign in user
export const signInUser = async (email, password, rememberMe = false) => {
  try {
    if (rememberMe) {
      await setPersistence(auth, browserLocalPersistence);
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Social login stubs (for future implementation)
export const signInWithGoogle = async () => {
  // TODO: Implement Google sign-in
  console.log('Google sign-in not implemented yet');
};

export const signInWithFacebook = async () => {
  // TODO: Implement Facebook sign-in
  console.log('Facebook sign-in not implemented yet');
};
