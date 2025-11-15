import { ProductMeasurementResponseData } from "app/Repositories/ProductMeasurement/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";

interface DependencyProps {
    //
}

const ProductMeasurement: React.FC<FormPageComponentProps<ProductMeasurementResponseData>> = ({
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

export default ProductMeasurement;