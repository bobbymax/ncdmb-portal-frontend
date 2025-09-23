import React, { useCallback, useMemo } from "react";
import { useSlate } from "slate-react";
import { addMark } from "slate";
import { CustomEditor, BlockType, FormatType, ToolbarConfig } from "../types";
import { isBlockActive, isMarkActive, toggleBlock, toggleMark } from "../utils";

interface ToolbarProps {
  config?: ToolbarConfig;
  onInsertTable?: () => void;
  onInsertImage?: () => void;
  onInsertFile?: () => void;
  onInsertLink?: () => void;
  onInsertDatabaseRecord?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  config = {},
  onInsertTable,
  onInsertImage,
  onInsertFile,
  onInsertLink,
  onInsertDatabaseRecord,
}) => {
  const editor = useSlate();

  const formatButton = useCallback(
    (format: FormatType, icon: string, label: string) => {
      const isActive = isMarkActive(editor, format);
      return (
        <button
          key={format}
          className={`toolbar-button ${isActive ? "active" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            // Format button clicked
            toggleMark(editor, format);
          }}
          title={label}
          data-format={format}
        >
          <i className={icon}></i>
        </button>
      );
    },
    [editor]
  );

  const blockButton = useCallback(
    (format: BlockType, icon: string, label: string) => {
      const isActive = isBlockActive(editor, format);
      return (
        <button
          key={format}
          className={`toolbar-button ${isActive ? "active" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            // Block button clicked
            toggleBlock(editor, format);
          }}
          title={label}
          data-format={format}
        >
          <i className={icon}></i>
        </button>
      );
    },
    [editor]
  );

  const insertButton = useCallback(
    (onClick: () => void, icon: string, label: string) => {
      return (
        <button
          key={label}
          className="toolbar-button"
          onMouseDown={(e) => {
            e.preventDefault();
            onClick();
          }}
          title={label}
        >
          <i className={icon}></i>
        </button>
      );
    },
    []
  );

  const formatButtons = useMemo(() => {
    if (!config.showFormatting) return null;

    return (
      <div className="toolbar-group">
        {formatButton("bold", "ri-bold", "Bold")}
        {formatButton("italic", "ri-italic", "Italic")}
        {formatButton("underline", "ri-underline", "Underline")}
        {formatButton("code", "ri-code-s-slash-line", "Code")}
      </div>
    );
  }, [config.showFormatting, formatButton]);

  const blockButtons = useMemo(() => {
    if (!config.showLists && !config.showAlignment) return null;

    return (
      <div className="toolbar-group">
        {config.showLists && (
          <>
            {blockButton("bulleted-list", "ri-list-unordered", "Bullet List")}
            {blockButton("numbered-list", "ri-list-ordered", "Numbered List")}
          </>
        )}
        {config.showAlignment && (
          <>
            {blockButton("paragraph", "ri-align-left", "Paragraph")}
            {blockButton("heading-1", "ri-h-1", "Heading 1")}
            {blockButton("heading-2", "ri-h-2", "Heading 2")}
            {blockButton("heading-3", "ri-h-3", "Heading 3")}
          </>
        )}
      </div>
    );
  }, [config.showLists, config.showAlignment, blockButton]);

  const fontSizeControl = useMemo(() => {
    if (!config.showFontSize) return null;

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const size = e.target.value;
      if (size) {
        // Apply font size to selected text
        addMark(editor, "fontSize", size);
      }
    };

    return (
      <div className="toolbar-group">
        <select
          className="font-size-select"
          onChange={handleFontSizeChange}
          defaultValue="16"
          title="Font Size"
        >
          {Array.from({ length: 27 }, (_, i) => i + 10).map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    );
  }, [config.showFontSize, editor]);

  const insertButtons = useMemo(() => {
    const buttons = [];

    if (config.showTables && onInsertTable) {
      buttons.push(
        insertButton(onInsertTable, "ri-table-line", "Insert Table")
      );
    }

    if (config.showImages && onInsertImage) {
      buttons.push(
        insertButton(onInsertImage, "ri-image-line", "Insert Image")
      );
    }

    if (config.showFiles && onInsertFile) {
      buttons.push(
        insertButton(onInsertFile, "ri-attachment-2", "Attach File")
      );
    }

    if (config.showLinks && onInsertLink) {
      buttons.push(insertButton(onInsertLink, "ri-link", "Insert Link"));
    }

    if (config.showDatabase && onInsertDatabaseRecord) {
      buttons.push(
        insertButton(
          onInsertDatabaseRecord,
          "ri-database-2-line",
          "Insert Database Record"
        )
      );
    }

    if (buttons.length === 0) return null;

    return <div className="toolbar-group">{buttons}</div>;
  }, [
    config,
    onInsertTable,
    onInsertImage,
    onInsertFile,
    onInsertLink,
    onInsertDatabaseRecord,
    insertButton,
  ]);

  return (
    <div className="editor-toolbar">
      {formatButtons}
      {blockButtons}
      {fontSizeControl}
      {insertButtons}
    </div>
  );
};

export default Toolbar;
