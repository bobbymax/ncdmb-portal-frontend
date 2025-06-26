import { useStateContext } from "app/Context/ContentContext";
import { ModalValueProps, useModal } from "app/Context/ModalContext";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { ServerTrackerData } from "app/Repositories/ProgressTracker/data";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { formatOptions } from "app/Support/Helpers";
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ActionMeta } from "react-select";
import Button from "resources/views/components/forms/Button";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";

type DependencyProps = [
  departments: DataOptionsProps[],
  documentTypes: DataOptionsProps[],
  carders: DataOptionsProps[],
  stages: WorkflowStageResponseData[],
  signatories: SignatoryResponseData[],
  workflows: WorkflowResponseData[],
  widgets: DataOptionsProps[]
];

const TrackerModal: React.FC<ModalValueProps> = ({
  data,
  isUpdating,
  dependencies,
  onSubmit,
}) => {
  const { getModalState, updateModalState } = useModal();
  const { isLoading } = useStateContext();
  const identifier = "tracker";
  const state: ServerTrackerData = getModalState(identifier);

  // Extract dependencies safely
  const [
    departments,
    documentTypes,
    carders,
    stages,
    signatories,
    workflows,
    widgets,
  ] = useMemo(() => {
    return dependencies
      ? (dependencies as DependencyProps)
      : [[], [], [], [], [], [], []];
  }, [dependencies]);

  const [groups, setGroups] = useState<DataOptionsProps[]>([]);
  const [accessibleActions, setAccessibleActions] = useState<
    DataOptionsProps[]
  >([]);
  const [distribution, setDistribution] = useState<DataOptionsProps[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<{
    group: DataOptionsProps | null;
    department: DataOptionsProps | null;
    document_type: DataOptionsProps | null;
    carder: DataOptionsProps | null;
    signatory: DataOptionsProps | null;
    internal_process: DataOptionsProps | null;
    permission: DataOptionsProps | null;
    actions: DataOptionsProps[];
    recipients: DataOptionsProps[];
    widgets: DataOptionsProps[];
  }>({
    group: null,
    department: null,
    document_type: null,
    carder: null,
    signatory: null,
    internal_process: null,
    permission: null,
    actions: [],
    recipients: [],
    widgets: [],
  });

  /**
   * Handle selection changes for various fields
   */
  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = Array.isArray(newValue)
          ? (newValue as DataOptionsProps[])
          : (newValue as DataOptionsProps);

        // Update modal state dynamically
        updateModalState(
          identifier,
          Array.isArray(updatedValue)
            ? { [key]: updatedValue }
            : { [key === "permission" ? key : `${key}_id`]: updatedValue.value }
        );

        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
      },
    [updateModalState, identifier]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(state);

    onSubmit(state, "update");
  };

  const permissions: DataOptionsProps[] = [
    { value: "r", label: "Read" },
    { value: "rw", label: "Read/Write" },
    { value: "rwx", label: "Read/Write/Execute" },
  ];

  /**
   * Sync `data` from props into modal state
   */
  useEffect(() => {
    if (data && groups.length > 0) {
      const raw = data as ServerTrackerData;
      updateModalState(identifier, raw);

      const sig =
        signatories.find((signatory) => signatory.id === raw.signatory_id) ??
        null;

      const formatted: DataOptionsProps = {
        value: sig?.id ?? 0,
        label: sig?.compound ?? "none",
      };

      const process =
        workflows.find((workflow) => workflow.id === raw.internal_process_id) ??
        null;

      const permission =
        permissions.find((perm) => perm.value === raw.permission) ?? null;

      setSelectedOptions((prev) => ({
        ...prev,
        group: groups.find((grp) => grp.value === raw.group_id) ?? null,
        department:
          departments.find((dept) => dept.value === raw.department_id) ?? null,
        document_type:
          documentTypes.find(
            (docType) => docType.value === raw.document_type_id
          ) ?? null,
        carder:
          carders.find((carder) => carder.value === raw.carder_id) ?? null,
        permission,
        internal_process: process
          ? { value: process.id, label: process.name }
          : { value: 0, label: "None" },
        signatory: formatted,
        actions: raw.actions ?? [],
        recipients: raw.recipients ?? [],
        widgets:
          raw.widgets?.length < 1 ? [{ value: 0, label: "None" }] : raw.widgets,
      }));
    }
  }, [data, groups]);

  /**
   * Update form state when dependencies change
   */
  useEffect(() => {
    if (stages.length > 0) {
      const currentStage = stages[0]; // Default to the first stage
      setGroups(currentStage.groups ?? []);
      setAccessibleActions(currentStage.actions ?? []);
      setDistribution(currentStage.recipients ?? []);
    }
  }, [stages]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps[] | DataOptionsProps | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isDisabled: boolean = false,
    grid: number = 4,
    isMulti: boolean = false
  ) => (
    <div className={`col-md-${grid} mb-2`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={isDisabled}
        isMulti={isMulti}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        {renderMultiSelect(
          "Groups",
          groups,
          selectedOptions.group,
          handleSelectionChange("group"),
          "Group"
        )}
        {renderMultiSelect(
          "Departments",
          departments,
          selectedOptions.department,
          handleSelectionChange("department"),
          "Department"
        )}
        {renderMultiSelect(
          "Document Types",
          documentTypes,
          selectedOptions.document_type,
          handleSelectionChange("document_type"),
          "Document Type"
        )}
        {renderMultiSelect(
          "Can Perform Actions",
          accessibleActions,
          selectedOptions.actions,
          handleSelectionChange("actions"),
          "Actions",
          false,
          6,
          true
        )}
        {renderMultiSelect(
          "Distribution List",
          distribution,
          selectedOptions.recipients,
          handleSelectionChange("recipients"),
          "Recipients",
          false,
          6,
          true
        )}
        {renderMultiSelect(
          "Access Level",
          carders,
          selectedOptions.carder,
          handleSelectionChange("carder"),
          "Carder"
        )}
        {renderMultiSelect(
          "Signatory",
          formatOptions(signatories, "id", "compound", true),
          selectedOptions.signatory,
          handleSelectionChange("signatory"),
          "Signatory"
        )}
        {renderMultiSelect(
          "Internal Process",
          formatOptions(workflows, "id", "name", true),
          selectedOptions.internal_process,
          handleSelectionChange("internal_process"),
          "Process"
        )}
        {renderMultiSelect(
          "Widgets",
          widgets,
          selectedOptions.widgets,
          handleSelectionChange("widgets"),
          "Widgets",
          false,
          6,
          true
        )}
        {renderMultiSelect(
          "Permissions",
          permissions,
          selectedOptions.permission,
          handleSelectionChange("permission"),
          "Permisison",
          false,
          6
        )}
        <div className="col-md-12">
          <Button
            label="Update Tracker"
            icon="ri-save-2-line"
            type="submit"
            variant="dark"
            size="sm"
          />
        </div>
      </div>
    </form>
  );
};

export default TrackerModal;
