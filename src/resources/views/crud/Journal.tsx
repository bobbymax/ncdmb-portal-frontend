import { JournalResponseData } from "app/Repositories/Journal/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";

interface DependencyProps {
    //
}

const Journal: React.FC<FormPageComponentProps<JournalResponseData>> = ({
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

export default Journal;