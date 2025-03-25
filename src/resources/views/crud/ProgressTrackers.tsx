import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import WorkflowRepository from "app/Repositories/Workflow/WorkflowRepository";
import { CardPageComponentProps } from "bootstrap";
import React, { useMemo } from "react";
import arrow from "../../assets/images/right-arrow.png";
import Button from "../components/forms/Button";
import { useNavigate } from "react-router-dom";

const ProgressTrackers: React.FC<
  CardPageComponentProps<WorkflowResponseData, WorkflowRepository>
> = ({ collection }) => {
  const navigate = useNavigate();

  const endpoint = useMemo(() => "https://portal.test", []);

  return (
    <div className="row">
      {collection.map((workflow, i) => (
        <div className="col-md-6 mb-3" key={i}>
          <div className="custom-card workflow__card">
            <p className="title mb-3">{workflow.name}</p>

            <div className="trackers__section flex align mt-4">
              {workflow.trackers.length > 0 ? (
                workflow.trackers.map((tracker, i) => (
                  <div
                    className="tracker__custom__item flex column align gap-md"
                    key={i}
                  >
                    <img
                      src={`${endpoint}${tracker.stage?.stage_category?.icon_path}`}
                      alt=""
                    />
                    <small className="stage__name">{tracker.stage?.name}</small>
                    {i + 1 < workflow.trackers.length && (
                      <div className="line__arrow">
                        <img src={arrow} alt="Flow Arrow" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No trackers Available for this workflow</p>
              )}
            </div>

            <div className="mt-5 flex align gap-md">
              <Button
                label="Edit Workflow"
                size="xs"
                handleClick={() => {
                  navigate(
                    `/admin-centre/progress-trackers/${workflow.id}/manage`
                  );
                }}
                variant="dark"
                icon="ri-list-settings-line"
              />
              <Button
                label="Reset Trackers"
                size="xs"
                handleClick={() => {}}
                variant="danger"
                icon="ri-file-shred-line"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressTrackers;
