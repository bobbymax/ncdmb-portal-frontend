// components/forms/RichTextEditorWrapper.tsx
import React from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Toolbar from "./Toolbar";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditorWrapper: React.FC<Props> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return <p>Loading editor...</p>;

  return (
    <div className="tiptap-editor">
      <Toolbar editor={editor} />
      <div>
        {editor ? <EditorContent editor={editor} /> : <p>Loading editor...</p>}
      </div>
    </div>
  );
};

export default RichTextEditorWrapper;
