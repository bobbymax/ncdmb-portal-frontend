import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { GroupResponseData } from "@/app/Repositories/Group/data";
import { DocumentPanelResponseData } from "app/Repositories/DocumentPanel/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import Checkbox from "../components/forms/Checkbox";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { formatOptions } from "app/Support/Helpers";

interface DependencyProps {
  documentCategories: DocumentCategoryResponseData[];
  groups: GroupResponseData[];
}

const DocumentPanel: React.FC<
  FormPageComponentProps<DocumentPanelResponseData>
> = ({ state, handleChange, dependencies, setState, loading }) => {
  const [documentCategories, setDocumentCategories] = useState<
    DataOptionsProps[]
  >([]);
  const [groups, setGroups] = useState<DataOptionsProps[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    documentCategory: DataOptionsProps | null;
    groups: DataOptionsProps[];
  }>({
    documentCategory: null,
    groups: [],
  });

  useEffect(() => {
    if (dependencies) {
      const { documentCategories = [], groups = [] } =
        dependencies as DependencyProps;
      setDocumentCategories(
        formatOptions(documentCategories, "id", "name", true)
      );
      setGroups(formatOptions(groups, "id", "name"));
    }
  }, [dependencies]);

  useEffect(() => {
    if (state.document_category_id && documentCategories.length > 0) {
      const selected = documentCategories.find(
        (cat) => cat.value === state.document_category_id
      );
      setSelectedOptions((prev) => ({
        ...prev,
        documentCategory: selected || null,
      }));
    }

    if (state.groups && groups.length > 0) {
      const selectedGroups = groups.filter((group) =>
        state.groups?.some(
          (g: any) =>
            g.id === group.value || g.value === group.value || g === group.value
        )
      );
      setSelectedOptions((prev) => ({
        ...prev,
        groups: selectedGroups,
      }));
    }
  }, [state.document_category_id, state.groups, documentCategories, groups]);

  const handleDocumentCategoryChange = useCallback(
    (newValue: unknown) => {
      const updatedValue = newValue as DataOptionsProps;
      setSelectedOptions((prev) => ({
        ...prev,
        documentCategory: updatedValue,
      }));

      if (setState) {
        setState((prev) => ({
          ...prev,
          document_category_id: updatedValue.value,
        }));
      }
    },
    [setState]
  );

  const handleGroupsChange = useCallback(
    (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
      const updatedValue = newValue as DataOptionsProps[];
      setSelectedOptions((prev) => ({
        ...prev,
        groups: updatedValue,
      }));

      if (setState) {
        setState((prev) => ({
          ...prev,
          groups: updatedValue as any,
        }));
      }
    },
    [setState]
  );

  return (
    <>
      <div className="col-md-4 mb-3">
        <MultiSelect
          label="Document Category"
          options={documentCategories}
          value={selectedOptions.documentCategory}
          onChange={handleDocumentCategoryChange}
          placeholder="Select Document Category"
          isSearchable
          isDisabled={loading}
        />
      </div>

      <div className="col-md-4 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter panel name"
        />
      </div>

      <div className="col-md-4 mb-3">
        <TextInput
          label="Icon"
          name="icon"
          value={state.icon}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="e.g., ri-file-line"
        />
      </div>

      <div className="col-md-5 mb-3">
        <TextInput
          label="Component Path"
          name="component_path"
          value={state.component_path}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter component path"
        />
      </div>

      <div className="col-md-3 mb-3">
        <TextInput
          label="Order"
          name="order"
          type="number"
          value={state.order}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter display order"
        />
      </div>

      <div className="col-md-4 mb-3">
        <Select
          label="Visibility Mode"
          name="visibility_mode"
          value={state.visibility_mode}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "both", label: "Both" },
            { value: "editor", label: "Editor Only" },
            { value: "preview", label: "Preview Only" },
          ]}
          defaultValue=""
          defaultCheckDisabled
        />
      </div>

      <div className="col-md-8 mb-3">
        <MultiSelect
          label="Assigned Groups"
          options={groups}
          value={selectedOptions.groups}
          onChange={handleGroupsChange}
          placeholder="Select groups"
          isSearchable
          isDisabled={loading}
          isMulti
        />
      </div>

      <div className="col-md-4 mb-3">
        <TextInput
          label="Document Status"
          name="document_status"
          value={state.document_status}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="e.g., pending, approved, rejected, etc."
        />
      </div>

      <div className="col-md-3 mb-3">
        <Checkbox
          label="Active"
          name="is_active"
          checked={state.is_active || false}
          onChange={(e) =>
            setState &&
            setState((prev) => ({
              ...prev,
              is_active: e.target.checked,
            }))
          }
          isDisabled={loading}
        />
      </div>

      <div className="col-md-3 mb-3">
        <Checkbox
          label="Editor Only"
          name="is_editor_only"
          checked={state.is_editor_only || false}
          onChange={(e) =>
            setState &&
            setState((prev) => ({
              ...prev,
              is_editor_only: e.target.checked,
            }))
          }
          isDisabled={loading}
        />
      </div>

      <div className="col-md-3 mb-3">
        <Checkbox
          label="View Only"
          name="is_view_only"
          checked={state.is_view_only || false}
          onChange={(e) =>
            setState &&
            setState((prev) => ({
              ...prev,
              is_view_only: e.target.checked,
            }))
          }
          isDisabled={loading}
        />
      </div>

      <div className="col-md-3 mb-3">
        <Checkbox
          label="Global"
          name="is_global"
          checked={state.is_global || false}
          onChange={(e) =>
            setState &&
            setState((prev) => ({
              ...prev,
              is_global: e.target.checked,
            }))
          }
          isDisabled={loading}
        />
      </div>
    </>
  );
};

export default DocumentPanel;
