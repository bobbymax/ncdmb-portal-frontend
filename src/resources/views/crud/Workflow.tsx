import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import Select from "../components/forms/Select";

interface DependencyProps {
  documentTypes: DocumentTypeResponseData[];
}

const Workflow: React.FC<FormPageComponentProps<WorkflowResponseData>> = ({
  state,
  handleChange,
  loading,
  dependencies,
}) => {
  const [documentTypes, setDocumentTypes] = useState<
    DocumentTypeResponseData[]
  >([]);

  useEffect(() => {
    if (dependencies) {
      const { documentTypes = [] } = dependencies as DependencyProps;
      setDocumentTypes(documentTypes);
    }
  }, [dependencies]);

  return (
    <>
      <div className="col-md-6 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Workflow Name Here"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Document Type"
          name="document_type_id"
          value={state.document_type_id}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="id"
          labelKey="name"
          options={documentTypes}
          defaultValue={0}
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Type"
          name="type"
          value={state.type}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "serialize", label: "Serialize" },
            { value: "broadcast", label: "Broadcast" },
          ]}
          defaultValue=""
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-12 mb-3">
        <Textarea
          label="Description"
          name="description"
          value={state.description}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Describe this workflow"
          rows={4}
        />
      </div>
    </>
  );
};

export default Workflow;
