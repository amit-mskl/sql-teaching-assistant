import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useAuth } from '../contexts/AuthContext';

const SQLEditor = ({ initialCode = '', onExecute, isExecuting = false }) => {
  const [code, setCode] = useState(initialCode);
  const editorRef = useRef(null);
  const { token } = useAuth();

  // Database schema for auto-completion
  const dbSchema = {
    employees: ['id', 'name', 'department', 'salary', 'hire_date', 'manager_id'],
    departments: ['id', 'name', 'budget', 'location'],
    products: ['id', 'name', 'category', 'price', 'stock_quantity'],
    orders: ['id', 'customer_name', 'product_id', 'quantity', 'order_date', 'total_amount']
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure SQL language
    monaco.languages.setMonarchTokensProvider('sql', {
      tokenizer: {
        root: [
          [/\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ON|GROUP BY|ORDER BY|HAVING|DISTINCT|COUNT|SUM|AVG|MAX|MIN|AS|AND|OR|NOT|IN|LIKE|BETWEEN|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|DATABASE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|NULL|NOT NULL|DEFAULT|AUTO_INCREMENT|LIMIT|OFFSET)\b/i, 'keyword'],
          [/\b(employees|departments|products|orders)\b/i, 'type'],
          [/\b(id|name|department|salary|hire_date|manager_id|budget|location|category|price|stock_quantity|customer_name|product_id|quantity|order_date|total_amount)\b/i, 'variable'],
          [/'[^']*'/, 'string'],
          [/"[^"]*"/, 'string'],
          [/\d+/, 'number'],
          [/--.*$/, 'comment'],
          [/\/\*[\s\S]*?\*\//, 'comment']
        ]
      }
    });

    // Add auto-completion
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const suggestions = [];
        
        // SQL Keywords
        const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'LIMIT', 'OFFSET'];
        keywords.forEach(keyword => {
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword
          });
        });

        // Table names
        Object.keys(dbSchema).forEach(table => {
          suggestions.push({
            label: table,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: table,
            detail: 'Table'
          });
        });

        // Column names
        Object.entries(dbSchema).forEach(([table, columns]) => {
          columns.forEach(column => {
            suggestions.push({
              label: `${table}.${column}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: column,
              detail: `Column in ${table}`
            });
          });
        });

        return { suggestions };
      }
    });

    // Set dark theme for Stark Industries feel
    monaco.editor.defineTheme('stark-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '#569cd6', fontStyle: 'bold' },
        { token: 'type', foreground: '#4ec9b0', fontStyle: 'bold' },
        { token: 'variable', foreground: '#9cdcfe' },
        { token: 'string', foreground: '#ce9178' },
        { token: 'number', foreground: '#b5cea8' },
        { token: 'comment', foreground: '#6a9955', fontStyle: 'italic' }
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41'
      }
    });

    monaco.editor.setTheme('stark-theme');

    // Add Ctrl+Enter to execute
    editor.addAction({
      id: 'execute-sql',
      label: 'Execute SQL',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        if (onExecute && !isExecuting) {
          onExecute(editor.getValue());
        }
      }
    });
  };

  const handleExecute = () => {
    if (onExecute && !isExecuting && code.trim()) {
      onExecute(code);
    }
  };

  return (
    <div className="sql-editor-container">
      <div className="sql-editor-header">
        <div className="sql-editor-title">
          <span className="sql-icon">🤖</span>
          <strong>FRIDAY SQL Workshop</strong>
          <span className="sql-hint">Press Ctrl+Enter to execute</span>
        </div>
        <button 
          className={`sql-execute-btn ${isExecuting ? 'executing' : ''}`}
          onClick={handleExecute}
          disabled={isExecuting || !code.trim()}
        >
          {isExecuting ? (
            <>
              <span className="sql-spinner">⚡</span>
              Executing...
            </>
          ) : (
            <>
              <span>▶️</span>
              Run SQL
            </>
          )}
        </button>
      </div>
      <div className="monaco-editor-wrapper">
        <Editor
          height="200px"
          defaultLanguage="sql"
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            suggest: {
              snippetsPreventQuickSuggestions: false
            },
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on'
          }}
        />
      </div>
    </div>
  );
};

export default SQLEditor;