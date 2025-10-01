import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  placeholder?: string;
  isDisabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  label,
  name,
  value,
  onChange,
  language = "json",
  height = "300px",
  placeholder = "Enter configuration...",
  isDisabled = false,
  size = "lg",
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      readOnly: isDisabled,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: "on",
      lineNumbers: "on",
      folding: true,
      bracketPairColorization: { enabled: true },
      renderWhitespace: "selection",
      renderControlCharacters: true,
    });

    // Add placeholder text if value is empty
    if (!value || value.trim() === "") {
      editor.setValue(placeholder);
      editor.setSelection(editor.getModel()?.getFullModelRange());
    }
  };

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      // Remove placeholder if it's being replaced
      if (newValue === placeholder) {
        onChange("");
        return;
      }
      onChange(newValue);
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "md":
        return "text-base";
      case "lg":
        return "text-lg";
      case "xl":
        return "text-xl";
      default:
        return "text-base";
    }
  };

  return (
    <div className="storm-form-group">
      {label && (
        <label className="storm-form-label" htmlFor={name}>
          {label}:
        </label>
      )}
      <div className="code-editor-container">
        <Editor
          height={height}
          language={language}
          value={value || ""}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-light"
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: isDisabled,
            cursorStyle: "line",
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
            folding: true,
            bracketPairColorization: { enabled: true },
            renderWhitespace: "selection",
            renderControlCharacters: true,
            fontSize: 14,
            fontFamily:
              "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            trimAutoWhitespace: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
      <div className="code-editor-info">
        <small className="text-muted">
          <i className="ri-code-s-slash-line mr-1"></i>
          {language.toUpperCase()} Editor • Use Ctrl+Shift+F to format
        </small>
      </div>
    </div>
  );
};

export default CodeEditor;
