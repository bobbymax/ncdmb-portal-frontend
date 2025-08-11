import React, { useCallback, useEffect, useState } from "react";
import {
  ContentAreaProps,
  OptionsContentAreaProps,
} from "app/Hooks/useBuilder";
import { BlockDataTypeMap, blockFormMap } from ".";
import { BlockDataType } from "@/app/Repositories/Block/data";
import { BaseResponse } from "@/app/Repositories/BaseRepository";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";
import Button from "resources/views/components/forms/Button";

interface BlockFormProps {
  block: ContentAreaProps;
  resource: BaseResponse | null;
  onSave: () => void;
  onCancel: () => void;
}

const BlockForm: React.FC<BlockFormProps> = ({
  block,
  resource,
  onSave,
  onCancel,
}) => {
  const { state, actions } = useTemplateBoard();
  const [localContentState, setLocalContentState] =
    useState<OptionsContentAreaProps>(() => {
      // Initialize with the correct structure for this block type
      const initialState: OptionsContentAreaProps = {
        title: "",
        tagline: "",
        [block.type]: {},
      };
      return initialState;
    });

  // Get content from global context
  const globalContent = state.contents.find(
    (content) => content.id === block.id
  )?.content as OptionsContentAreaProps;

  // Initialize local state from global state
  useEffect(() => {
    if (globalContent) {
      // Initialize from global state
      setLocalContentState((prev) => {
        const blockType = block.type as keyof OptionsContentAreaProps;

        // Check if globalContent already has the correct nested structure
        const blockContent = globalContent[blockType];

        const newContent: OptionsContentAreaProps = {
          ...prev,
          [blockType]: blockContent || {},
        };

        // Only update if content is actually different
        const contentString = JSON.stringify(newContent);
        const prevString = JSON.stringify(prev);

        if (contentString !== prevString) {
          return newContent;
        }
        return prev;
      });
    }
  }, [globalContent, block.type]);

  const handleSave = useCallback(() => {
    // Get the correct content for this block type
    const blockContent =
      localContentState[block.type as keyof OptionsContentAreaProps];

    // Only update if we have content
    if (blockContent) {
      // Send the block content directly without nesting it again
      actions.updateContent(
        block.id,
        blockContent,
        block.type as keyof OptionsContentAreaProps
      );
    }
    onSave();
  }, [actions, block.id, block.type, localContentState, onSave]);

  const handleCancel = useCallback(() => {
    // Reset local state to original content
    setLocalContentState(globalContent || {});
    onCancel();
  }, [globalContent, onCancel]);

  const updateContentState = useCallback(
    <K extends BlockDataType>(
      data: BlockDataTypeMap[K],
      identifier: keyof OptionsContentAreaProps
    ) => {
      setLocalContentState((prev) => {
        // Always nest the data under the block type
        const blockType = block.type as keyof OptionsContentAreaProps;
        const newState = {
          ...prev,
          [blockType]: {
            ...((prev[blockType] as Record<string, any>) || {}),
            ...(data as Record<string, any>),
          },
        };

        return newState;
      });
    },
    [block.type] // Remove localContentState from dependencies to prevent infinite loops
  );

  // Get the appropriate form component
  const Component = blockFormMap[block.type];

  if (!Component) {
    return null;
  }

  return (
    <>
      <p className="mb-3 header__title">{block.type}</p>
      <Component
        resource={resource}
        configState={state.configState}
        localContentState={localContentState}
        updateLocal={updateContentState}
        sharedState={state.resource as Record<string, any>}
        blockId={block.id.toString()}
      />
      <div className="col-md-12 mb-3 flex end align gap-sm">
        <Button
          label="Cancel"
          icon="ri-close-line"
          handleClick={handleCancel}
          variant="dark"
          size="sm"
        />
        <Button
          label="Save"
          icon="ri-send-plane-fill"
          handleClick={handleSave}
          variant="success"
          size="sm"
        />
      </div>
    </>
  );
};

export default React.memo(BlockForm);
