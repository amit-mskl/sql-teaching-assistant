import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Message = ({ content, isUser, course = 'sql' }) => {
  const [sqlResults, setSqlResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { token } = useAuth();

  const getCourseBranding = (courseId) => {
    switch(courseId) {
      case 'sql':
        return { avatar: '🤖' };
      case 'react':
        return { avatar: '🛡️' };
      case 'python':
        return { avatar: '🧬' };
      default:
        return { avatar: '🦉' };
    }
  };

  const branding = getCourseBranding(course);

  // Extract SQL query from message content
  const extractSQLQuery = (content) => {
    const sqlMatch = content.match(/```sql\s*\n([\s\S]*?)\n```/);
    return sqlMatch ? sqlMatch[1].trim() : null;
  };

  // Execute SQL query
  const executeSQL = async (query) => {
    if (!query || course !== 'sql') return;
    
    setIsExecuting(true);
    try {
      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query, course })
      });

      const data = await response.json();
      setSqlResults(data);
    } catch (error) {
      setSqlResults({
        success: false,
        error: 'FRIDAY: Connection error. Tony\'s workshop systems are offline.',
        results: null
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Auto-execute SQL when message contains SQL code and is from user (but not from Monaco Editor)
  useEffect(() => {
    if (isUser && course === 'sql') {
      const sqlQuery = extractSQLQuery(content);
      if (sqlQuery) {
        executeSQL(sqlQuery);
      }
    }
  }, [content, isUser, course]);

  // Render SQL results table
  const renderSQLResults = (results) => {
    if (!results) return null;

    if (!results.success) {
      return (
        <div className="sql-result error">
          <div className="sql-header">
            <span className="sql-icon">⚠️</span>
            <strong>SQL Execution Failed</strong>
          </div>
          <div className="sql-error">{results.error}</div>
        </div>
      );
    }

    if (!results.results || results.results.length === 0) {
      return (
        <div className="sql-result success">
          <div className="sql-header">
            <span className="sql-icon">✅</span>
            <strong>Query Executed Successfully</strong>
            <span className="sql-timing">({results.executionTime}ms)</span>
          </div>
          <div className="sql-message">FRIDAY: Query executed successfully. No rows returned.</div>
        </div>
      );
    }

    const columns = Object.keys(results.results[0]);
    
    return (
      <div className="sql-result success">
        <div className="sql-header">
          <span className="sql-icon">🤖</span>
          <strong>FRIDAY: Query Results</strong>
          <span className="sql-timing">({results.executionTime}ms • {results.rowCount} rows)</span>
        </div>
        <div className="sql-table-container">
          <table className="sql-table">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.results.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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
          {/* Show SQL execution results for user messages */}
          {course === 'sql' && (isExecuting || sqlResults) && (
            <div className="sql-execution-area">
              {isExecuting && (
                <div className="sql-executing">
                  <span className="sql-icon">🔄</span>
                  <em>FRIDAY: Executing query in Tony's workshop...</em>
                </div>
              )}
              {renderSQLResults(sqlResults)}
            </div>
          )}
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