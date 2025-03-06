import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";

interface DependencyProps {
    //
}

const Expenditure: React.FC<FormPageComponentProps<ExpenditureResponseData>> = ({
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

export default Expenditure;