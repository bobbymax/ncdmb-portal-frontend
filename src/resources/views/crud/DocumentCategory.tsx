import { DocumentCategoryResponseData } from "app/Repositories/DocumentCategory/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import Textarea from "../components/forms/Textarea";
import TextInput from "../components/forms/TextInput";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import Select from "../components/forms/Select";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { DocumentRequirementResponseData } from "app/Repositories/DocumentRequirement/data";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";

interface DependencyProps {
  documentTypes: DocumentTypeResponseData[];
  workflows: WorkflowResponseData[];
  documentRequirements: DocumentRequirementResponseData[];
}

const DocumentCategory: React.FC<
  FormPageComponentProps<DocumentCategoryResponseData>
> = ({
  state,
  setState,
  handleChange,
  loading,
  dependencies,
  handleReactSelect,
  mode,
}) => {
  const [docTypes, setDocTypes] = useState<DocumentTypeResponseData[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowResponseData[]>([]);
  const [documentRequirements, setDocumentRequirements] = useState<
    DocumentRequirementResponseData[]
  >([]);

  const [selectedRequirements, setSelectedRequirements] = useState<
    DataOptionsProps[]
  >([]);

  const handleRequirementsChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    // setSelectedRoles(newValue as DataOptionsProps[]);
    handleReactSelect(newValue, actionMeta, (value) => {
      const result = value as DataOptionsProps[];
      setSelectedRequirements(result);

      if (setState) {
        setState((prev) => ({
          ...prev,
          selectedRequirements: [...result, ...prev.selectedRequirements],
        }));
      }
    });
  };

  useEffect(() => {
    if (dependencies) {
      const {
        documentTypes = [],
        workflows = [],
        documentRequirements = [],
      } = dependencies as DependencyProps;
      setDocTypes(documentTypes);
      setWorkflows(workflows);
      setDocumentRequirements(documentRequirements);
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      Array.isArray(state.selectedRequirements) &&
      state.selectedRequirements.length > 0
    ) {
      setSelectedRequirements(state.selectedRequirements);
    }
  }, [mode, state.selectedRequirements]);

  return (
    <>
      <div className="col-md-7 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Category Name"
        />
      </div>

      <div className="col-md-5 mb-3">
        <TextInput
          label="Icon"
          name="icon"
          value={state.icon}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Category Icon"
        />
      </div>

      <div className="col-md-3 mb-3">
        <Select
          label="Workflow"
          name="workflow_id"
          value={state.workflow_id}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="id"
          labelKey="name"
          options={workflows}
          defaultValue={0}
          defaultCheckDisabled
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
          options={docTypes}
          defaultValue={0}
          defaultCheckDisabled
        />
      </div>

      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Roles"
          options={formatOptions(documentRequirements, "id", "name")}
          value={selectedRequirements}
          onChange={handleRequirementsChange}
          placeholder="Document Requirements"
          isSearchable
          isMulti
          isDisabled={loading}
        />
      </div>

      <div className="col-md-12 mb-3">
        <Textarea
          label="Description"
          name="description"
          value={state.description}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Category Description"
          rows={4}
        />
      </div>
    </>
  );
};

export default DocumentCategory;
