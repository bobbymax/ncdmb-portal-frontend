import { DocumentCategoryResponseData } from "app/Repositories/DocumentCategory/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import Textarea from "../components/forms/Textarea";
import TextInput from "../components/forms/TextInput";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import Select from "../components/forms/Select";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { DocumentRequirementResponseData } from "app/Repositories/DocumentRequirement/data";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import { BlockResponseData } from "app/Repositories/Block/data";
import { toTitleCase } from "bootstrap/repositories";

interface DependencyProps {
  services: string[];
  documentTypes: DocumentTypeResponseData[];
  workflows: WorkflowResponseData[];
  documentRequirements: DocumentRequirementResponseData[];
  blocks: BlockResponseData[];
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
  const [blocks, setBlocks] = useState<BlockResponseData[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowResponseData[]>([]);
  const [documentRequirements, setDocumentRequirements] = useState<
    DocumentRequirementResponseData[]
  >([]);
  const [services, setServices] = useState<DataOptionsProps[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<{
    selectedBlocks: DataOptionsProps[];
    selectedRequirements: DataOptionsProps[];
    service: DataOptionsProps | null;
  }>({
    selectedBlocks: [],
    selectedRequirements: [],
    service: null,
  });

  console.log(state);

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue =
          key === "service"
            ? (newValue as DataOptionsProps)
            : (newValue as DataOptionsProps[]);

        // Update modal state dynamically
        if (setState) {
          setState((prev) => ({
            ...prev,
            [key]:
              key === "service"
                ? (updatedValue as DataOptionsProps).value
                : updatedValue,
          }));
        }

        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
      },
    [setState]
  );

  useEffect(() => {
    if (dependencies) {
      const {
        documentTypes = [],
        workflows = [],
        documentRequirements = [],
        blocks = [],
        services = [],
      } = dependencies as DependencyProps;

      const cleaned: DataOptionsProps[] = services.map((service) => ({
        value: service.replace(/_/g, ""),
        label: toTitleCase(service),
      }));

      setServices(cleaned);
      setDocTypes(documentTypes);
      setWorkflows(workflows);
      setDocumentRequirements(documentRequirements);
      setBlocks(blocks);
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      Array.isArray(state.selectedRequirements) &&
      state.selectedRequirements.length > 0
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        selectedBlocks: state.selectedBlocks,
        selectedRequirements: state.selectedRequirements,
        service:
          services.find((service) => service.value === state.service) ?? null,
      }));
    }
  }, [mode, state.selectedRequirements, state.selectedBlocks]);

  return (
    <>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Category Name"
        />
      </div>

      <div className="col-md-4 mb-3">
        <TextInput
          label="Icon"
          name="icon"
          value={state.icon}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Category Icon"
        />
      </div>

      <div className="col-md-4 mb-3">
        <Select
          label="Type"
          name="type"
          value={state.type}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "staff", label: "Staff" },
            { value: "third-party", label: "Third Party" },
          ]}
          defaultValue=""
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-6 mb-3">
        <Select
          label="Signature Type"
          name="signature_type"
          value={state.signature_type}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "none", label: "None" },
            { value: "flex", label: "Flex" },
            { value: "boxed", label: "Boxed" },
            { value: "flush", label: "Flush" },
            { value: "stacked", label: "Stacked" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="lg"
        />
      </div>
      <div className="col-md-6 mb-3">
        <Select
          label="With Date"
          name="with_date"
          value={state.with_date}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: 0, label: "No" },
            { value: 1, label: "Yes" },
          ]}
          defaultValue={999}
          defaultCheckDisabled
        />
      </div>

      <div className="col-md-4 mb-3">
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
      <div className="col-md-4 mb-3">
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
      <div className="col-md-4 mb-3">
        <MultiSelect
          label="Service"
          options={services}
          value={selectedOptions.service}
          onChange={handleSelectionChange("service")}
          placeholder="Service"
          isSearchable
          isDisabled={loading}
        />
      </div>

      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Supporting Documents Required"
          options={formatOptions(documentRequirements, "id", "name")}
          value={selectedOptions.selectedRequirements}
          onChange={handleSelectionChange("selectedRequirements")}
          placeholder="Document Requirements"
          isSearchable
          isMulti
          isDisabled={loading}
        />
      </div>
      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Template Blocks"
          options={formatOptions(blocks, "id", "title")}
          value={selectedOptions.selectedBlocks}
          onChange={handleSelectionChange("selectedBlocks")}
          placeholder="Template Blocks"
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
