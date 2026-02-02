import React, { useRef, useState } from 'react'
import Editor, { OnMount, OnChange } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { Play, RotateCcw, Save, Settings, Maximize2, Minimize2 } from 'lucide-react'

interface MonacoCodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'c' | 'cpp' | 'python' | 'javascript'
  onRun?: () => void
  onSave?: () => void
  onReset?: () => void
  isLoading?: boolean
  readOnly?: boolean
  className?: string
}

const LANGUAGE_CONFIGS = {
  c: {
    language: 'c',
    defaultValue: `#include <stdio.h>

int main() {
    // Write your C code here
    printf("Hello, World!\\n");
    return 0;
}`,
    fileExtension: '.c'
  },
  cpp: {
    language: 'cpp',
    defaultValue: `#include <iostream>
using namespace std;

int main() {
    // Write your C++ code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
    fileExtension: '.cpp'
  },
  python: {
    language: 'python',
    defaultValue: `# Write your Python code here
def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
    fileExtension: '.py'
  },
  javascript: {
    language: 'javascript',
    defaultValue: `// Write your JavaScript code here
function main() {
    console.log("Hello, World!");
}

main();`,
    fileExtension: '.js'
  }
}

const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  value,
  onChange,
  language,
  onRun,
  onSave,
  onReset,
  isLoading = false,
  readOnly = false,
  className = ''
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('off')

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Configure editor theme
    monaco.editor.defineTheme('codeforge-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'operator', foreground: 'D4D4D4' },
      ],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#E6EDF3',
        'editor.lineHighlightBackground': '#161B22',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorCursor.foreground': '#FFFFFF',
        'editorWhitespace.foreground': '#404040',
        'editorLineNumber.foreground': '#6E7681',
        'editorLineNumber.activeForeground': '#F0F6FC',
        'editor.findMatchBackground': '#515C6A',
        'editor.findMatchHighlightBackground': '#EA6100',
        'editorBracketMatch.background': '#0E639C50',
        'editorBracketMatch.border': '#888888',
      }
    })

    monaco.editor.setTheme('codeforge-dark')

    // Configure editor options
    editor.updateOptions({
      fontSize: fontSize,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Cascadia Code', monospace",
      fontLigatures: true,
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: language === 'python' ? 4 : 2,
      insertSpaces: true,
      wordWrap: wordWrap,
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showVariables: true,
        showClasses: true,
        showModules: true
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      parameterHints: { enabled: true },
      hover: { enabled: true },
      contextmenu: false, // Disable right-click context menu to prevent copy/paste
      mouseWheelZoom: true,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      renderWhitespace: 'selection',
      renderControlCharacters: false,
      renderLineHighlight: 'line',
      occurrencesHighlight: 'singleFile',
      selectionHighlight: true,
      foldingHighlight: true,
      unfoldOnClickAfterEndOfLine: true,
      showFoldingControls: 'mouseover',
      matchBrackets: 'always',
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoSurround: 'languageDefined',
      formatOnPaste: false, // Disable format on paste
      formatOnType: true,
      dragAndDrop: false, // Disable drag and drop
      links: true,
      colorDecorators: true,
      readOnly: readOnly || isLoading
    })

    // Disable copy/paste keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      // Block copy - do nothing
      return null
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      // Block paste - do nothing
      return null
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
      // Block cut - do nothing
      return null
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA, () => {
      // Block select all - do nothing
      return null
    })

    // Block Ctrl+Shift+V (paste without formatting)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyV, () => {
      return null
    })

    // Block F1 (command palette)
    editor.addCommand(monaco.KeyCode.F1, () => {
      return null
    })

    // Add allowed keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun?.()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR, () => {
      onReset?.()
    })

    // Focus editor
    editor.focus()
  }

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      onChange(value)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 24)
    setFontSize(newSize)
    editorRef.current?.updateOptions({ fontSize: newSize })
  }

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 10)
    setFontSize(newSize)
    editorRef.current?.updateOptions({ fontSize: newSize })
  }

  const toggleWordWrap = () => {
    const newWrap = wordWrap === 'on' ? 'off' : 'on'
    setWordWrap(newWrap)
    editorRef.current?.updateOptions({ wordWrap: newWrap })
  }

  const formatCode = () => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run()
  }

  const config = LANGUAGE_CONFIGS[language]

  return (
    <div className={`relative bg-[#0D1117] border border-gray-700 rounded-lg overflow-hidden ${className} ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-sm text-gray-400 font-mono">
            main{config.fileExtension}
          </span>
          <span className="text-xs text-gray-500 uppercase font-semibold">
            {config.language}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Font Size Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={decreaseFontSize}
              className="p-1 text-gray-400 hover:text-white transition-colors rounded"
              title="Decrease font size"
            >
              <span className="text-xs font-mono">A-</span>
            </button>
            <span className="text-xs text-gray-500 font-mono w-6 text-center">{fontSize}</span>
            <button
              onClick={increaseFontSize}
              className="p-1 text-gray-400 hover:text-white transition-colors rounded"
              title="Increase font size"
            >
              <span className="text-xs font-mono">A+</span>
            </button>
          </div>

          {/* Editor Controls */}
          <button
            onClick={toggleWordWrap}
            className="p-1.5 text-gray-400 hover:text-white transition-colors rounded"
            title={`${wordWrap === 'on' ? 'Disable' : 'Enable'} word wrap`}
          >
            <span className="text-xs font-mono">↩</span>
          </button>

          <button
            onClick={formatCode}
            className="p-1.5 text-gray-400 hover:text-white transition-colors rounded"
            title="Format code (Shift+Alt+F)"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-400 hover:text-white transition-colors rounded"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Action Buttons */}
          {onReset && (
            <button
              onClick={onReset}
              disabled={isLoading}
              className="p-1.5 text-gray-400 hover:text-white transition-colors rounded disabled:opacity-50"
              title="Reset code (Ctrl+Shift+R)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {onSave && (
            <button
              onClick={onSave}
              disabled={isLoading}
              className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors rounded disabled:opacity-50"
              title="Save code (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
            </button>
          )}

          {onRun && (
            <button
              onClick={onRun}
              disabled={isLoading}
              className="p-1.5 text-green-400 hover:text-green-300 transition-colors rounded disabled:opacity-50"
              title="Run code (Ctrl+Enter)"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div 
        className={isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-[70vh] min-h-[600px]'}
        onCopy={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        style={{ userSelect: 'text' }} // Allow text selection for reading but prevent copy
      >
        <Editor
          height="100%"
          language={config.language}
          value={value || config.defaultValue}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full bg-[#0D1117]">
              <div className="text-gray-400">Loading editor...</div>
            </div>
          }
          options={{
            readOnly: readOnly || isLoading
          }}
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
            <span className="text-white">Processing...</span>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 font-mono opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-gray-800/90 p-2 rounded space-y-1">
          <div>Ctrl+S: Save</div>
          <div>Ctrl+Enter: Run</div>
          <div>Ctrl+Shift+R: Reset</div>
          <div>Shift+Alt+F: Format</div>
        </div>
      </div>
    </div>
  )
}

export default MonacoCodeEditor