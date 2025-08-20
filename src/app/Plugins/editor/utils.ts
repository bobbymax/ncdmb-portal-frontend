import {
  Editor,
  Element as SlateElement,
  Transforms,
  Node,
  NodeEntry,
  Path,
} from "slate";
import {
  CustomEditor,
  CustomElement,
  CustomText,
  BlockType,
  FormatType,
  FileAttachmentElement,
  DatabaseRecordElement,
} from "./types";

export const isBlockActive = (
  editor: CustomEditor,
  format: BlockType
): boolean => {
  const { selection } = editor;
  if (!selection) return false;

  // Special handling for lists - check if we're inside a list item
  if (format === "bulleted-list" || format === "numbered-list") {
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          (n.type === "bulleted-list" || n.type === "numbered-list"),
      })
    );
    return !!match;
  }

  // For other block types, check the current element
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    })
  );

  return !!match;
};

export const isMarkActive = (
  editor: CustomEditor,
  format: FormatType
): boolean => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleBlock = (editor: CustomEditor, format: BlockType): void => {
  const isActive = isBlockActive(editor, format);
  const isList = format === "bulleted-list" || format === "numbered-list";
  const isHeading = format.startsWith("heading-");

  // If the format is already active, convert to paragraph
  if (isActive) {
    Transforms.setNodes(editor, { type: "paragraph" });
    return;
  }

  // Handle list creation
  if (isList) {
    // First, unwrap any existing list items
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n.type === "bulleted-list" || n.type === "numbered-list"),
      split: true,
    });

    // Convert current block to list-item
    Transforms.setNodes(editor, { type: "list-item" });

    // Wrap in the appropriate list type
    const list = { type: format, children: [] };
    Transforms.wrapNodes(editor, list);
    return;
  }

  // Handle heading creation
  if (isHeading) {
    const level = parseInt(format.split("-")[1]) as 1 | 2 | 3 | 4 | 5 | 6;
    Transforms.setNodes(editor, {
      type: "heading",
      level: level,
    });
    return;
  }

  // Handle other block types - ensure format is a valid element type
  const validElementTypes = [
    "paragraph",
    "table",
    "table-row",
    "table-cell",
    "image",
    "file-attachment",
    "link",
    "database-record",
  ] as const;

  if (validElementTypes.includes(format as any)) {
    Transforms.setNodes(editor, { type: format as any });
  }
};

export const toggleMark = (editor: CustomEditor, format: FormatType): void => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const insertTable = (
  editor: CustomEditor,
  rows: number = 3,
  cols: number = 3
): void => {
  // Validate input parameters
  if (rows < 1 || rows > 20 || cols < 1 || cols > 20) {
    console.warn("Invalid table dimensions:", { rows, cols });
    return;
  }

  // Check if we're already inside a table
  const { selection } = editor;

  if (selection) {
    const [match] = Array.from(
      Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          (n.type === "table" ||
            n.type === "table-row" ||
            n.type === "table-cell"),
      })
    );

    if (match) {
      console.warn("Cannot insert table inside existing table");
      return;
    }
  }

  // Create the table structure
  const table: CustomElement = {
    type: "table",
    cols,
    rows,
    children: [],
  };

  // Create rows
  for (let i = 0; i < rows; i++) {
    const row: CustomElement = {
      type: "table-row",
      children: [],
    };

    // Create cells for this row
    for (let j = 0; j < cols; j++) {
      const cell: CustomElement = {
        type: "table-cell",
        header: i === 0, // First row is header
        children: [{ text: "" }],
      };
      row.children.push(cell);
    }

    table.children.push(row);
  }

  // Insert the table at the current selection
  try {
    // Get the current selection path to know where to insert
    const currentPath = selection ? selection.anchor.path : [0];

    // Insert the table
    Transforms.insertNodes(editor, table, { at: currentPath });

    // Don't try to position cursor - let user click into table
    // This prevents the path resolution error
  } catch (error) {
    console.error("Error inserting table:", error);
  }
};

export const insertImage = (
  editor: CustomEditor,
  url: string,
  alt?: string
): void => {
  const image: CustomElement = {
    type: "image",
    url,
    alt,
    children: [{ text: "" }],
  };
  Transforms.insertNodes(editor, image);
};

