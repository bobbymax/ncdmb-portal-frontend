import React, { useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const CKEditorWrapper: React.FC<Props> = ({ value, onChange }) => {
  const editorRef = useRef<any>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    // return () => {
    //   isMounted.current = false;

    //   const editor = editorRef.current;

    //   if (editor && editor.ui && editor.ui.view && editor.ui.view.editable) {
    //     try {
    //       editor.destroy();
    //     } catch (error) {
    //       console.warn("CKEditor destroy error:", error);
    //     }
    //   }

    //   editorRef.current = null;
    // };
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy().catch(() => {});
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <CKEditor
      editor={ClassicEditor}
      config={{
        toolbar: {
          items: ["bold", "italic", "link", "imageUpload", "undo", "redo"],
          shouldNotGroupWhenFull: true,
        },
        heading: {
          options: [
            { model: "paragraph", title: "Paragraph", view: "p" },
            { model: "heading1", title: "Heading 1", view: "h1" },
            { model: "heading2", title: "Heading 2", view: "h2" },
          ],
        },
        image: {
          toolbar: [
            "imageTextAlternative",
            "imageStyle:full",
            "imageStyle:side",
          ],
        },
        link: {
          decorators: {
            openInNewTab: {
              mode: "manual",
              label: "Open in a new tab",
              defaultValue: true,
              attributes: {
                target: "_blank",
                rel: "noopener noreferrer",
              },
            },
          },
        },
        placeholder: "Write your memo here...",
      }}
      data={value}
      onReady={(editor: any) => {
        if (isMounted.current) {
          editorRef.current = editor;
        }
      }}
      onChange={(_: any, editor: any) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
};

export default CKEditorWrapper;
