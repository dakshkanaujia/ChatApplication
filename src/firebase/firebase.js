
// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onDisconnect, onValue, serverTimestamp, set  } from "firebase/database";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyADJ9-mgnndoEKXIw5Hu5nxgNkwfe-zz2o",
  authDomain: "chatapplication-9637c.firebaseapp.com",
  projectId: "chatapplication-9637c",
  storageBucket: "chatapplication-9637c.appspot.com",
  messagingSenderId: "767035202147",
  appId: "1:767035202147:web:9abd929a39303311eb7656",
  measurementId: "G-4F9D44GT9D"
};

// Initialize your Firebase app and get the database reference

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase();

// Function to update user's online status
const updateUserStatus = (UId) => {
    const userStatusDatabaseRef = ref(database, `users/${UId}`);

    const isOfflineForDatabase = {
      state: 'offline',
      lastChanged: serverTimestamp(),
    };

    const isOnlineForDatabase = {
      state: 'online',
      lastChanged: serverTimestamp(),
    };

    onValue(ref(database, 'info/connected'), (snapshot) => {
      if (snapshot.val() === false) {
        return;
      };

      onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
        set(userStatusDatabaseRef, isOnlineForDatabase);
      }); 
    });
};



export { auth, database, GoogleAuthProvider, updateUserStatus };

