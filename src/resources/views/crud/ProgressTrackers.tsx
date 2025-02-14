import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import WorkflowRepository from "app/Repositories/Workflow/WorkflowRepository";
import { CardPageComponentProps } from "bootstrap";
import React from "react";

const ProgressTrackers: React.FC<
  CardPageComponentProps<WorkflowResponseData, WorkflowRepository>
> = ({ Repository, collection, onManageRawData, View }) => {
  console.log(collection);

  return (
    <div className="row">
      {collection.map((workflow, i) => (
        <div className="col-md-6 mb-3" key={i}>
          <div className="custom-card workflow__card">
            <h2>{workflow.name}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressTrackers;
