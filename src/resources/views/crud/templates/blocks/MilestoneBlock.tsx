import React, { useMemo } from "react";
import { BlockContentComponentPorps } from ".";
import { ProjectResponseData } from "@/app/Repositories/Project/data";

const MilestoneBlock: React.FC<BlockContentComponentPorps> = ({
  resource,
  localContentState,
  updateLocal,
}) => {
  const project = useMemo(
    () => (resource as ProjectResponseData) ?? null,
    [resource]
  );

  console.log(project);

  return <div>MilestoneBlock</div>;
};

export default MilestoneBlock;
