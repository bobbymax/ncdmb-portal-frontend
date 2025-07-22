import React, { useState } from "react";
import { toTitleCase } from "bootstrap/repositories";
import {
  BlockDataType,
  BlockResponseData,
} from "@/app/Repositories/Block/data";

interface BlockNavigationBarProps {
  blocks: BlockResponseData[];
  handleAddToSheet: (block: BlockResponseData, type: BlockDataType) => void;
}

// Helper to group blocks by input_type
const groupBlocksByType = (blocks: BlockResponseData[]) => {
  return blocks.reduce((acc, block) => {
    const type = block.input_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(block);
    return acc;
  }, {} as Record<string, BlockResponseData[]>);
};

const BlockNavigationBar: React.FC<BlockNavigationBarProps> = ({
  blocks,
  handleAddToSheet,
}) => {
  const grouped = groupBlocksByType(blocks);
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);

  return (
    <nav
      className="block-nav-bar flex align gap-md"
      style={{ padding: "8px 0", transition: "all 0.3s ease" }}
    >
      {Object.entries(grouped).map(([type, groupBlocks]) => {
        const blocksArr = groupBlocks as BlockResponseData[];
        // Remove 'Block' suffix and convert to title case
        const groupName = toTitleCase(type.replace(/Block$/, ""));
        if (blocksArr.length === 1) {
          return (
            <button
              key={type}
              className="block-nav-item flex align gap-sm mb-3"
              onClick={() =>
                handleAddToSheet(blocksArr[0], blocksArr[0].data_type)
              }
              style={{
                padding: "8px 18px",
                border: "none",
                background: "#f7f7f7",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
                flexWrap: "wrap",
              }}
            >
              <i className={blocksArr[0].icon} />
              {groupName}
            </button>
          );
        }
        // Dropdown for multiple blocks
        return (
          <div
            key={type}
            className="block-nav-dropdown"
            style={{ position: "relative", display: "inline-block" }}
          >
            <button
              className="block-nav-item flex align gap-sm mb-3"
              onClick={() => setOpenDropdown(!openDropdown)}
              style={{
                padding: "8px 18px",
                border: "none",
                background: "#f7f7f7",
                flexWrap: "wrap",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <i className={blocksArr[0].icon} />
              <div className="flex align">
                {groupName}{" "}
                <i
                  className={`${
                    openDropdown ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
                  }`}
                />
              </div>
            </button>
            <div
              className="block-nav-dropdown-content"
              style={{
                display: openDropdown ? "block" : "none",
                position: "absolute",
                top: "80%",
                left: 0,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                borderRadius: 6,
                minWidth: 180,
                zIndex: 10,
              }}
            >
              {blocksArr.map((block: BlockResponseData) => (
                <button
                  key={block.id}
                  className="block-nav-dropdown-item"
                  onClick={() => {
                    handleAddToSheet(block, block.data_type);
                    setOpenDropdown(false);
                  }}
                  style={{
                    display: openDropdown ? "block" : "none",
                    width: "100%",
                    padding: "10px 21px",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div className="flex align gap-md">
                    <i className={block.icon} />
                    {block.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <style>{`
        .block-nav-dropdown:hover .block-nav-dropdown-content {
          display: block;
        }
        .block-nav-item:focus {
          outline: 2px solid var(--color-primary);
        }
        .block-nav-dropdown-content button:hover {
          background: #f0f0f0;
        }
      `}</style>
    </nav>
  );
};

export default BlockNavigationBar;
