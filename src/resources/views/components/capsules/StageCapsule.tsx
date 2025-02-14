import React from "react";
import Button from "../forms/Button";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";

interface StageCapsuleProps {
  workflow_id: number;
  url: string;
  stage: WorkflowStageResponseData;
  handleFlowchartBoard: (data: WorkflowStageResponseData) => void;
}

const StageCapsule: React.FC<StageCapsuleProps> = ({
  workflow_id,
  url,
  stage,
  handleFlowchartBoard,
}) => {
  return (
    <div className="workflow_stage_item">
      {/* <div
        className={`tiny__line ${stage.status}`}
        style={{
          padding: 1.7,
          marginBottom: 5,
        }}
      ></div> */}
      <div className="workflow_stage_header_item flex gap-lg column">
        <div className="flex align gap-xl stage__left">
          <img
            src={`${url}${stage.stage_category?.icon_path}`}
            alt="Stage Category Logos"
          />
          <p>{stage.name}</p>
        </div>
        {/* Group Line */}
        <div className="group__line flex column gap-xs">
          <div className="group__name">
            <p>{stage.group?.name}</p>
          </div>
          <div className="flex align gap-md between">
            <div className="group__state">
              <p className={`sec__group little-badge ${stage.status}`}>
                {stage.status}
              </p>
            </div>
            <Button
              size="xs"
              icon="ri-function-add-line"
              handleClick={() => handleFlowchartBoard(stage)}
              variant="dark"
              isDisabled={workflow_id < 1 || stage.status !== "passed"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageCapsule;
