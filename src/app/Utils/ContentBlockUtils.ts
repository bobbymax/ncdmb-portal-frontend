import { ContentBlock } from "resources/views/crud/DocumentTemplateBuilder";
import { DeskComponentPropTypes } from "@/resources/views/pages/DocumentTemplateContent";

export const getContentBlockByType = (
  body: ContentBlock[],
  type: DeskComponentPropTypes,
  position: "first" | "last" | number = "first"
): ContentBlock | null => {
  // Filter blocks by type
  const matchingBlocks = body.filter(
    (block) => block.type === type || block.block?.data_type === type
  );

  if (matchingBlocks.length === 0) return null;

  // Handle position logic
  switch (position) {
    case "first":
      return matchingBlocks[0];
    case "last":
      return matchingBlocks[matchingBlocks.length - 1];
    default:
      if (typeof position === "number") {
        return matchingBlocks[position] || null;
      }
      return matchingBlocks[0];
  }
};

export const getContentBlockContentByType = <T>(
  body: ContentBlock[],
  type: DeskComponentPropTypes,
  contentKey: string,
  position: "first" | "last" | number = "first"
): T | null => {
  const contentBlock = getContentBlockByType(body, type, position);
  if (!contentBlock?.content) return null;

  return ((contentBlock.content as any)[contentKey] as T) || null;
};
