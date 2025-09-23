import React, { useState } from "react";
import { Editor } from "./index";
import { Descendant } from "slate";

const EditorExample: React.FC = () => {
  const [content, setContent] = useState<Descendant[]>([
    {
      type: "paragraph",
      children: [
        { text: "Welcome to the Rich Text Editor! Start typing here..." },
      ],
    },
  ]);

  const handleSave = (value: Descendant[]) => {
    // Saving content
    // In a real app, you would save this to your database
    alert("Content saved! Check the console for the data structure.");
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    // Simulate file upload
    return new Promise((resolve) => {
      setTimeout(() => {
        const fakeUrl = `https://example.com/uploads/${file.name}`;
        // File uploaded
        resolve(fakeUrl);
      }, 1000);
    });
  };

  const handleDatabaseQuery = async (query: string): Promise<any[]> => {
    // Simulate database query
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockRecords = [
          {
            id: "1",
            type: "user",
            title: "John Doe",
            data: { email: "john@example.com", role: "Admin" },
            url: "/users/1",
          },
          {
            id: "2",
            type: "user",
            title: "Jane Smith",
            data: { email: "jane@example.com", role: "User" },
            url: "/users/2",
          },
        ];
        // Database query executed
        resolve(mockRecords);
      }, 500);
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Rich Text Editor Example</h1>
      <p>
        This is a demonstration of the WYSIWYG editor with Slate.js. Try the
        following features:
      </p>
      <ul>
        <li>Type and format text (bold, italic, underline)</li>
        <li>Create headings and lists</li>
        <li>Insert tables</li>
        <li>Add images and file attachments</li>
        <li>Insert links and database records</li>
        <li>Use keyboard shortcuts (Ctrl+S to save, Ctrl+B for bold)</li>
      </ul>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => handleSave(content)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Save Content
        </button>
        <span style={{ marginLeft: "10px", color: "#6b7280" }}>
          Or use Ctrl+S while editing
        </span>
      </div>

      <Editor
        value={content}
        onChange={setContent}
        onFileUpload={handleFileUpload}
        onDatabaseQuery={handleDatabaseQuery}
        placeholder="Start typing your document..."
      />

      <div style={{ marginTop: "20px" }}>
        <h3>Content Preview (JSON):</h3>
        <pre
          style={{
            backgroundColor: "#f3f4f6",
            padding: "16px",
            borderRadius: "6px",
            overflow: "auto",
            maxHeight: "300px",
            fontSize: "12px",
          }}
        >
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EditorExample;