export const insertFileAttachment = (
  editor: CustomEditor,
  file: FileAttachmentElement["file"]
): void => {
  const attachment: CustomElement = {
    type: "file-attachment",
    file,
    children: [{ text: "" }],
  };
  Transforms.insertNodes(editor, attachment);
};

export const insertLink = (
  editor: CustomEditor,
  url: string,
  text: string
): void => {
  const link: CustomElement = {
    type: "link",
    url,
    children: [{ text }],
  };
  Transforms.insertNodes(editor, link);
};

export const insertDatabaseRecord = (
  editor: CustomEditor,
  record: DatabaseRecordElement["record"]
): void => {
  const dbRecord: CustomElement = {
    type: "database-record",
    record,
    children: [{ text: "" }],
  };
  Transforms.insertNodes(editor, dbRecord);
};

export const withTables = (editor: CustomEditor): CustomEditor => {
  const {
    isVoid,
    isBlock,
    deleteBackward,
    deleteForward,
    insertBreak,
    normalizeNode,
  } = editor;

  editor.isVoid = (element) => {
    return element.type === "table" ? false : isVoid(element);
  };

  editor.isBlock = (element) => {
    return element.type === "table" ? true : isBlock(element);
  };

  // Normalize table nodes to prevent invalid nesting
  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // If the node is a table, ensure it's not nested inside paragraphs
    if (SlateElement.isElement(node) && node.type === "table") {
      const [parent] = Editor.parent(editor, path);

      // If parent is a paragraph, unwrap the table
      if (SlateElement.isElement(parent) && parent.type === "paragraph") {
        Transforms.unwrapNodes(editor, { at: path });
        return;
      }
    }

    // If the node is a paragraph, ensure it doesn't contain block elements
    if (SlateElement.isElement(node) && node.type === "paragraph") {
      for (const [child, childPath] of Array.from(
        Node.children(editor, path)
      )) {
        if (
          SlateElement.isElement(child) &&
          (child.type === "table" ||
            child.type === "image" ||
            child.type === "file-attachment" ||
            child.type === "database-record")
        ) {
          // Unwrap the block element from the paragraph
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }
    }

    // Call the original normalizeNode
    normalizeNode(entry);
  };

  // Handle backspace in table cells
  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection) {
      const [cell] = Array.from(
        Editor.nodes(editor, {
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === "table-cell",
        })
      );

      if (cell) {
        const [, cellPath] = cell;
        const [table] = Array.from(
          Editor.nodes(editor, {
            at: cellPath,
            match: (n) =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === "table",
          })
        );

        if (table) {
          // Don't allow backspace to break out of table cells
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  // Handle forward delete in table cells
  editor.deleteForward = (unit) => {
    const { selection } = editor;

    if (selection) {
      const [cell] = Array.from(
        Editor.nodes(editor, {
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === "table-cell",
        })
      );

      if (cell) {
        const [, cellPath] = cell;
        const [table] = Array.from(
          Editor.nodes(editor, {
            at: cellPath,
            match: (n) =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === "table",
          })
        );

        if (table) {
          // Don't allow forward delete to break out of table cells
          return;
        }
      }
    }

    deleteForward(unit);
  };

  // Handle enter key in table cells
  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection) {
      const [cell] = Array.from(
        Editor.nodes(editor, {
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === "table-cell",
        })
      );

      if (cell) {
        const [, cellPath] = cell;
        const [table] = Array.from(
          Editor.nodes(editor, {
            at: cellPath,
            match: (n) =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === "table",
          })
        );

        if (table) {
          // Don't allow enter to break out of table cells
          return;
        }
      }
    }

    insertBreak();
  };

  return editor;
};

export const withImages = (editor: CustomEditor): CustomEditor => {
  const { isVoid } = editor;
  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };
  return editor;
};

export const withFileAttachments = (editor: CustomEditor): CustomEditor => {
  const { isVoid } = editor;
  editor.isVoid = (element) => {
    return element.type === "file-attachment" ? true : isVoid(element);
  };
  return editor;
};

export const withLinks = (editor: CustomEditor): CustomEditor => {
  const { isInline } = editor;
  editor.isInline = (element) => {
    return element.type === "link" ? true : isInline(element);
  };
  return editor;
};

export const withDatabaseRecords = (editor: CustomEditor): CustomEditor => {
  const { isVoid } = editor;
  editor.isVoid = (element) => {
    return element.type === "database-record" ? true : isVoid(element);
  };
  return editor;
};

