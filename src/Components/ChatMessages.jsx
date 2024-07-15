import React, { useEffect, useState } from 'react';
import { ref, onValue, query, orderByChild, update } from 'firebase/database';
import { auth, database } from '../firebase/firebase';
import ChatMessage from './ChatMessage.jsx';
import { getChatId } from './utils';

function ChatMessages({ selectedUser }) {
  if (!auth.currentUser) return null;

  const { uid: currentUserId } = auth.currentUser;
  const chatId = getChatId(currentUserId, selectedUser.uid);
  const messagesRef = query(ref(database, `chats/${chatId}/messages`), orderByChild('createdAt'));
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handleValueChange = (snapshot) => {
      const messagesList = [];
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        messagesList.push({ id: childSnapshot.key, ...message });
        if (message.uid !== currentUserId && message.status !== 'read') {
          update(ref(database, `chats/${chatId}/messages/${childSnapshot.key}`), {
            status: 'read',
          });
        }
      });
      setMessages(messagesList);
    };

    const unsubscribe = onValue(messagesRef, handleValueChange);

    return () => {
      unsubscribe();
    };
  }, [selectedUser, currentUserId, chatId, messagesRef]);

  return (
    <main>
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
    </main>
  );
}

export default ChatMessages;
