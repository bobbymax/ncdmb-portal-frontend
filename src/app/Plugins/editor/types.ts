import {
  BaseEditor,
  BaseRange,
  BaseSelection,
  Descendant,
  Element as SlateElement,
} from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | ListElement
  | ListItemElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | ImageElement
  | FileAttachmentElement
  | LinkElement
  | DatabaseRecordElement;

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
};

export type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
  align?: "left" | "center" | "right" | "justify";
};

export type HeadingElement = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: CustomText[];
  align?: "left" | "center" | "right" | "justify";
};

export type ListElement = {
  type: "bulleted-list" | "numbered-list";
  children: ListItemElement[];
};

export type ListItemElement = {
  type: "list-item";
  children: CustomText[];
};

export type TableElement = {
  type: "table";
  children: TableRowElement[];
  cols?: number;
  rows?: number;
};

export type TableRowElement = {
  type: "table-row";
  children: TableCellElement[];
};

export type TableCellElement = {
  type: "table-cell";
  children: CustomText[];
  header?: boolean;
  colSpan?: number;
  rowSpan?: number;
};

export type ImageElement = {
  type: "image";
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  children: CustomText[];
};

export type FileAttachmentElement = {
  type: "file-attachment";
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: string;
    thumbnail?: string;
  };
  children: CustomText[];
};

export type LinkElement = {
  type: "link";
  url: string;
  children: CustomText[];
};

export type DatabaseRecordElement = {
  type: "database-record";
  record: {
    id: string;
    type: string;
    title: string;
    data: Record<string, any>;
    url?: string;
  };
  children: CustomText[];
};

export type CustomRange = BaseRange & {
  color?: string;
  backgroundColor?: string;
};

export type CustomSelection = BaseSelection | CustomRange;

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
    Range: CustomRange;
    Selection: CustomSelection;
  }
}

export type EditorProps = {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onSave?: (value: Descendant[]) => void;
  onFileUpload?: (file: File) => Promise<string>;
  onDatabaseQuery?: (query: string) => Promise<any[]>;
  toolbarConfig?: ToolbarConfig;
};

export type ToolbarConfig = {
  showFormatting?: boolean;
  showLists?: boolean;
  showTables?: boolean;
  showImages?: boolean;
  showFiles?: boolean;
  showLinks?: boolean;
  showDatabase?: boolean;
  showAlignment?: boolean;
  showColors?: boolean;
  showFontSize?: boolean;
};

export type FormatType =
  | "bold"
  | "italic"
  | "underline"
  | "code"
  | "color"
  | "backgroundColor";

export type BlockType =
  | "paragraph"
  | "heading"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "heading-4"
  | "heading-5"
  | "heading-6"
  | "bulleted-list"
  | "numbered-list"
  | "list-item"
  | "table"
  | "table-row"
  | "table-cell"
  | "image"
  | "file-attachment"
  | "link"
  | "database-record";
