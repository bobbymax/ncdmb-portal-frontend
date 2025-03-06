import { DocumentUpdateResponseData } from "app/Repositories/DocumentUpdate/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";

interface DependencyProps {
    //
}

const DocumentUpdate: React.FC<FormPageComponentProps<DocumentUpdateResponseData>> = ({
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

export default DocumentUpdate;