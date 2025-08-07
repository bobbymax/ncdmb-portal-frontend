import React, { useEffect, useState } from "react";
import { BlockContentComponentPorps } from ".";
import { BlockDataType } from "@/app/Repositories/Block/data";
import { TitleContentProps } from "app/Hooks/useBuilder";
import TextInput from "resources/views/components/forms/TextInput";

const TitleBlock: React.FC<BlockContentComponentPorps> = ({
  localContentState,
  updateLocal,
}) => {
  const identifier: BlockDataType = "paper_title";
  const [state, setState] = useState<TitleContentProps>({
    title: "",
  });

  const handleResult = (data: string) => {
    setState((prev) => ({
      ...prev,
      title: data,
    }));

    updateLocal({ title: data }, identifier);
  };

  useEffect(() => {
    if (localContentState?.paper_title) {
      setState((prev) => ({
        ...prev,
        title: localContentState.paper_title?.title ?? "",
      }));
    }
  }, [localContentState?.paper_title]);

  return (
    <div className="row">
      <div className="col-md-12 mb-3">
        <TextInput
          label="Purpose"
          name="purpose"
          value={state.title}
          onChange={(e) => handleResult(e.target.value)}
          placeholder="Enter purpose"
        />
      </div>
    </div>
  );
};

export default TitleBlock;
