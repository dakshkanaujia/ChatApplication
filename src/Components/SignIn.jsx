import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, GoogleAuthProvider, database } from '../firebase/firebase'; // Ensure database is imported
import { ref, onValue, update } from 'firebase/database';
import { getChatId } from './utils';

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('User signed in successfully:', result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  );
}

export default SignIn;
