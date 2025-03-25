import { DepartmentResponseData } from "app/Repositories/Department/data";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { WidgetResponseData } from "app/Repositories/Widget/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { formatOptions } from "app/Support/Helpers";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";

interface DependencyProps {
  documentTypes: DocumentTypeResponseData[];
  departments: DepartmentResponseData[];
  groups: GroupResponseData[];
}

const Widget: React.FC<FormPageComponentProps<WidgetResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
  mode,
  loading,
}) => {
  const [documentTypes, setDocumentTypes] = useState<
    DocumentTypeResponseData[]
  >([]);
  const [departments, setDepartments] = useState<DepartmentResponseData[]>([]);
  const [groups, setGroups] = useState<GroupResponseData[]>([]);

  const [selectedOption, setSelectedOption] = useState<{
    department: DataOptionsProps | null;
    document_type: DataOptionsProps | null;
    groups: DataOptionsProps[];
  }>({
    department: null,
    document_type: null,
    groups: [],
  });

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOption) => (newValue: unknown) => {
      const isArray = Array.isArray(newValue);

      //   const columnKey = Array.isArray(updatedValue) ? key : `${key}_id`;

      if (setState) {
        setState((prev) => ({
          ...prev,
          [key !== "groups" ? `${key}_id` : key]: isArray
            ? (newValue as DataOptionsProps[])
            : (newValue as DataOptionsProps).value,
        }));
      }

      setSelectedOption((prev) => ({ ...prev, [key]: newValue }));
    },
    [setState]
  );

  useEffect(() => {
    if (dependencies) {
      const {
        documentTypes = [],
        departments = [],
        groups = [],
      } = dependencies as DependencyProps;

      setDepartments(departments);
      setDocumentTypes(documentTypes);
      setGroups(groups);
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      state.document_type_id > 0 &&
      documentTypes.length > 0 &&
      departments.length > 0 &&
      groups.length > 0 &&
      state.groups.length > 0
    ) {
      const documentType =
        documentTypes.find(
          (docType) => docType.id === state.document_type_id
        ) ?? null;
      const department =
        departments.find(
          (department) => department.id === state.department_id
        ) ?? null;

      setSelectedOption((prev) => ({
        ...prev,
        document_type: documentType
          ? { value: documentType.id, label: documentType.name }
          : null,
        department: department
          ? { value: department.id, label: department.abv }
          : { value: 0, label: "None" },
        groups: state.groups,
      }));
    }
  }, [
    mode,
    state.document_type_id,
    state.department_id,
    state.groups,
    departments,
    groups,
    documentTypes,
  ]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | DataOptionsProps[] | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    grid: number = 6,
    isMulti: boolean = false
  ) => (
    <div className={`col-md-${grid} mb-3`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={loading}
        isMulti={isMulti}
      />
    </div>
  );

  return (
    <>
      {renderMultiSelect(
        "Document Types",
        formatOptions(documentTypes, "id", "name"),
        selectedOption.document_type,
        handleSelectionChange("document_type"),
        "Document Type"
      )}
      {renderMultiSelect(
        "Departments",
        formatOptions(departments, "id", "abv", true),
        selectedOption.department,
        handleSelectionChange("department"),
        "Department"
      )}

      <div className="col-md-7 mb-3">
        <TextInput
          label="Title"
          name="title"
          value={state.title}
          onChange={handleChange}
          placeholder="Enter title"
          isDisabled={loading}
        />
      </div>
      <div className="col-md-5 mb-3">
        <TextInput
          label="Component"
          name="component"
          value={state.component}
          onChange={handleChange}
          placeholder="Enter Component"
          isDisabled={loading}
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Chart Type"
          valueKey="value"
          labelKey="label"
          value={state.chart_type}
          onChange={handleChange}
          name="chart_type"
          options={[
            { value: "bar", label: "Bar" },
            { value: "line", label: "Line" },
            { value: "pie", label: "Pie" },
            { value: "none", label: "None" },
            { value: "mixed", label: "Mixed" },
          ]}
          defaultValue=""
          isDisabled={loading}
          defaultCheckDisabled
          size="sm"
        />
      </div>

      <div className="col-md-3 mb-3">
        <Select
          label="Response"
          valueKey="value"
          labelKey="label"
          value={state.response}
          onChange={handleChange}
          name="response"
          options={[
            { value: "resource", label: "Resource" },
            { value: "collection", label: "Collection" },
          ]}
          defaultValue=""
          isDisabled={loading}
          defaultCheckDisabled
          size="sm"
        />
      </div>

      <div className="col-md-3 mb-3">
        <Select
          label="Type"
          valueKey="value"
          labelKey="label"
          value={state.type}
          onChange={handleChange}
          name="type"
          options={[
            { value: "box", label: "Box" },
            { value: "card", label: "Card" },
            { value: "chart", label: "Chart" },
            { value: "banner", label: "Banner" },
            { value: "breadcrumb", label: "Breadcrumb" },
          ]}
          defaultValue=""
          isDisabled={loading}
          defaultCheckDisabled
          size="sm"
        />
      </div>

      <div className="col-md-3 mb-3">
        <Select
          label="Active State"
          valueKey="value"
          labelKey="label"
          value={state.is_active}
          onChange={handleChange}
          name="is_active"
          options={[
            { value: 0, label: "Not Active" },
            { value: 1, label: "Active" },
          ]}
          defaultValue=""
          isDisabled={loading}
          defaultCheckDisabled
          size="sm"
        />
      </div>

      {renderMultiSelect(
        "Groups",
        formatOptions(groups, "id", "name"),
        selectedOption.groups,
        handleSelectionChange("groups"),
        "Groups",
        12,
        true
      )}
    </>
  );
};

export default Widget;
