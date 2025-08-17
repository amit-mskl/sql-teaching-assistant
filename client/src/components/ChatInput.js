import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const ChatInput = ({ onSendMessage, disabled, course = 'sql', latestMessage = null }) => {
  const [message, setMessage] = useState('');
  const [editorMode, setEditorMode] = useState('plain'); // 'plain', 'sql', 'markdown'

  // Detect SQL templates in the latest assistant message
  useEffect(() => {
    if (latestMessage && !latestMessage.isUser && course === 'sql') {
      const sqlTemplate = extractSQLTemplate(latestMessage.content);
      if (sqlTemplate) {
        setEditorMode('sql');
        setMessage(sqlTemplate);
      }
    }
  }, [latestMessage, course]);

  // Extract SQL template from assistant message
  const extractSQLTemplate = (content) => {
    const sqlMatch = content.match(/```sql\s*\n([\s\S]*?)\n```/);
    return sqlMatch ? sqlMatch[1].trim() : null;
  };

  const getCoursePlaceholder = (courseId) => {
    const courseNames = {
      sql: 'Data Analysis using SQL',
      react: 'E-commerce App with React & Node',
      python: 'Data Science Foundation',
      excel: 'Excel Essentials'
    };
    const courseName = courseNames[courseId] || courseId;
    return `Ask me anything about the course - ${courseName}`;
  };

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;
    
    // Format message based on editor mode
    let formattedMessage = message.trim();
    if (editorMode === 'sql') {
      formattedMessage = `\`\`\`sql\n${message.trim()}\n\`\`\``;
    } else if (editorMode === 'markdown') {
      // Keep as is for markdown
    }
    
    onSendMessage(formattedMessage);
    setMessage('');
    setEditorMode('plain'); // Reset to plain mode after sending
  };

  const getEditorLanguage = () => {
    switch (editorMode) {
      case 'sql': return 'sql';
      case 'markdown': return 'markdown';
      default: return 'plaintext';
    }
  };

  const getPlaceholder = () => {
    switch (editorMode) {
      case 'sql': return 'Write your SQL query here...';
      case 'markdown': return 'Write your response in Markdown...';
      default: return getCoursePlaceholder(course);
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'sql': return '🔍';
      case 'markdown': return '📝';
      default: return '💬';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="chat-input-container">
      {/* Editor Mode Selector */}
      <div className="editor-mode-header">
        <div className="mode-selector">
          <button
            className={`mode-btn ${editorMode === 'plain' ? 'active' : ''}`}
            onClick={() => setEditorMode('plain')}
          >
            {getModeIcon('plain')} Plain
          </button>
          <button
            className={`mode-btn ${editorMode === 'sql' ? 'active' : ''}`}
            onClick={() => setEditorMode('sql')}
          >
            {getModeIcon('sql')} SQL
          </button>
          <button
            className={`mode-btn ${editorMode === 'markdown' ? 'active' : ''}`}
            onClick={() => setEditorMode('markdown')}
          >
            {getModeIcon('markdown')} Markdown
          </button>
        </div>
        {editorMode === 'sql' && (
          <div className="sql-mode-hint">
            <span>🤖 FRIDAY SQL Workshop</span>
          </div>
        )}
      </div>

      <div className="chat-input-wrapper">
        {editorMode === 'plain' ? (
          <textarea 
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="chat-input" 
            placeholder={getPlaceholder()}
            rows="1"
            disabled={disabled}
          />
        ) : (
          <div className="monaco-input-wrapper">
            <Editor
              height="120px"
              language={getEditorLanguage()}
              value={message}
              onChange={(value) => setMessage(value || '')}
              onMount={(editor, monaco) => {
                // Configure SQL language highlighting with classic colors
                if (getEditorLanguage() === 'sql') {
                  monaco.editor.defineTheme('sql-classic', {
                    base: 'vs',
                    inherit: true,
                    rules: [
                      { token: 'keyword.sql', foreground: '0000FF', fontStyle: 'bold' }, // Blue keywords
                      { token: 'string.sql', foreground: 'A31515' }, // Red strings
                      { token: 'comment.sql', foreground: '008000', fontStyle: 'italic' }, // Green comments
                      { token: 'number.sql', foreground: '098658' }, // Dark green numbers
                      { token: 'operator.sql', foreground: '000000' }, // Black operators
                    ],
                    colors: {
                      'editor.background': '#FFFFFF',
                      'editor.foreground': '#000000',
                      'editor.selectionBackground': '#ADD6FF',
                      'editor.lineHighlightBackground': '#F5F5F5'
                    }
                  });
                  monaco.editor.setTheme('sql-classic');
                }
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'off',
                folding: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 0,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                scrollbar: {
                  vertical: 'hidden',
                  horizontal: 'hidden'
                },
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                overviewRulerLanes: 0,
                padding: { top: 12, bottom: 12 }
              }}
              theme="vs"
            />
          </div>
        )}
        
        <div className="input-actions">
          <button 
            onClick={handleSubmit}
            disabled={disabled || !message.trim()}
            className={`send-button ${editorMode === 'sql' ? 'sql-mode' : ''}`}
          >
{editorMode === 'sql' ? '▶ Execute' : '↗'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;