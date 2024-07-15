import React, { useEffect } from 'react';
import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, updateUserStatus, database } from './firebase/firebase';
import ChatRoom from './Components/ChatRoom';
import SignIn from './Components/SignIn';
import { ref, set, serverTimestamp } from 'firebase/database';

function App() {
  const [user] = useAuthState(auth);

  const handleSignOut = async () => {
    if (user) {
      const userStatusDatabaseRef = ref(database, `users/${user.uid}`);
      await set(userStatusDatabaseRef, {     
        displayName : user.displayName,
        photoURL : user.photoURL,
        email : user.email,   
        online : false,
        lastChanged: serverTimestamp(),
      });
      auth.signOut();
    }
  };

  useEffect(() => {
    if (user) {
      updateUserStatus(user.uid);

      const userRef = ref(database, `users/${user.uid}`);
      set(userRef, {
        uid: user.uid,
        displayName: user.displayName ? user.displayName : 'Anonymous',
        photoURL: user.photoURL ? user.photoURL : '',
        email: user.email ? user.email   : 'anonymous@gmail.com',
        lastOnline: serverTimestamp(),
        online: true,
      });
    }
  }, [user]);

  return (
    <div className="">
      <header className='h-1/6'>
        <h1>⚛️🔥💬</h1>
        {user && <button className="rounded border-2 p-3 hover:bg-black transition ease-in-out bg-slate-700" onClick={handleSignOut}>Sign Out</button>}
      </header>
      <section className='h-5/6'>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

export default App;
