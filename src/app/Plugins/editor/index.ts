// Main Editor Component
export { default as Editor } from "./components/Editor";

// Editor Components
export { default as Toolbar } from "./components/Toolbar";
export { default as Elements } from "./components/Elements";
export { default as Leaf } from "./components/Leaf";

// Types
export type {
  CustomEditor,
  CustomElement,
  CustomText,
  EditorProps,
  ToolbarConfig,
  FormatType,
  BlockType,
  ParagraphElement,
  HeadingElement,
  ListElement,
  ListItemElement,
  TableElement,
  TableRowElement,
  TableCellElement,
  ImageElement,
  FileAttachmentElement,
  LinkElement,
  DatabaseRecordElement,
} from "./types";

// Utilities
export {
  isBlockActive,
  isMarkActive,
  toggleBlock,
  toggleMark,
  insertTable,
  insertImage,
  insertFileAttachment,
  insertLink,
  insertDatabaseRecord,
  withTables,
  withImages,
  withFileAttachments,
  withLinks,
  withDatabaseRecords,
  serialize,
  deserialize,
} from "./utils";

// Default export for convenience
export { default } from "./components/Editor";
