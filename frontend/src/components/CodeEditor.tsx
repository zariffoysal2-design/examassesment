import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { RotateCcw, Trash2, Sun, Moon, Code } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onReset: () => void;
  onClear: () => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onReset,
  onClear,
  readOnly = false,
}) => {
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'vs-dark' ? 'light' : 'vs-dark'));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        
        {/* Left: Language Indicator */}
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">Python 3</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
            3.10
          </span>
        </div>

        {/* Right: Actions (Theme, Reset, Clear) */}
        {!readOnly && (
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition duration-150 cursor-pointer"
              title={`Switch to ${theme === 'vs-dark' ? 'Light' : 'Dark'} Theme`}
            >
              {theme === 'vs-dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>

            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition duration-150 cursor-pointer"
              title="Reset Code to Starter Template"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px]">Reset</span>
            </button>

            <button
              onClick={onClear}
              className="flex items-center space-x-1.5 px-2.5 py-1 text-red-400 hover:text-red-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition duration-150 cursor-pointer"
              title="Clear Editor Content"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Clear</span>
            </button>
          </div>
        )}

      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 min-h-[350px] relative">
        <Editor
          height="100%"
          language="python"
          theme={theme}
          value={code}
          onChange={(val) => onChange(val || '')}
          options={{
            readOnly,
            fontSize: 13,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'Fira Code', 'Courier New', monospace",
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
        />
      </div>

    </div>
  );
};

export default CodeEditor;
