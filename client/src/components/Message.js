import React from 'react';

const Message = ({ content, isUser, course = 'sql' }) => {
  const getCourseBranding = (courseId) => {
    switch(courseId) {
      case 'sql':
        return { avatar: '🤖' };
      default:
        return { avatar: '🦉' };
    }
  };

  const branding = getCourseBranding(course);

  const formatMessage = (content) => {
    return content
      // Handle headings
      .replace(/### (.*?)(?:\n|$)/g, '<h3>$1</h3>')
      .replace(/## (.*?)(?:\n|$)/g, '<h2>$1</h2>')
      .replace(/# (.*?)(?:\n|$)/g, '<h1>$1</h1>')
      // Handle code blocks first (before line breaks)
      .replace(/```sql\s*\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>')
      .replace(/```\s*\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Handle inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Handle numbered lists with better styling
      .replace(/^\d+\.\s+(.*?)(?=\n|$)/gm, '<div style="margin: 8px 0 8px 20px; display: flex;"><span style="margin-right: 10px; font-weight: bold; color: #666;">•</span><span>$1</span></div>')
      // Handle bullet points
      .replace(/^-\s+(.*?)(?=\n|$)/gm, '<div style="margin: 8px 0 8px 20px; display: flex;"><span style="margin-right: 10px; color: #666;">•</span><span>$1</span></div>')
      // Handle line breaks (after lists)
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      {isUser ? (
        <div className="message-content">
          {content}
        </div>
      ) : (
        <>
          <div className="message-avatar">{branding.avatar}</div>
          <div 
            className="message-content"
            dangerouslySetInnerHTML={{ __html: formatMessage(content) }}
          />
        </>
      )}
    </div>
  );
};

export default Message;