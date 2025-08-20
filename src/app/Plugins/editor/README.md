# Rich Text Editor Plugin

A powerful, customizable WYSIWYG editor built with Slate.js that provides Microsoft Word-like functionality with database integration capabilities.

## Features

- **Rich Text Formatting**: Bold, italic, underline, code, colors
- **Block Elements**: Headings, paragraphs, lists, tables
- **Media Support**: Images, file attachments, links
- **Database Integration**: Insert database records as content blocks
- **Customizable Toolbar**: Show/hide specific functionality
- **Responsive Design**: Works on all device sizes
- **Keyboard Shortcuts**: Ctrl+S (save), Ctrl+B (bold), etc.
- **Drag & Drop**: File uploads and content reordering

## Installation

1. Install the required dependencies:

```bash
npm install slate slate-react slate-history slate-hyperscript is-hotkey
```

2. Import the editor styles:

```css
@import "app/Plugins/editor/styles.css";
```

## Basic Usage

```tsx
import React, { useState } from "react";
import { Editor } from "app/Plugins/editor";

const MyComponent = () => {
  const [content, setContent] = useState([
    {
      type: "paragraph",
      children: [{ text: "Start typing here..." }],
    },
  ]);

  const handleSave = (value: any[]) => {
    console.log("Saving content:", value);
    // Save to your database
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    // Upload file and return URL
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const { url } = await response.json();
    return url;
  };

  const handleDatabaseQuery = async (query: string): Promise<any[]> => {
    // Query your database
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  };

  return (
    <Editor
      value={content}
      onChange={setContent}
      onSave={handleSave}
      onFileUpload={handleFileUpload}
      onDatabaseQuery={handleDatabaseQuery}
      placeholder="Start writing your document..."
      toolbarConfig={{
        showFormatting: true,
        showLists: true,
        showTables: true,
        showImages: true,
        showFiles: true,
        showLinks: true,
        showDatabase: true,
        showAlignment: true,
        showColors: true,
      }}
    />
  );
};
```

## Advanced Usage

### Custom Toolbar Configuration

```tsx
const minimalToolbar = {
  showFormatting: true,
  showLists: false,
  showTables: false,
  showImages: true,
  showFiles: false,
  showLinks: true,
  showDatabase: false,
  showAlignment: false,
  showColors: false,
};

<Editor value={content} onChange={setContent} toolbarConfig={minimalToolbar} />;
```

### Read-Only Mode

```tsx
<Editor value={content} onChange={setContent} readOnly={true} />
```

### Custom Styling

```tsx
<Editor
  value={content}
  onChange={setContent}
  className="my-custom-editor"
  style={{
    border: "2px solid #3b82f6",
    borderRadius: "12px",
  }}
/>
```

## Content Structure

The editor uses a tree-based structure where each node can be either:

- **Text Node**: Contains text with formatting marks
- **Element Node**: Contains other nodes (paragraphs, headings, lists, etc.)

### Example Content Structure

```json
[
  {
    "type": "heading",
    "level": 1,
    "children": [{ "text": "Document Title" }]
  },
  {
    "type": "paragraph",
    "children": [
      { "text": "This is a ", "bold": true },
      { "text": "paragraph" }
    ]
  },
  {
    "type": "bulleted-list",
    "children": [
      {
        "type": "list-item",
        "children": [{ "text": "List item 1" }]
      },
      {
        "type": "list-item",
        "children": [{ "text": "List item 2" }]
      }
    ]
  }
]
```

## API Reference

### Editor Props

