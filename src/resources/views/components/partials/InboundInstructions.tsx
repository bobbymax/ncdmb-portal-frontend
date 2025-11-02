import { InboundResponseData } from "@/app/Repositories/Inbound/data";
import { FormPageComponentProps } from "@/bootstrap";
import React from "react";

const InboundInstructions: React.FC<FormPageComponentProps<InboundResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
}) => {
  return (
    <div className="inbound-instructions-tab">
      <div className="instructions-placeholder">
        <div className="placeholder-icon">
          <i className="ri-file-list-3-line" />
        </div>
        <h4>Processing Instructions</h4>
        <p className="text-muted">
          Document processing instructions and workflow guidance will be displayed here.
        </p>
        <p className="text-muted small">
          This section will contain step-by-step instructions for handling this inbound
          document according to organizational policies and procedures.
        </p>
      </div>
    </div>
  );
};

export default InboundInstructions;

