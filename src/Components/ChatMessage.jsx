import React from 'react';
import { auth } from '../firebase/firebase';

function ChatMessage({ message }) {
  const { text, uid, photoURL } = message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
        <div className={`message ${messageClass}`}>
          <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="avatar" />
      <p>
          {text}
        {
            
            message.status === 'sent' && messageClass === 'sent' && (
                <span className="text-md text-gray-400">✓</span>
            )
        }
        {
          message.status === 'delivered' && messageClass === 'sent' &&  (
              <span className="text-md text-gray-400">✓✓</span>
            )
        }
        {
          message.status === 'read' && messageClass === 'sent' &&  (
              <span className="text-md font-extrabold text-blue-700">✓✓</span>
            )
        }
    </p>
      
    </div>
  );
}

export default ChatMessage;
