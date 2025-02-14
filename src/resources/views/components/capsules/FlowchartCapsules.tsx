import React from "react";
import Button from "../forms/Button";
import { ServerTrackersRequestProps } from "resources/views/crud/ProgressTracker";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";

interface FlowchartBoardProps {
  processes: ServerTrackersRequestProps[];
  manageCapsule: (process: ServerTrackersRequestProps) => void;
  stages: WorkflowStageResponseData[];
  move: (
    process: ServerTrackersRequestProps,
    currentPosition: number,
    action: "up" | "down"
  ) => void;
}

const FlowchartCapsules: React.FC<FlowchartBoardProps> = ({
  processes,
  manageCapsule,
  move,
  stages,
}) => {
  // processes, manage, move
  const getWorkflowStage = (stageId: number) => {
    return stages.find((stage) => stage.id === stageId)?.name;
  };
  return (
    <div className="flowchart">
      <div className="flowchart__container">
        <div className="flowchart__canvas begin" />

        <div className="flowchart__body__canvas">
          {processes
            .sort((a, b) => a.order - b.order)
            .map((process, i) => (
              <div className="items__split flex align gap-md mb-3" key={i}>
                <div className="branches fallback__state">
                  <small>Fallback</small>
                  <p>
                    {getWorkflowStage(process.fallback_to_stage_id) ?? "None"}
                  </p>
                </div>
                <div className="passed__state flex column">
                  <div className={`flowchart__canvas__item ${process.status}`}>
                    <small>{process.stage_category_name}</small>
                    <p className="mb-3">{process.name ?? "note"}</p>

                    <div className="div__plate__mid mb-4">
                      <small>Actions</small>
                      {process.actions.length > 0 ? (
                        process.actions.map((action, j) => (
                          <div className="action__plate" key={j}>
                            <small>{action.label}</small>
                          </div>
                        ))
                      ) : (
                        <small>No Actions have been set!!</small>
                      )}
                    </div>

                    <div className="div__plate__mid mb-2">
                      <small>Recipients</small>
                      {process.recipients.length > 0 ? (
                        process.recipients.map((recipient, j) => (
                          <div className="action__plate" key={j}>
                            <small>{recipient.label}</small>
                          </div>
                        ))
                      ) : (
                        <small>No Recipients set!!</small>
                      )}
                    </div>
                  </div>
                  <div className="bttn__area flex align end gap-sm">
                    <Button
                      variant="dark"
                      icon="ri-settings-3-line"
                      size="xs"
                      handleClick={() => manageCapsule(process)}
                    />
                    <Button
                      variant="dark"
                      icon="ri-arrow-up-s-line"
                      size="xs"
                      handleClick={() => move(process, process.order, "up")}
                      isDisabled={process.order === 1}
                    />
                    <Button
                      variant="dark"
                      icon="ri-arrow-down-s-line"
                      size="xs"
                      handleClick={() => move(process, process.order, "down")}
                      isDisabled={process.order === processes.length}
                    />
                  </div>
                </div>
                <div className="branches returnto_state">
                  <small>Response</small>
                  <p>
                    {getWorkflowStage(process.return_to_stage_id) ?? "None"}
                  </p>
                </div>
              </div>
            ))}
        </div>

        <div className="flowchart__canvas end" />
      </div>
    </div>
  );
};

export default FlowchartCapsules;
