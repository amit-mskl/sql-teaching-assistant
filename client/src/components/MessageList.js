import React from 'react';
import Message from './Message';

const MessageList = ({ messages, course = 'sql' }) => {
  return (
    <>
      {messages.map((message, index) => (
        <Message 
          key={index}
          content={message.content}
          isUser={message.role === 'user'}
          course={course}
        />
      ))}
    </>
  );
};

export default MessageList;