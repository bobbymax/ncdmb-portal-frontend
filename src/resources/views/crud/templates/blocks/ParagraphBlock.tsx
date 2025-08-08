import React, { useEffect, useRef, useState } from "react";
import { BlockContentComponentPorps } from ".";
import { BlockDataType } from "app/Repositories/Block/data";
import RichTextEditorWrapper from "resources/views/components/forms/RichTextEditorWrapper";
import { ParagraphContentAreaProps } from "app/Hooks/useBuilder";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";

const ParagraphBlock: React.FC<BlockContentComponentPorps> = ({
  localContentState,
  updateLocal,
  blockId,
}) => {
  const { state, actions } = useTemplateBoard();
  const identifier: BlockDataType = "paragraph";

  // Find the current block content from global state
  const currentBlock = state.contents.find((content) => content.id === blockId);
  const currentContent = currentBlock?.content
    ?.paragraph as ParagraphContentAreaProps;

  const [localState, setLocalState] = useState<ParagraphContentAreaProps>({
    body: "<p>Write your text here!!</p>",
  });

  const handleResult = (data: string) => {
    const newState = { body: data };

    setLocalState(newState);

    // Update global state directly
    if (currentBlock) {
      actions.updateContent(currentBlock.id, newState, identifier);
    }

    // Also update local state in parent for compatibility
    updateLocal(newState, identifier);
  };

  useEffect(() => {
    if (currentContent) {
      setLocalState((prev) => ({
        ...prev,
        body: currentContent.body ?? "<p>Write your text here!!</p>",
      }));
    } else if (localContentState?.paragraph) {
      setLocalState((prev) => ({
        ...prev,
        body:
          localContentState.paragraph?.body ?? "<p>Write your text here!!</p>",
      }));
    }
  }, [currentContent, localContentState?.paragraph]);

  return (
    <div className="row">
      <div className="col-md-12 mb-3">
        <RichTextEditorWrapper
          value={localState.body}
          onChange={handleResult}
        />
      </div>
    </div>
  );
};

export default ParagraphBlock;
