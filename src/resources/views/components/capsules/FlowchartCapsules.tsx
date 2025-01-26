import React from "react";
import Button from "../forms/Button";
import { ServerTrackersRequestProps } from "resources/views/crud/ProgressTracker";

interface FlowchartBoardProps {
  processes: ServerTrackersRequestProps[];
  manageCapsule: (process: ServerTrackersRequestProps) => void;
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
}) => {
  // processes, manage, move
  return (
    <div className="flowchart">
      <div className="flowchart__container">
        <div className="flowchart__canvas begin" />

        <div className="flowchart__body__canvas">
          {processes.map((process, i) => (
            <div
              className={`flowchart__canvas__item ${process.status}`}
              key={i}
            >
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
              <div className="div__plate__mid mb-4">
                <small>Fallback Stage</small>
                <small>{process.fallback_to_stage_id < 1 && "None!!"}</small>
              </div>

              <div className="div__plate__mid mb-4">
                <small>Return to Stage</small>
                <small>{process.return_to_stage_id < 1 && "None!!"}</small>
              </div>

              <div className="div__plate__mid mb-5">
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

              <div className="flex align start gap-sm">
                <Button
                  variant="dark"
                  icon="ri-list-settings-line"
                  size="sm"
                  label="Manage"
                  handleClick={() => manageCapsule(process)}
                />
                <Button
                  variant="dark"
                  icon="ri-arrow-up-s-line"
                  size="sm"
                  handleClick={() => move(process, process.order, "up")}
                />
                <Button
                  variant="dark"
                  icon="ri-arrow-down-s-line"
                  size="sm"
                  handleClick={() => move(process, process.order, "down")}
                />
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