| Prop              | Type                                | Default             | Description                     |
| ----------------- | ----------------------------------- | ------------------- | ------------------------------- |
| `value`           | `Descendant[]`                      | Required            | The editor content              |
| `onChange`        | `(value: Descendant[]) => void`     | Required            | Called when content changes     |
| `placeholder`     | `string`                            | `'Start typing...'` | Placeholder text                |
| `readOnly`        | `boolean`                           | `false`             | Whether the editor is read-only |
| `className`       | `string`                            | `''`                | Additional CSS classes          |
| `style`           | `React.CSSProperties`               | `{}`                | Additional inline styles        |
| `onSave`          | `(value: Descendant[]) => void`     | Optional            | Called when Ctrl+S is pressed   |
| `onFileUpload`    | `(file: File) => Promise<string>`   | Optional            | File upload handler             |
| `onDatabaseQuery` | `(query: string) => Promise<any[]>` | Optional            | Database query handler          |
| `toolbarConfig`   | `ToolbarConfig`                     | Full toolbar        | Toolbar configuration           |

### Toolbar Configuration

| Option           | Type      | Default | Description                        |
| ---------------- | --------- | ------- | ---------------------------------- |
| `showFormatting` | `boolean` | `true`  | Show bold, italic, underline, code |
| `showLists`      | `boolean` | `true`  | Show bulleted and numbered lists   |
| `showTables`     | `boolean` | `true`  | Show table insertion               |
| `showImages`     | `boolean` | `true`  | Show image insertion               |
| `showFiles`      | `boolean` | `true`  | Show file attachment               |
| `showLinks`      | `boolean` | `true`  | Show link insertion                |
| `showDatabase`   | `boolean` | `true`  | Show database record insertion     |
| `showAlignment`  | `boolean` | `true`  | Show text alignment options        |
| `showColors`     | `boolean` | `true`  | Show color picker                  |

## Keyboard Shortcuts

| Shortcut           | Action             |
| ------------------ | ------------------ |
| `Ctrl+S` / `Cmd+S` | Save document      |
| `Ctrl+B` / `Cmd+B` | Toggle bold        |
| `Ctrl+I` / `Cmd+I` | Toggle italic      |
| `Ctrl+U` / `Cmd+U` | Toggle underline   |
| `Enter`            | New paragraph      |
| `Shift+Enter`      | Line break         |
| `Tab`              | Indent (in lists)  |
| `Shift+Tab`        | Outdent (in lists) |

## Customization

### Adding Custom Elements

1. Define your element type in `types.ts`
2. Add rendering logic in `Elements.tsx`
3. Add insertion utilities in `utils.ts`
4. Update the toolbar in `Toolbar.tsx`

### Styling

The editor comes with comprehensive CSS that can be customized. Key classes:

- `.rich-text-editor` - Main editor container
- `.editor-toolbar` - Toolbar container
- `.toolbar-button` - Individual toolbar buttons
- `.editor-content` - Content area
- `.editor-editable` - Editable content

### Extending Functionality

The editor is built with a plugin architecture that makes it easy to extend:

- **Custom Blocks**: Add new content types
- **Custom Marks**: Add new text formatting
- **Custom Toolbar Actions**: Add new buttons and functionality
- **Custom Modals**: Replace default insertion modals

## Database Integration

The editor can integrate with your application's database to:

- Insert database records as content blocks
- Query records for insertion
- Display record information inline
- Link to full record views

### Example Database Integration

```tsx
const handleDatabaseQuery = async (query: string) => {
  const response = await fetch(`/api/records/search?q=${query}`);
  const records = await response.json();

  return records.map((record) => ({
    id: record.id,
    type: record.type,
    title: record.title,
    data: record,
    url: `/records/${record.id}`,
  }));
};
```

## Performance Considerations

- The editor uses React.memo and useCallback for optimal performance
- Large documents are handled efficiently with Slate.js's virtual rendering
- File uploads are processed asynchronously
- Database queries are debounced to prevent excessive API calls

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Troubleshooting

### Common Issues

1. **Content not saving**: Ensure `onChange` is properly connected to your state
2. **Toolbar not showing**: Check `toolbarConfig` settings
3. **File uploads not working**: Verify `onFileUpload` handler returns a valid URL
4. **Database integration issues**: Check `onDatabaseQuery` handler and API responses

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
REACT_APP_EDITOR_DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This plugin is part of the NCDMB application and follows the same licensing terms.
