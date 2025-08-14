import React from 'react';
import Message from './Message';

const MessageList = ({ messages }) => {
  return (
    <>
      {messages.map((message, index) => (
        <Message 
          key={index}
          content={message.content}
          isUser={message.role === 'user'}
        />
      ))}
    </>
  );
};

export default MessageList;