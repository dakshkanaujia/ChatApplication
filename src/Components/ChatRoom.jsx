import React, { useRef, useState, useEffect } from 'react';
import { ref, onValue, push, serverTimestamp, update, off } from 'firebase/database';
import { auth, database } from '../firebase/firebase';
import ChatMessages from './ChatMessages.jsx';
import { getChatId } from './utils';

function ChatRoom() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [formValue, setFormValue] = useState('');
  const messagesEndRef = useRef(null); // Ref for the end of messages container

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersList = [];
      snapshot.forEach((childSnapshot) => {
        usersList.push({ uid: childSnapshot.key, ...childSnapshot.val() });
      });
      setUsers(usersList);
    });

    return () => {
      off(usersRef);
    };
  }, [selectedUser]);

  const selectUser = (user) => {
    setSelectedUser(user);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser || !auth.currentUser) return;

    const chatId = getChatId(auth.currentUser.uid, selectedUser.uid);
    const messagesRef = ref(database, `chats/${chatId}/messages`);

    const { uid, photoURL } = auth.currentUser;
    const newMessageRef = push(messagesRef);
    await update(newMessageRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
      status: "sent",
      receiverId: selectedUser.uid,
    });

    if (selectedUser.online) {
      await update(newMessageRef, {
        status: "delivered",
      });
    }

    setFormValue('');
  };

  useEffect(() => {
    const getAllChatsAndUpdateStatus = async (currentUser) => {
      const usersRef = ref(database, 'users');
      const usersListener = onValue(usersRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          if (currentUser.uid === user.uid) return;
          const chatId = getChatId(currentUser.uid, user.uid);
          const messagesRef = ref(database, `chats/${chatId}/messages`);

          const messagesListener = onValue(messagesRef, (messagesSnapshot) => {
            messagesSnapshot.forEach(async (messageSnapshot) => {
              const message = messageSnapshot.val();
              if (message.status === 'sent') {
                try {
                  await update(ref(database, `chats/${chatId}/messages/${messageSnapshot.key}`), {
                    status: 'delivered',
                  });
                } catch (updateError) {
                  console.error(`Error updating message status: ${updateError}`);
                }
              }
            });
          });

          return () => {
            off(messagesRef);
          };
        });
      });

      return () => {
        off(usersRef);
      };
    };

    if (auth.currentUser) {
      getAllChatsAndUpdateStatus(auth.currentUser);
    }
  }, [users]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [formValue, selectedUser]);

  return (
    <div className="mainContainer bg-orange-500 flex h-screen">
      {/* Left Component: User List */}
      <div className="w-1/4 bg-slate-100 p-4">
        <div className="user-list overflow-y-auto text-white">
          {users.map((user) => (
            user.uid !== auth.currentUser?.uid && (
              <div key={user.uid} className="user-item flex items-center mb-4 cursor-pointer" onClick={() => selectUser(user)}>
                <img src={user.photoURL} alt="user avatar" className="rounded-full w-10 h-10 mr-2" />
                <div>
                  <p className="truncate">{user.displayName}</p>
                  {user.online && (
                    <span className="text-xs text-green-500">Online</span>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Right Component: Chat Room */}
      {selectedUser && (
        <div className="w-3/4 flex flex-col bg-slate-300">
          {/* Upper Component: Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <ChatMessages selectedUser={selectedUser} />
            <span ref={messagesEndRef}></span>
          </div>
          {/* Lower Component: Message Form */}
          <form onSubmit={sendMessage} className="p-4 flex items-center bg-white">
            <input 
              value={formValue} 
              onChange={(e) => setFormValue(e.target.value)} 
              placeholder="Type your message..." 
              className="flex-1 px-4 py-2 rounded-lg border outline-none focus:ring focus:ring-blue-300"
            />
            <button 
              type="submit" 
              disabled={!formValue} 
              className="ml-2 px-4 py-2 rounded-lg bg-blue-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
