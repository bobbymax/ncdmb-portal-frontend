import { DocumentRequirementResponseData } from "app/Repositories/DocumentRequirement/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";

interface DependencyProps {
    //
}

const DocumentRequirement: React.FC<FormPageComponentProps<DocumentRequirementResponseData>> = ({
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

export default DocumentRequirement;