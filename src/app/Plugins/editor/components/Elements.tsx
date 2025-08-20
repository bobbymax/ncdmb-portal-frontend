import React from "react";
import { RenderElementProps } from "slate-react";
import { CustomElement } from "../types";

const getHeadingTag = (level: number): keyof JSX.IntrinsicElements => {
  if (level === 1) return "h1";
  if (level === 2) return "h2";
  if (level === 3) return "h3";
  if (level === 4) return "h4";
  if (level === 5) return "h5";
  if (level === 6) return "h6";
  return "h1";
};

const Elements: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  switch (element.type) {
    case "paragraph":
      return (
        <p {...attributes} style={{ textAlign: element.align || "left" }}>
          {children}
        </p>
      );

    case "heading": {
      const level = element.level || 1;
      const HeadingTag = `h${level}` as any;
      return (
        <HeadingTag
          {...attributes}
          style={{ textAlign: element.align || "left" }}
        >
          {children}
        </HeadingTag>
      );
    }

    case "bulleted-list": {
      return (
        <ul
          {...attributes}
          className="bulleted-list"
          style={{
            listStyleType: "disc",
            listStylePosition: "outside",
            paddingLeft: "2em",
            margin: "1em 0",
          }}
        >
          {children}
        </ul>
      );
    }

    case "numbered-list": {
      return (
        <ol
          {...attributes}
          className="numbered-list"
          style={{
            listStyleType: "decimal",
            listStylePosition: "outside",
            paddingLeft: "2em",
            margin: "1em 0",
          }}
        >
          {children}
        </ol>
      );
    }

    case "list-item": {
      return (
        <li
          {...attributes}
          style={{
            display: "list-item",
            margin: "0.5em 0",
          }}
        >
          {children}
        </li>
      );
    }

    case "table": {
      return (
        <table {...attributes} className="editor-table">
          <tbody>{children}</tbody>
        </table>
      );
    }

    case "table-row": {
      return <tr {...attributes}>{children}</tr>;
    }

    case "table-cell": {
      const Tag = element.header ? "th" : "td";
      return (
        <Tag
          {...attributes}
          className={`table-cell ${element.header ? "header" : ""}`}
          colSpan={element.colSpan}
          rowSpan={element.rowSpan}
        >
          {children}
        </Tag>
      );
    }

    case "image": {
      return (
        <div {...attributes} className="image-wrapper" contentEditable={false}>
          <img
            src={element.url}
            alt={element.alt || ""}
            style={{
              maxWidth: element.width || "100%",
              height: element.height || "auto",
            }}
            className="editor-image"
          />
          {element.caption && (
            <div className="image-caption">{element.caption}</div>
          )}
          {children}
        </div>
      );
    }

    case "file-attachment": {
      return (
        <div
          {...attributes}
          className="file-attachment-wrapper"
          contentEditable={false}
        >
          <div className="file-attachment">
            <div className="file-icon">
              <i className="ri-file-line"></i>
            </div>
            <div className="file-info">
              <div className="file-name">{element.file.name}</div>
              <div className="file-meta">
                {element.file.type} • {(element.file.size / 1024).toFixed(1)} KB
              </div>
            </div>
            <div className="file-actions">
              <button className="file-download" title="Download">
                <i className="ri-download-line"></i>
              </button>
              <button className="file-remove" title="Remove">
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
          {children}
        </div>
      );
    }

    case "link": {
      return (
        <a
          {...attributes}
          href={element.url}
          target="_blank"
          rel="noopener noreferrer"
          className="editor-link"
        >
          {children}
        </a>
      );
    }

    case "database-record": {
      return (
        <div
          {...attributes}
          className="database-record-wrapper"
          contentEditable={false}
        >
          <div className="database-record">
            <div className="record-icon">
              <i className="ri-database-2-line"></i>
            </div>
            <div className="record-info">
              <div className="record-title">{element.record.title}</div>
              <div className="record-type">{element.record.type}</div>
            </div>
            <div className="record-actions">
              <button className="record-view" title="View Record">
                <i className="ri-eye-line"></i>
              </button>
              <button className="record-remove" title="Remove">
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
          {children}
        </div>
      );
    }

    default:
      return <p {...attributes}>{children}</p>;
  }
};

export default Elements;
