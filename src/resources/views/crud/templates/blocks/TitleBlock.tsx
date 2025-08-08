import React, { useEffect, useState } from "react";
import { BlockContentComponentPorps } from ".";
import { BlockDataType } from "@/app/Repositories/Block/data";
import { TitleContentProps } from "app/Hooks/useBuilder";
import TextInput from "resources/views/components/forms/TextInput";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";

const TitleBlock: React.FC<BlockContentComponentPorps> = ({
  localContentState,
  updateLocal,
  blockId,
}) => {
  const { state, actions } = useTemplateBoard();
  const identifier: BlockDataType = "paper_title";

  // Find the current block content from global state
  const currentBlock = state.contents.find((content) => content.id === blockId);
  const currentContent = currentBlock?.content
    ?.paper_title as TitleContentProps;

  const [localState, setLocalState] = useState<TitleContentProps>({
    title: "",
  });

  const handleResult = (data: string) => {
    const newState = { title: data };

    setLocalState(newState);

    // Update global state directly
    if (currentBlock) {
      actions.updateContent(currentBlock.id, { title: data }, identifier);
    }

    // Also update local state in parent for compatibility
    updateLocal(newState, identifier);
  };

  useEffect(() => {
    if (currentContent) {
      setLocalState((prev) => ({
        ...prev,
        title: currentContent.title ?? "",
      }));
    } else if (localContentState?.paper_title) {
      setLocalState((prev) => ({
        ...prev,
        title: localContentState.paper_title?.title ?? "",
      }));
    }
  }, [currentContent, localContentState?.paper_title]);

  return (
    <div className="row">
      <div className="col-md-12 mb-3">
        <TextInput
          label="Purpose"
          name="purpose"
          value={localState.title}
          onChange={(e) => handleResult(e.target.value)}
          placeholder="Enter purpose"
        />
      </div>
    </div>
  );
};

export default TitleBlock;
