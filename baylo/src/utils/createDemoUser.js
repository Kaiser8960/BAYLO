// Demo user creation script
// Run this in Firebase Console or use Firebase Admin SDK

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase/config';

export const createDemoUser = async () => {
  try {
    // Create demo user account
    const userCredential = await createUserWithEmailAndPassword(auth, 'demo@baylo.com', '123456');
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: 'Demo User'
    });

    // Create demo profile
    const demoProfile = {
      firstName: 'Demo',
      lastName: 'User',
      age: 25,
      country: 'Philippines',
      skillsKnow: ['Coding', 'Web Development', 'Photography'],
      skillsLearn: ['Cooking', 'Guitar', 'Drawing'],
      xp: 150,
      tokens: 30,
      plan: 'Free Trial',
      level: 'Intermediate',
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', user.uid), demoProfile);

    console.log('Demo user created successfully!');
    return { success: true, user };
  } catch (error) {
    console.error('Error creating demo user:', error);
    return { success: false, error: error.message };
  }
};

// Uncomment to create demo user
// createDemoUser();
