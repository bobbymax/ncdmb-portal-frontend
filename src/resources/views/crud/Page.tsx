/* eslint-disable react-hooks/exhaustive-deps */
import { AuthPageResponseData } from "app/Repositories/Page/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import { RoleResponseData } from "app/Repositories/Role/data";
import { ActionMeta } from "react-select";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";

interface DependencyProps {
  pages: AuthPageResponseData[];
  roles: RoleResponseData[];
  workflows: WorkflowResponseData[];
  documentTypes: DocumentTypeResponseData[];
}

const Page: React.FC<FormPageComponentProps<AuthPageResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
  handleReactSelect,
  mode,
  loading,
}) => {
  const [pages, setPages] = useState<
    { value: string | number; label: string | number }[]
  >([]);
  const [roles, setRoles] = useState<RoleResponseData[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<DataOptionsProps[]>([]);
  const [workflows, setWorkflows] = useState<DataOptionsProps[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DataOptionsProps[]>([]);

  const handleRolesChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    // setSelectedRoles(newValue as DataOptionsProps[]);
    handleReactSelect(newValue, actionMeta, (value) => {
      setSelectedRoles(value as DataOptionsProps[]);
    });
  };

  useEffect(() => {
    if (dependencies) {
      const {
        pages = [],
        roles = [],
        workflows = [],
        documentTypes = [],
      } = dependencies as DependencyProps;

      const options = pages
        .filter((page) => page.type === "app")
        .map((page) => ({
          value: page.id,
          label: page.name,
        }));
      setPages([{ value: 0, label: "None" }, ...options]);
      setRoles(roles);
      setWorkflows([
        { value: 0, label: "None" },
        ...formatOptions(workflows, "id", "name"),
      ]);
      setDocumentTypes([
        { value: 0, label: "None" },
        ...formatOptions(documentTypes, "id", "name"),
      ]);
    }
  }, [dependencies]);

  useEffect(() => {
    if (selectedRoles.length > 0 && setState) {
      setState({
        ...state,
        roles: selectedRoles,
      });
    }
  }, [selectedRoles, setState]);

  // console.log(mode);

  useEffect(() => {
    if (
      mode === "update" &&
      Array.isArray(state.roles) &&
      state.roles.length > 0
    ) {
      setSelectedRoles(state.roles);
    }
  }, [mode, state.roles]);

  return (
    <>
      <div className="col-md-7 mb-3">
        <TextInput
          label="Name"
          value={state.name}
          name="name"
          onChange={handleChange}
          placeholder="Enter Page Name"
        />
      </div>
      <div className="col-md-5 mb-3">
        <TextInput
          label="Path"
          value={state.path}
          name="path"
          onChange={handleChange}
          placeholder="Enter Page Path"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Icon"
          value={state.icon}
          name="icon"
          onChange={handleChange}
          placeholder="Enter Page Icon"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Parent"
          value={state.parent_id}
          name="parent_id"
          onChange={handleChange}
          options={pages}
          valueKey="value"
          labelKey="label"
          defaultValue={9999}
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Page Type"
          value={state.type}
          name="type"
          onChange={handleChange}
          options={[
            { label: "App", value: "app" },
            { label: "Index", value: "index" },
            { label: "View", value: "view" },
            { label: "Form", value: "form" },
            { label: "Dashboard", value: "dashboard" },
            { label: "Report", value: "report" },
            { label: "Settings", value: "external" },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Workflow"
          value={state.workflow_id}
          name="workflow_id"
          onChange={handleChange}
          options={workflows}
          valueKey="value"
          labelKey="label"
          defaultValue={999}
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Document Type"
          value={state.document_type_id}
          name="document_type_id"
          onChange={handleChange}
          options={documentTypes}
          valueKey="value"
          labelKey="label"
          defaultValue={999}
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-4 mb-3">
        <MultiSelect
          label="Roles"
          options={formatOptions(roles, "id", "name")}
          value={selectedRoles}
          onChange={handleRolesChange}
          placeholder="Select Roles"
          isSearchable
          isMulti
          isDisabled={loading}
        />
      </div>
    </>
  );
};

export default Page;
