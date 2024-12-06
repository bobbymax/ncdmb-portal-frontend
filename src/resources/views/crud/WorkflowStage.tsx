import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";

interface DependencyProps {
    //
}

const WorkflowStage: React.FC<FormPageComponentProps<WorkflowStageResponseData>> = ({
    state,
    handleChange,
    dependencies,
}) => {

    useEffect(() => {
        if (dependencies) {
            //
        }
    }, [dependencies]);

    return (
        <>
            <div className="col-md-12"></div>
        </>
    );
};

export default WorkflowStage;