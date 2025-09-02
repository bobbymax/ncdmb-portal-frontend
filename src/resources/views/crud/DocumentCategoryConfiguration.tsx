import {
  CategoryProgressTrackerProps,
  DocumentCategoryResponseData,
  DocumentMetaDataProps,
  DocumentPolicy,
} from "@/app/Repositories/DocumentCategory/data";
import DocumentCategoryRepository from "@/app/Repositories/DocumentCategory/DocumentCategoryRepository";
import { BuilderComponentProps } from "@/bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { UserResponseData } from "@/app/Repositories/User/data";
import { WorkflowStageResponseData } from "@/app/Repositories/WorkflowStage/data";
import { GroupResponseData } from "@/app/Repositories/Group/data";
import { DepartmentResponseData } from "@/app/Repositories/Department/data";
import { toTitleCase } from "bootstrap/repositories";
import { ActionMeta } from "react-select";
import { formatOptions } from "app/Support/Helpers";
import { DocumentActionResponseData } from "@/app/Repositories/DocumentAction/data";
import Select from "../components/forms/Select";
import TextInput from "../components/forms/TextInput";
import Button from "../components/forms/Button";
import Alert from "app/Support/Alert";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export type ProcessActivitiesProps = {
  id: number;
  identifier: string;
  title: string;
  workflow_stage_id: number;
  group_id: number;
  department_id: number;
  action_label: string;
  trigger_action_id: number;
  category: "process" | "activity";
  user_id: number;
  status: "pending" | "completed" | "failed";
  document_action_id: number;
};

type DependencyProps = {
  users: UserResponseData[];
  workflowStages: WorkflowStageResponseData[];
  groups: GroupResponseData[];
  departments: DepartmentResponseData[];
  documentActions: DocumentActionResponseData[];
};

const DocumentCategoryConfiguration: React.FC<
  BuilderComponentProps<
    DocumentCategoryResponseData,
    DocumentCategoryRepository
  >
