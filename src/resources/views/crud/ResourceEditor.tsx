import { GroupResponseData } from "app/Repositories/Group/data";
import { ResourceEditorResponseData } from "app/Repositories/ResourceEditor/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { toTitleCase } from "bootstrap/repositories";
import { ActionMeta } from "react-select";
import { formatOptions } from "app/Support/Helpers";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";

interface DependencyProps {
  services: string[];
  groups: GroupResponseData[];
  workflows: WorkflowResponseData[];
  stages: WorkflowStageResponseData[];
}

const ResourceEditor: React.FC<
  FormPageComponentProps<ResourceEditorResponseData>
> = ({ state, setState, handleChange, dependencies, mode }) => {
  const [services, setSevices] = useState<DataOptionsProps[]>([]);
  const [groups, setGroups] = useState<GroupResponseData[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowResponseData[]>([]);
  const [stages, setStages] = useState<WorkflowStageResponseData[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<{
    service: DataOptionsProps | null;
    group: DataOptionsProps | null;
    workflow: DataOptionsProps | null;
    workflow_stage: DataOptionsProps | null;
  }>({
    service: null,
    group: null,
    workflow: null,
    workflow_stage: null,
  });

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;

        // Update modal state dynamically
        if (setState) {
          if (key !== "service") {
            setState((prev) => ({
              ...prev,
              [`${key}_id`]: updatedValue.value,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              [`${key}_name`]: updatedValue.value,
            }));
          }
        }

        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
      },
    [setState]
  );

  useEffect(() => {
    if (dependencies) {
      const {
        services = [],
        groups = [],
        workflows = [],
        stages = [],
      } = dependencies as DependencyProps;

      const cleaned: DataOptionsProps[] = services.map((service) => ({
        value: service.replace(/_/g, ""),
        label: toTitleCase(service),
      }));

      //   console.log(cleaned);

      setSevices(cleaned);
      setGroups(groups);
      setWorkflows(workflows);
      setStages(stages);
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      state.group_id > 0 &&
      state.workflow_id > 0 &&
      state.workflow_stage_id > 0 &&
      state.service_name !== "" &&
      services.length > 0 &&
      workflows.length > 0 &&
      stages.length > 0 &&
      groups.length > 0
    ) {
      const service =
        services.find((serv) => serv.value === state.service_name) ?? null;

      const workflow =
        workflows.find((work) => work.id === state.workflow_id) ?? null;

      const group = groups.find((grp) => grp.id === state.group_id) ?? null;
      const stage =
        stages.find((stg) => stg.id === state.workflow_stage_id) ?? null;

      setSelectedOptions((prev) => ({
        ...prev,
        service,
        workflow: workflow
          ? { value: workflow.id, label: workflow.name }
          : null,
        group: group ? { value: group.id, label: group.name } : null,
        workflow_stage: stage ? { value: stage.id, label: stage.name } : null,
      }));
    }
  }, [
    mode,
    state.group_id,
    state.workflow_id,
    state.workflow_stage_id,
    state.service_name,
    services,
    workflows,
    stages,
    groups,
  ]);

  return (
    <>
      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Groups"
          options={formatOptions(groups, "id", "name")}
          value={selectedOptions.group}
          onChange={handleSelectionChange("group")}
          placeholder="Group"
          isSearchable
          isDisabled={false}
        />
      </div>
      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Workflows"
          options={formatOptions(workflows, "id", "name")}
          value={selectedOptions.workflow}
          onChange={handleSelectionChange("workflow")}
          placeholder="Workflow"
          isSearchable
          isDisabled={false}
        />
      </div>
      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Workflow Stage"
          options={formatOptions(stages, "id", "name")}
          value={selectedOptions.workflow_stage}
          onChange={handleSelectionChange("workflow_stage")}
          placeholder="Workflow Stage"
          isSearchable
          isDisabled={false}
        />
      </div>
      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Service"
          options={services}
          value={selectedOptions.service}
          onChange={handleSelectionChange("service")}
          placeholder="Service"
          isSearchable
          isDisabled={false}
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Column"
          value={state.resource_column_name}
          onChange={handleChange}
          placeholder="Enter Resource Column"
          name="resource_column_name"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Permission"
          name="permission"
          valueKey="value"
          labelKey="label"
          value={state.permission}
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "r", label: "Read" },
            { value: "rw", label: "Read/Write" },
            { value: "rwx", label: "Read/Write/Query" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Service Update"
          name="service_update"
          valueKey="value"
          labelKey="label"
          value={state.service_update}
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "d", label: "Document" },
            { value: "dr", label: "Document/Resource" },
            { value: "drn", label: "Document/Resource/Notify" },
          ]}
          size="sm"
        />
      </div>
    </>
  );
};

export default ResourceEditor;