export const withLists = (editor: CustomEditor): CustomEditor => {
  const { normalizeNode, insertBreak, deleteBackward } = editor;

  // Track consecutive empty list items to implement double-enter behavior
  let emptyListItemCount = 0;

  // Normalize list structure
  editor.normalizeNode = ([node, path]) => {
    // If the node is a list item, ensure it's wrapped in a list
    if (SlateElement.isElement(node) && node.type === "list-item") {
      const [parent] = Editor.parent(editor, path);
      if (
        !SlateElement.isElement(parent) ||
        (parent.type !== "bulleted-list" && parent.type !== "numbered-list")
      ) {
        // Wrap in a bulleted list by default
        Transforms.wrapNodes(
          editor,
          { type: "bulleted-list", children: [] },
          { at: path }
        );
        return;
      }
    }

    // If the node is a list, ensure it only contains list items
    if (
      SlateElement.isElement(node) &&
      (node.type === "bulleted-list" || node.type === "numbered-list")
    ) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (SlateElement.isElement(child) && child.type !== "list-item") {
          // Convert non-list-item children to list items
          Transforms.setNodes(editor, { type: "list-item" }, { at: childPath });
        }
      }
    }

    normalizeNode([node, path]);
  };

  // Handle Enter key in lists
  editor.insertBreak = () => {
    const { selection } = editor;
    if (selection) {
      const [match] = Array.from(
        Editor.nodes(editor, {
          match: (n) => SlateElement.isElement(n) && n.type === "list-item",
        })
      );

      if (match) {
        const [listItem, path] = match;
        const [list] = Editor.parent(editor, path);

        // Check if the current list item is empty
        const isEmpty = Node.string(listItem) === "";

        if (isEmpty) {
          // Increment empty list item counter
          emptyListItemCount++;

          if (emptyListItemCount >= 2) {
            // If we've had 2 consecutive empty list items, break out of the list
            Transforms.setNodes(editor, { type: "paragraph" });

            // Unwrap from list if it's the only item
            const listPath = Path.parent(path);
            const listChildren = Array.from(Node.children(editor, listPath));
            if (listChildren.length === 1) {
              Transforms.unwrapNodes(editor, { at: listPath });
            }

            // Reset counter
            emptyListItemCount = 0;
            return;
          } else {
            // First empty list item, just create a new one
            const newListItem: CustomElement = {
              type: "list-item",
              children: [{ text: "" }],
            };
            Transforms.insertNodes(editor, newListItem, {
              at: Path.next(path),
            });
            Transforms.select(editor, Editor.start(editor, Path.next(path)));
            return;
          }
        } else {
          // List item has content, create a new empty list item
          const newListItem: CustomElement = {
            type: "list-item",
            children: [{ text: "" }],
          };
          Transforms.insertNodes(editor, newListItem, { at: Path.next(path) });
          Transforms.select(editor, Editor.start(editor, Path.next(path)));

          // Reset counter since we're creating a new item with content
          emptyListItemCount = 0;
          return;
        }
      } else {
        // Not in a list item, reset counter
        emptyListItemCount = 0;
      }
    }

    insertBreak();
  };

  // Handle Backspace key in lists
  editor.deleteBackward = (unit) => {
    const { selection } = editor;
    if (selection) {
      const [match] = Array.from(
        Editor.nodes(editor, {
          match: (n) => SlateElement.isElement(n) && n.type === "list-item",
        })
      );

      if (match) {
        const [listItem, path] = match;
        const [list] = Editor.parent(editor, path);

        // If list item is empty and at start, convert to paragraph
        if (
          Node.string(listItem) === "" &&
          Editor.isStart(editor, selection.anchor, path)
        ) {
          Transforms.setNodes(editor, { type: "paragraph" });

          // Unwrap from list if it's the only item
          const listPath = Path.parent(path);
          const listChildren = Array.from(Node.children(editor, listPath));
          if (listChildren.length === 1) {
            Transforms.unwrapNodes(editor, { at: listPath });
          }

          // Reset counter
          emptyListItemCount = 0;
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  return editor;
};

export const serialize = (nodes: Node[]): string => {
  return nodes.map((n) => Node.string(n)).join("\n");
};

export const deserialize = (string: string): Node[] => {
  return string.split("\n").map((line) => ({
    type: "paragraph",
    children: [{ text: line }],
  }));
};