> = ({
  repo,
  resource,
  state,
  setState,
  generatedData,
  updateGlobalState,
  dependencies,
}) => {
  const navigate = useNavigate();
  const [documentConfigState, setDocumentConfigState] =
    useState<ProcessActivitiesProps>({
      id: 0,
      identifier: "",
      title: "",
      workflow_stage_id: 0,
      group_id: 0,
      department_id: 0,
      action_label: "",
      trigger_action_id: 0,
      category: "process",
      user_id: 0,
      status: "pending",
      document_action_id: 0,
    });

  const [policy, setPolicy] = useState<DocumentPolicy>({
    strict: false,
    scope: "public",
    can_override: false,
    clearance_level: null,
    fallback_approver: null,
    for_signed: false,
    days: 0,
    frequency: "days",
  });

  const [postProcessingActivities, setPostProcessingActivities] = useState<
    ProcessActivitiesProps[]
  >([]);
  const [showPostProcessingForm, setShowPostProcessingForm] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const trackers: CategoryProgressTrackerProps[] =
    state.workflow?.trackers || [];

  const [selectedActions, setSelectedActions] = useState<
    DocumentActionResponseData[]
  >([]);

  const [selectedGroups, setSelectedGroups] = useState<GroupResponseData[]>([]);

  const [selectedUsers, setSelectedUsers] = useState<DataOptionsProps[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<{
    workflow_stage: DataOptionsProps | null;
    group: DataOptionsProps | null;
    department: DataOptionsProps | null;
    user: DataOptionsProps | null;
    trigger_action: DataOptionsProps | null;
  }>({
    workflow_stage: null,
    group: null,
    department: null,
    user: null,
    trigger_action: null,
  });

  const [processActions, setProcessActions] = useState<
    DocumentActionResponseData[]
  >([]);

  const handleCardClick = useCallback(
    (cardId: number) => {
      setExpandedCard(expandedCard === cardId ? null : cardId);
    },
    [expandedCard]
  );

  const handleUpdateConfiguration = useCallback(() => {
    const configuration = {
      ...state,
      identifier: documentConfigState.identifier,
      meta_data: {
        policy,
        recipients: selectedUsers,
        actions: selectedActions,
        activities: postProcessingActivities,
      },
    };

    Alert.flash(
      "Update Configuration",
      "info",
      "Update the configuration for this document category"
    ).then(async (res) => {
      if (res.isConfirmed) {
        const response = await repo.update(
          "documentCategories",
          state.id,
          configuration
        );
        if (response.code === 200) {
          toast.success("Configuration updated successfully");
          navigate(`/specifications/document-categories`);
        }
      }
    });
  }, [policy, selectedUsers, selectedActions, repo]);

  const handleActionChange = useCallback(
    (action: DocumentActionResponseData, checked: boolean) => {
      setSelectedActions((prev) => {
        if (checked) {
          return [...prev, action];
        }
        return prev.filter((a) => a.id !== action.id);
      });
    },
    []
  );

  const {
    users = [],
    workflowStages = [],
    groups = [],
    departments = [],
    documentActions = [],
  } = useMemo(() => dependencies as DependencyProps, [dependencies]);

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) => (newValue: unknown) => {
      const updatedValue = Array.isArray(newValue)
        ? (newValue as DataOptionsProps[])
        : (newValue as DataOptionsProps);

      setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));

      if (!Array.isArray(updatedValue)) {
        setDocumentConfigState((prev) => ({
          ...prev,
          [`${key}_id`]: updatedValue.value,
        }));
      } else {
        setDocumentConfigState((prev) => ({
          ...prev,
          [key]: updatedValue,
        }));
      }
    },
    []
  );

  useEffect(() => {
    if (selectedOptions.workflow_stage?.value) {
      const workflowStage: WorkflowStageResponseData | null =
        workflowStages.find(
          (stage) => stage.id === selectedOptions.workflow_stage?.value
        ) ?? null;

      if (workflowStage) {
        setProcessActions(
          workflowStage.actions as unknown as DocumentActionResponseData[]
        );

        setSelectedGroups(
          workflowStage?.groups as unknown as GroupResponseData[]
        );
      }
    }
  }, [selectedOptions.workflow_stage]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | DataOptionsProps[] | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isDisabled: boolean = false,
    grid: number = 12,
    isMulti: boolean = false,
    description: string = ""
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
        description={description}
        aria-label={`Select ${label.toLowerCase()}`}
        aria-describedby={`${value}-${label.toLowerCase()}-description`}
        isMulti={isMulti}
      />
      {description && (
        <div
          id={`${value}-${label.toLowerCase()}-description`}
          className="sr-only"
        >
          {description}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (state.meta_data) {
      setPolicy(state.meta_data.policy as DocumentPolicy);
      if (state.meta_data.actions) {
        setSelectedActions(
          state.meta_data.actions as unknown as DocumentActionResponseData[]
        );
      }
      if (state.meta_data.recipients) {
        setSelectedUsers(state.meta_data.recipients);
      }
      if (state.meta_data.activities) {
        setPostProcessingActivities(state.meta_data.activities);
      }
    }
  }, [
    state.meta_data?.actions,
    state.meta_data?.recipients,
    state.meta_data?.activities,
    state.meta_data?.policy,
  ]);

  return (
    <>
      <div className="configuration__settings__panel">
        <div className="configuration__settings__panel__content">
          <div className="configuration__settings__panel__info">
            <h4>Document Category Configuration</h4>
            <p>
              Configure workflow actions, post-processing activities, policies,
              and notifications for this document category.
            </p>
          </div>
          <div className="configuration__settings__panel__actions">
            <Button
              label="Update Category Configuration"
              handleClick={handleUpdateConfiguration}
              size="sm"
              variant="success"
              type="button"
              icon="ri-save-line"
            />
          </div>
        </div>
      </div>
      <div className="configuration__settings__container">
        <div className="configuration__settings__item">
          <div className="configuration__settings__icon">
            <i className="ri-settings-4-line"></i>
          </div>
          <h3>
            <i className="ri-settings-4-line"></i>
            Actions
          </h3>

          <div className="configuration__settings__actions">
            {trackers.length > 0 ? (
              trackers.map((tracker, idx) => {
                const stage: WorkflowStageResponseData | null =
                  workflowStages.find(
                    (stage) => stage.id === tracker.workflow_stage_id
                  ) ?? null;

                const actions =
                  stage?.actions as unknown as DocumentActionResponseData[];

                return (
                  <div className="track__item" key={idx}>
                    <h5>
                      {toTitleCase(
                        stage?.name || `Stage ID: ${tracker.workflow_stage_id}`
                      )}
                    </h5>
                    {(actions ?? []).map((action, actionIdx) => (
                      <div
                        className="track__item__action"
                        key={`${tracker.workflow_stage_id}-${action.label}-${actionIdx}`}
                      >
                        <input
                          type="checkbox"
                          id={`action-${tracker.workflow_stage_id}-${action.label}-${actionIdx}`}
                          onChange={(e) => {
                            handleActionChange(action, e.target.checked);
                          }}
                          checked={selectedActions.some(
                            (a) => a.id === action.id
                          )}
                        />
                        <label
                          htmlFor={`action-${tracker.workflow_stage_id}-${action.label}-${actionIdx}`}
                        >
                          {toTitleCase(action.button_text)}
                        </label>
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              <div className="trackers__empty__state">
                <i className="ri-route-line"></i>
                <p>No workflow trackers configured</p>
                <span>
                  Workflow stages and actions will appear here once configured
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="configuration__settings__item">
          <div className="configuration__settings__icon">
            <i className="ri-refresh-line"></i>
          </div>
          <div className="configuration__settings__header">
            <h3>
              <i className="ri-refresh-line"></i>
              Post Processing Activities
            </h3>
            <button
              className="configuration__settings__toggle__btn"
              onClick={() => setShowPostProcessingForm(!showPostProcessingForm)}
            >
              <i
                className={
                  showPostProcessingForm ? "ri-eye-off-line" : "ri-eye-line"
                }
              ></i>
              <span>{showPostProcessingForm ? "Hide" : "Show"}</span>
            </button>
          </div>
          {/* Form Section */}
          <div
            className="configuration__settings__actions mt-5"
            style={{ display: showPostProcessingForm ? "block" : "none" }}
          >
            <div className="row">
              <div className="col-md-12 mb-2">
                <TextInput
                  label="Name"
                  name="title"
                  onChange={(e) => {
                    setDocumentConfigState((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }));
                  }}
                  value={documentConfigState.title}
                  placeholder="Activity Name"
                  size="lg"
                />
              </div>
              {renderMultiSelect(
                "Desk",
                formatOptions(workflowStages, "id", "name"),
                selectedOptions.workflow_stage,
                handleSelectionChange("workflow_stage"),
                "Desk"
              )}
              {renderMultiSelect(
                "Department",
                formatOptions(departments, "id", "abv", true),
                selectedOptions.department,
                handleSelectionChange("department"),
                "Department",
                false,
                6
              )}
              <div className="col-md-6 mb-3">
                <Select
                  label="Category"
                  options={[
                    {
                      label: "Process",
                      value: "process",
                    },
                    {
                      label: "Activity",
                      value: "activity",
                    },
                  ]}
                  onChange={(e) => {
                    setDocumentConfigState((prev) => ({
                      ...prev,
                      category: e.target.value as "process" | "activity",
                    }));
                  }}
                  defaultValue=""
                  valueKey="value"
                  labelKey="label"
                  defaultCheckDisabled
                  size="xl"
                />
              </div>
              {renderMultiSelect(
                "Group",
                formatOptions(selectedGroups, "id", "name"),
                selectedOptions.group,
                handleSelectionChange("group"),
                "Group"
              )}
              <div className="col-md-6 mb-3">
                <Select
                  label="Event"
                  options={
                    selectedActions.length > 0
                      ? selectedActions.map((action) => ({
                          label: toTitleCase(action.draft_status),
                          value: action.id,
                        }))
                      : [{ label: "No Actions", value: 0 }]
                  }
                  value={documentConfigState.document_action_id}
                  onChange={(e) => {
                    setDocumentConfigState((prev) => ({
                      ...prev,
                      document_action_id: Number(e.target.value),
                    }));
                  }}
                  defaultValue=""
                  valueKey="value"
                  isDisabled={false}
                  labelKey="label"
                  defaultCheckDisabled
                  size="xl"
                />
              </div>
              {renderMultiSelect(
                "Trigger Activity",
                formatOptions(processActions, "id", "name", true),
                selectedOptions.trigger_action,
                handleSelectionChange("trigger_action"),
                "Action",
                false,
                6
              )}
              {renderMultiSelect(
                "Staff",
                formatOptions(users, "id", "name", true),
                selectedOptions.user,
                handleSelectionChange("user"),
                "User"
              )}

              <div className="col-md-12 mt-4 mb-3">
                {/* Button Area */}
                <Button
                  label="Add Activity"
                  handleClick={(value: any) => {
                    // Validate required fields
                    if (
                      !documentConfigState.title ||
                      !documentConfigState.workflow_stage_id
                    ) {
                      return;
                    }

                    // Create new activity
                    const newActivity: ProcessActivitiesProps = {
                      ...documentConfigState,
                      id: Date.now(), // Temporary ID for now
                    };

                    // Add to postProcessingActivities
                    setPostProcessingActivities((prev) => [
                      ...prev,
                      newActivity,
                    ]);

                    // Reset form
                    setDocumentConfigState({
                      id: 0,
                      identifier: "",
                      title: "",
                      workflow_stage_id: 0,
                      group_id: 0,
                      department_id: 0,
                      action_label: "",
                      trigger_action_id: 0,
                      category: "process",
                      user_id: 0,
                      status: "pending",
                      document_action_id: 0,
                    });

                    // Reset selected options
                    setSelectedOptions({
                      workflow_stage: null,
                      group: null,
                      department: null,
                      user: null,
                      trigger_action: null,
                    });

                    setShowPostProcessingForm(false);
                  }}
                  size="sm"
                  variant="dark"
                  type="button"
                  icon="ri-terminal-box-line"
                />
              </div>
            </div>
          </div>

          {/* Activities Display Section */}
          <div
            className="configuration__settings__activities__display mt-5"
            style={{ display: showPostProcessingForm ? "none" : "block" }}
          >
            {postProcessingActivities.length > 0 ? (
              <>
                <div className="activities__scroll__container">
                  <div className="activities__grid">
                    {postProcessingActivities.map((activity, index) => {
                      // Find corresponding data from useMemo dependencies
                      const workflowStage = workflowStages.find(
                        (stage) => stage.id === activity.workflow_stage_id
                      );
                      const department = departments.find(
                        (dept) => dept.id === activity.department_id
                      );
                      const group = groups.find(
                        (grp) => grp.id === activity.group_id
                      );
                      const user = users.find(
                        (usr) => usr.id === activity.user_id
                      );
                      const triggerAction = documentActions.find(
                        (action) => action.id === activity.trigger_action_id
                      );

                      return (
                        <div
                          key={activity.id || index}
                          className={`activity__card ${
                            expandedCard === activity.id ? "expanded" : ""
                          }`}
                          onClick={() => handleCardClick(activity.id)}
                        >
                          {/* Expand indicator */}
                          <div className="expand__indicator">
                            <i
                              className={
                                expandedCard === activity.id
                                  ? "ri-subtract-line"
                                  : "ri-add-line"
                              }
                            ></i>
                          </div>

                          <div className="activity__card__header">
                            <div className="activity__card__title">
                              <i className="ri-settings-4-line"></i>
                              <span>{activity.title}</span>
                            </div>
                            <div className="activity__card__category">
                              <span
                                className={`category__badge category__${activity.category}`}
                              >
                                {toTitleCase(activity.category)}
                              </span>
                            </div>
                          </div>

                          <div className="activity__card__content">
                            <div className="activity__card__row">
                              <span className="activity__card__label">
                                Desk:
                              </span>
                              <span className="activity__card__value">
                                {workflowStage?.name || "N/A"}
                              </span>
                            </div>

                            {activity.department_id > 0 && (
                              <div className="activity__card__row">
                                <span className="activity__card__label">
                                  Department:
                                </span>
                                <span className="activity__card__value">
                                  {department?.abv || department?.name || "N/A"}
                                </span>
                              </div>
                            )}

                            {activity.group_id > 0 && (
                              <div className="activity__card__row">
                                <span className="activity__card__label">
                                  Group:
                                </span>
                                <span className="activity__card__value">
                                  {group?.name || "N/A"}
                                </span>
                              </div>
                            )}

                            {activity.user_id > 0 && (
                              <div className="activity__card__row">
                                <span className="activity__card__label">
                                  Staff:
                                </span>
                                <span className="activity__card__value">
                                  {user?.name || "N/A"}
                                </span>
                              </div>
                            )}

                            {activity.action_label && (
                              <div className="activity__card__row">
                                <span className="activity__card__label">
                                  Event:
                                </span>
                                <span className="activity__card__value">
                                  {toTitleCase(activity.action_label)}
                                </span>
                              </div>
                            )}

                            {activity.trigger_action_id > 0 && (
                              <div className="activity__card__row">
                                <span className="activity__card__label">
                                  Trigger:
                                </span>
                                <span className="activity__card__value">
                                  {triggerAction?.name || "N/A"}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="activity__card__actions">
                            <button
                              className="activity__card__action__btn edit"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card expansion
                                // TODO: Implement edit functionality
                                console.log("Edit activity:", activity);
                              }}
                              title="Edit Activity"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              className="activity__card__action__btn delete"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card expansion
                                setPostProcessingActivities((prev) =>
                                  prev.filter((a) => a.id !== activity.id)
                                );
                              }}
                              title="Delete Activity"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Beautiful stacked cards - no more slider needed! */}
              </>
            ) : (
              <div className="activities__empty__state">
                <i className="ri-inbox-line"></i>
                <p>No post-processing activities configured yet</p>
                <span>
                  Click &quot;Add Activity&quot; to add your first activity
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="configuration__settings__item">
          <div className="configuration__settings__icon">
            <i className="ri-shield-check-line"></i>
          </div>
          <h3>
            <i className="ri-shield-check-line"></i>
            Policy
          </h3>
          <div className="configuration__settings__policy mt-5">
            <div className="row">
              {/* Boolean Properties - Checkboxes */}
              <div className="col-md-12 mb-3">
                <div className="policy__checkbox__group">
                  <label className="policy__checkbox__label">
                    <input
                      type="checkbox"
                      checked={policy.strict}
                      onChange={(e) =>
                        setPolicy((prev) => ({
                          ...prev,
                          strict: e.target.checked,
                        }))
                      }
                      className="policy__checkbox"
                    />
                    <span className="policy__checkbox__text">
                      Strict Policy
                    </span>
                  </label>
                  <small className="policy__checkbox__description">
                    Enforce strict compliance rules
                  </small>
                </div>
              </div>

              <div className="col-md-12 mb-3">
                <div className="policy__checkbox__group">
                  <label className="policy__checkbox__label">
                    <input
                      type="checkbox"
                      checked={policy.can_override}
                      onChange={(e) =>
                        setPolicy((prev) => ({
                          ...prev,
                          can_override: e.target.checked,
                        }))
                      }
                      className="policy__checkbox"
                    />
                    <span className="policy__checkbox__text">
                      Allow Override
                    </span>
                  </label>
                  <small className="policy__checkbox__description">
                    Permit policy exceptions
                  </small>
                </div>
              </div>

              <div className="col-md-12 mb-3">
                <div className="policy__checkbox__group">
                  <label className="policy__checkbox__label">
                    <input
                      type="checkbox"
                      checked={policy.for_signed}
                      onChange={(e) =>
                        setPolicy((prev) => ({
                          ...prev,
                          for_signed: e.target.checked,
                        }))
                      }
                      className="policy__checkbox"
                    />
                    <span className="policy__checkbox__text">
                      For Signed Documents
                    </span>
                  </label>
                  <small className="policy__checkbox__description">
                    Apply to signed documents only
                  </small>
                </div>
              </div>

              {/* Scope Selection */}
              <div className="col-md-12 mb-4">
                <div className="policy__radio__group">
                  <label className="policy__radio__label">
                    <span className="policy__radio__text">Scope</span>
                  </label>
                  <div className="policy__radio__options">
                    <label className="policy__radio__option">
                      <input
                        type="radio"
                        name="scope"
                        value="public"
                        checked={policy.scope === "public"}
                        onChange={(e) =>
                          setPolicy((prev) => ({
                            ...prev,
                            scope: e.target.value as
                              | "public"
                              | "private"
                              | "confidential"
                              | "restricted",
                          }))
                        }
                        className="policy__radio"
                      />
                      <span className="policy__radio__text">Public</span>
                    </label>
                    <label className="policy__radio__option">
                      <input
                        type="radio"
                        name="scope"
                        value="private"
                        checked={policy.scope === "private"}
                        onChange={(e) =>
                          setPolicy((prev) => ({
                            ...prev,
                            scope: e.target.value as
                              | "public"
                              | "private"
                              | "confidential"
                              | "restricted",
                          }))
                        }
                        className="policy__radio"
                      />
                      <span className="policy__radio__text">Private</span>
                    </label>
                    <label className="policy__radio__option">
                      <input
                        type="radio"
                        name="scope"
                        value="confidential"
                        checked={policy.scope === "confidential"}
                        onChange={(e) =>
                          setPolicy((prev) => ({
                            ...prev,
                            scope: e.target.value as
                              | "public"
                              | "private"
                              | "confidential"
                              | "restricted",
                          }))
                        }
                        className="policy__radio"
                      />
                      <span className="policy__radio__text">Confidential</span>
                    </label>
                    <label className="policy__radio__option">
                      <input
                        type="radio"
                        name="scope"
                        value="restricted"
                        checked={policy.scope === "restricted"}
                        onChange={(e) =>
                          setPolicy((prev) => ({
                            ...prev,
                            scope: e.target.value as
                              | "public"
                              | "private"
                              | "confidential"
                              | "restricted",
                          }))
                        }
                        className="policy__radio"
                      />
                      <span className="policy__radio__text">Restricted</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* MultiSelect for Groups */}
              {renderMultiSelect(
                "Clearance Level",
                formatOptions(groups, "id", "name", true),
                policy.clearance_level,
                (newValue) => {
                  if (Array.isArray(newValue)) {
                    setPolicy((prev) => ({
                      ...prev,
                      clearance_level: newValue[0] || null,
                    }));
                  } else {
                    setPolicy((prev) => ({
                      ...prev,
                      clearance_level: newValue as DataOptionsProps,
                    }));
                  }
                },
                "Select clearance level",
                false,
                12
              )}

              {renderMultiSelect(
                "Fallback Approver",
                formatOptions(groups, "id", "name"),
                policy.fallback_approver,
                (newValue) => {
                  if (Array.isArray(newValue)) {
                    setPolicy((prev) => ({
                      ...prev,
                      fallback_approver: newValue[0] || null,
                    }));
                  } else {
                    setPolicy((prev) => ({
                      ...prev,
                      fallback_approver: newValue as DataOptionsProps,
                    }));
                  }
                },
                "Select fallback approver",
                false,
                12
              )}

              {/* Days and Frequency */}
              <div className="col-md-6 mb-3">
                <Select
                  label="Days"
                  options={Array.from({ length: 12 }, (_, i) => ({
                    label: `${i + 1} day${i === 0 ? "" : "s"}`,
                    value: i + 1,
                  }))}
                  onChange={(e) =>
                    setPolicy((prev) => ({
                      ...prev,
                      days: parseInt(e.target.value),
                    }))
                  }
                  defaultValue=""
                  valueKey="value"
                  labelKey="label"
                  defaultCheckDisabled
                  size="xl"
                />
              </div>

              <div className="col-md-6 mb-3">
                <Select
                  label="Frequency"
                  options={[
                    { label: "Days", value: "days" },
                    { label: "Weeks", value: "weeks" },
                    { label: "Months", value: "months" },
                    { label: "Years", value: "years" },
                  ]}
                  onChange={(e) =>
                    setPolicy((prev) => ({
                      ...prev,
                      frequency: e.target.value as
                        | "days"
                        | "weeks"
                        | "months"
                        | "years",
                    }))
                  }
                  defaultValue=""
                  valueKey="value"
                  labelKey="label"
                  defaultCheckDisabled
                  size="xl"
                />
              </div>

              {/* Access Token (Optional) */}
              <div className="col-md-12 mb-3">
                <TextInput
                  label="Access Token (Optional)"
                  name="access_token"
                  onChange={(e) =>
                    setPolicy((prev) => ({
                      ...prev,
                      access_token: e.target.value,
                    }))
                  }
                  value={policy.access_token || ""}
                  placeholder="Enter access token if required"
                  size="lg"
                />
              </div>

              {/* Policy Summary Display */}
              <div className="col-md-12 mt-4">
                <div className="policy__summary">
                  <h6>Policy Summary</h6>
                  <div className="policy__summary__content">
                    <div className="policy__summary__row">
                      <span className="policy__summary__label">Mode:</span>
                      <span
                        className={`policy__summary__value ${
                          policy.strict ? "strict" : "flexible"
                        }`}
                      >
                        {policy.strict ? "Strict" : "Flexible"}
                      </span>
                    </div>
                    <div className="policy__summary__row">
                      <span className="policy__summary__label">Scope:</span>
                      <span
                        className={`policy__summary__value ${policy.scope}`}
                      >
                        {toTitleCase(policy.scope)}
                      </span>
                    </div>
                    <div className="policy__summary__row">
                      <span className="policy__summary__label">Override:</span>
                      <span
                        className={`policy__summary__value ${
                          policy.can_override ? "allowed" : "denied"
                        }`}
                      >
                        {policy.can_override ? "Allowed" : "Denied"}
                      </span>
                    </div>
                    {policy.days > 0 && (
                      <div className="policy__summary__row">
                        <span className="policy__summary__label">
                          Duration:
                        </span>
                        <span className="policy__summary__value">
                          {policy.days} {policy.frequency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="configuration__settings__item">
          <div className="configuration__settings__icon">
            <i className="ri-notification-4-line"></i>
          </div>
          <h3>
            <i className="ri-notification-4-line"></i>
            Notifications
          </h3>
          <div className="configuration__settings__notifications mt-5">
            {/* Form Input Section */}
            <div className="configuration__settings__notifications__form mb-4">
              {renderMultiSelect(
                "Recipients",
                formatOptions(users, "id", "name"),
                selectedUsers,
                (newValue) => {
                  setSelectedUsers(newValue as DataOptionsProps[]);
                },
                "Staff",
                false,
                12,
                true
              )}
            </div>

            {/* User Cards Display Section */}
            <div className="configuration__settings__notifications__display">
              {/* <h6 className="mb-3">Selected Staff</h6> */}
              {selectedUsers && selectedUsers.length > 0 ? (
                <div className="notifications__users__grid">
                  {selectedUsers.map((userOption) => {
                    const user = users.find((u) => u.id === userOption.value);
                    if (!user) return null;

                    const initials = user.name
                      ? user.name
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "U";

                    return (
                      <div key={user.id} className="notification__user__card">
                        <div className="notification__user__avatar">
                          <span className="notification__user__initials">
                            {initials}
                          </span>
                        </div>
                        <div className="notification__user__info">
                          <div className="notification__user__name">
                            {user.name}
                          </div>
                          <div className="notification__user__email">
                            {user.email || "No email"}
                          </div>
                        </div>
                        <button
                          className="notification__user__remove"
                          onClick={() => {
                            setSelectedUsers((prev) =>
                              prev.filter((u) => u.value !== user.id)
                            );
                          }}
                          title="Remove user"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="notifications__empty__state">
                  <i className="ri-user-line"></i>
                  <p>No users selected for notifications</p>
                  <span>Use the form above to add notification recipients</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentCategoryConfiguration;
