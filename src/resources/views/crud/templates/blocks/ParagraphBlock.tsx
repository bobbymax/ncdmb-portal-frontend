import React, { useEffect, useRef, useState } from "react";
import { BlockContentComponentPorps } from ".";
import { BlockDataType } from "app/Repositories/Block/data";
import RichTextEditorWrapper from "resources/views/components/forms/RichTextEditorWrapper";
import { ParagraphContentAreaProps } from "app/Hooks/useBuilder";

const ParagraphBlock: React.FC<BlockContentComponentPorps> = ({
  localContentState,
  updateLocal,
}) => {
  const identifier: BlockDataType = "paragraph";
  const [state, setState] = useState<ParagraphContentAreaProps>({
    body: "<p>Write your text here!!</p>",
  });

  const handleResult = (data: string) => {
    setState((prev) => ({
      ...prev,
      body: data,
    }));

    updateLocal({ body: data }, identifier);
  };

  useEffect(() => {
    if (localContentState?.paragraph) {
      setState(localContentState.paragraph);
    }
  }, [localContentState?.paragraph]);

  return (
    <div className="row">
      <div className="col-md-12 mb-3">
        <RichTextEditorWrapper value={state.body} onChange={handleResult} />
      </div>
    </div>
  );
};

export default ParagraphBlock;
