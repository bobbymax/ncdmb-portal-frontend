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
      <div
        className={`tiny__line ${stage.status}`}
        style={{
          padding: 1.7,
          marginBottom: 5,
        }}
      ></div>
      <div className="workflow_stage_header_item flex align between">
        <div className="flex align gap-md stage__left">
          <img
            src={`${url}${stage.stage_category?.icon_path}`}
            alt="Stage Category Logos"
          />
          <p>{stage.stage_category?.name}</p>
        </div>
      </div>

      <div className="workflow_stage_middle_item">
        <div className="sec__group mb-4">
          <p style={{ textAlign: "center" }}>{stage.name}</p>
        </div>

        <div className="sec__group">
          <small>Group Access Level</small>
          <p>{stage.group?.name}</p>
        </div>

        <div className="sec__group">
          <small>State</small>
          <p className={`little-badge ${stage.status}`}>{stage.status}</p>
        </div>
      </div>

      <div className="workflow_stage_footer flex align center mt-4">
        <Button
          size="xs"
          label="Add to Workflow"
          icon="ri-flow-chart"
          handleClick={() => handleFlowchartBoard(stage)}
          variant="dark"
          isDisabled={workflow_id < 1 || stage.status !== "passed"}
        />
      </div>
    </div>
  );
};

export default StageCapsule;
