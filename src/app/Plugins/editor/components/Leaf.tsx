import React from "react";
import { RenderLeafProps } from "slate-react";

const Leaf: React.FC<RenderLeafProps> = ({ attributes, children, leaf }) => {
  let element = children;

  if (leaf.bold) {
    element = <strong>{element}</strong>;
  }

  if (leaf.italic) {
    element = <em>{element}</em>;
  }

  if (leaf.underline) {
    element = <u>{element}</u>;
  }

  if (leaf.code) {
    element = <code>{element}</code>;
  }

  if (leaf.color) {
    element = <span style={{ color: leaf.color }}>{element}</span>;
  }

  if (leaf.backgroundColor) {
    element = (
      <span style={{ backgroundColor: leaf.backgroundColor }}>{element}</span>
    );
  }

  if (leaf.fontSize) {
    element = <span style={{ fontSize: `${leaf.fontSize}px` }}>{element}</span>;
  }

  return <span {...attributes}>{element}</span>;
};

export default Leaf;
