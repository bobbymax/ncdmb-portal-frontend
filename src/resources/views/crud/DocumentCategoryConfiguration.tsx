import {
  CategoryProgressTrackerProps,
  DocumentCategoryResponseData,
  DocumentMetaDataProps,
  DocumentPolicy,
} from "@/app/Repositories/DocumentCategory/data";
import DocumentCategoryRepository from "@/app/Repositories/DocumentCategory/DocumentCategoryRepository";
import { BuilderComponentProps } from "@/bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
import { useModal } from "app/Context/ModalContext";
import PostProcessingActivityModal from "./modals/PostProcessingActivityModal";
import Alert from "app/Support/Alert";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "app/Context/AuthContext";
import { useDocumentSignatories } from "app/Hooks/useDocumentSignatories";
import { SignatoryConfiguration } from "app/Utils/SignatoryConfiguration";
import { ProcessFlowConfigProps } from "./DocumentWorkflow";
import { WorkflowResponseData } from "@/app/Repositories/Workflow/data";

export type ProcessActivitiesProps = {
  id?: number;
  title: string;
  workflow_id: number;
  workflow_stage_id: number;
  group_id: number;
  department_id: number;
  document_action_status: string;
  trigger_action_id: number;
  category: "add_tracker" | "notify" | "mail" | "default" | "no_action";
  user_id: number;
};

export type SelectedActionsProps = {
  identifier: string;
  action: DocumentActionResponseData;
};

export type RecipientProps = {
  id: number;
  type: "user" | "group";
  name: string;
  email?: string;
  description?: string;
};

type DependencyProps = {
  users: UserResponseData[];
  workflowStages: WorkflowStageResponseData[];
  groups: GroupResponseData[];
  departments: DepartmentResponseData[];
  documentActions: DocumentActionResponseData[];
  workflows: WorkflowResponseData[];
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
  const { staff } = useAuth();
  const { resolveSignatories } = useDocumentSignatories();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<DocumentPolicy>({
    strict: false,
    scope: "public",
    can_override: false,
    clearance_level: null,
    fallback_approver: null,
    for_signed: false,
    days: 0,
    frequency: "days",
    allowedActions: {
      from: [],
      through: [],
      to: [],
    },
    // Signatory resolution properties
    department_id: null,
    initiator_group_id: null,
    approval_group_id: null,
    destination_department_id: null,
    mustPassThrough: false,
    through_group_id: null,
    // Workflow stage IDs for actions
    initiator_workflow_stage_id: null,
    approval_workflow_stage_id: null,
    through_workflow_stage_id: null,
    // Signing control properties
    initiator_should_sign: true,
    through_should_sign: true,
    // Fixed user IDs
    initiator_user_id: null,
    through_user_id: null,
    to_user_id: null,
  });

  const [postProcessingActivities, setPostProcessingActivities] = useState<
    ProcessActivitiesProps[]
  >([]);

  const trackers: CategoryProgressTrackerProps[] =
    state.workflow?.trackers || [];

  const [selectedActions, setSelectedActions] = useState<DataOptionsProps[]>(
    []
  );

  const [selectedUsers, setSelectedUsers] = useState<DataOptionsProps[]>([]);
  const [recipientSearchQuery, setRecipientSearchQuery] = useState<string>("");
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    useState<number>(-1);
  const [selectedRecipients, setSelectedRecipients] = useState<
    RecipientProps[]
  >([]);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const {
    users = [],
    workflowStages = [],
    groups = [],
    departments = [],
    documentActions = [],
    workflows = [],
  } = useMemo(() => dependencies as DependencyProps, [dependencies]);

  const workflowOptions = useMemo(
    () => formatOptions(workflows, "id", "name", true),
    [workflows]
  );

  const workflowStageOptions = useMemo(
    () => formatOptions(workflowStages, "id", "name"),
    [workflowStages]
  );

  const groupOptions = useMemo(
    () => formatOptions(groups, "id", "name"),
    [groups]
  );

  const departmentOptions = useMemo(() => {
    const formatted = formatOptions(departments, "id", "name");
    return [{ value: 0, label: "Originating Department" }, ...formatted];
  }, [departments]);

  const userOptions = useMemo(
    () => formatOptions(users, "id", "name", true),
    [users]
  );

  // Helper function to resolve department name
  const resolveDepartmentName = useCallback(
    (departmentId: number | null | undefined): string => {
      if (!departmentId || departmentId < 1) {
        return "Originating Department";
      }
      const department = departments.find((d) => d.id === departmentId);
      return department?.name || `Department ${departmentId}`;
    },
    [departments]
  );

  // console.log(resolveDepartmentName(policy.department_id));

  // console.log(departments);

  // Helper function to resolve group name
  const resolveGroupName = useCallback(
    (groupId: number | null | undefined): string | null => {
      if (!groupId || groupId === 0) return null;
      const group = groups.find((g) => g.id === groupId);
      return group?.name || `Group ${groupId}`;
    },
    [groups]
  );

  // Helper function to resolve workflow stage name and get actions
  const resolveWorkflowStage = useCallback(
    (
      stageId: number | null | undefined
    ): {
      name: string | null;
      actions: DocumentActionResponseData[];
    } => {
      if (!stageId || stageId === 0) {
        return { name: null, actions: [] };
      }
      const stage = workflowStages.find((ws) => ws.id === stageId);
      if (!stage) {
        return { name: null, actions: [] };
      }
      // console.log(stage);
      return {
        name: stage.name || `Stage ${stageId}`,
        actions:
          (stage.actions as unknown as DocumentActionResponseData[]) || [],
      };
    },
    [workflowStages]
  );

  const resolveUserById = useCallback(
    (userId: number | null | undefined) => {
      if (!userId || userId <= 0) return null;
      return users.find((user) => user.id === userId) || null;
    },
    [users]
  );

  const resolveUserName = useCallback(
    (userId: number | null | undefined): string => {
      const user = resolveUserById(userId);
      return user?.name || (userId ? `User ${userId}` : "Not specified");
    },
    [resolveUserById]
  );

  const resolveDocumentActionName = useCallback(
    (actionId: number | null | undefined): string => {
      if (!actionId || actionId <= 0) {
        return "Not specified";
      }
      const action = documentActions.find((a) => a.id === actionId);
      return (
        action?.name ||
        action?.label ||
        action?.button_text ||
        `Action ${actionId}`
      );
    },
    [documentActions]
  );

  const { openModal, closeModal } = useModal();

  const handlePostProcessingModalSubmit = useCallback(
    (
      response: object | string,
      mode: "store" | "update" | "destroy" | "generate"
    ) => {
      const payload = response as {
        activity: ProcessActivitiesProps;
        index: number | null;
      };

      if (!payload?.activity) {
        return;
      }

      setPostProcessingActivities((prev) => {
        const next = [...prev];

        if (mode === "update" && payload.index !== null) {
          next[payload.index] = payload.activity;
        } else {
          next.push(payload.activity);
        }

        return next;
      });

      toast.success(
        mode === "update"
          ? "Activity updated successfully"
          : "Activity added successfully"
      );
      closeModal();
    },
    [closeModal]
  );

  const handleOpenPostProcessingForm = useCallback(
    (activity?: ProcessActivitiesProps | null, index: number | null = null) => {
      openModal(PostProcessingActivityModal, "post-processing-config", {
        title:
          index !== null
            ? "Edit Post Processing Activity"
            : "Add Post Processing Activity",
        isUpdating: index !== null,
        onSubmit: handlePostProcessingModalSubmit,
        dependencies: [
          [
            {
              activity: activity || null,
              editingIndex: index,
              workflowStages,
              documentActions,
              workflows,
              workflowOptions,
              options: {
                workflowStageOptions,
                groupOptions,
                departmentOptions,
                userOptions,
                workflowOptions,
              },
            },
          ],
        ],
      });
    },
    [
      openModal,
      handlePostProcessingModalSubmit,
      workflowStages,
      documentActions,
      workflows,
      workflowOptions,
      workflowStageOptions,
      groupOptions,
      departmentOptions,
      userOptions,
    ]
  );

  // Handle channel action selection
  const handleChannelActionChange = useCallback(
    (
      channel: "from" | "through" | "to",
      actionId: number,
      checked: boolean
    ) => {
      setPolicy((prev) => {
        // Ensure allowedActions exists
        const currentAllowedActions = prev.allowedActions || {
          from: [],
          through: [],
          to: [],
        };
        const currentActions = currentAllowedActions[channel] || [];

        if (checked) {
          return {
            ...prev,
            allowedActions: {
              ...currentAllowedActions,
              [channel]: Array.from(new Set([...currentActions, actionId])),
            },
          };
        } else {
          return {
            ...prev,
            allowedActions: {
              ...currentAllowedActions,
              [channel]: currentActions.filter((id) => id !== actionId),
            },
          };
        }
      });
    },
    []
  );

  // console.log(generateConfigState());

  // Filtered recipients search logic
  const filteredRecipients = useMemo(() => {
    if (!recipientSearchQuery.trim()) return [];

    const query = recipientSearchQuery.toLowerCase();
    const results: RecipientProps[] = [];

    // Search users
    users.forEach((user) => {
      if (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      ) {
        results.push({
          id: user.id,
          type: "user",
          name: user.name || `User ${user.id}`,
          email: user.email,
        });
      }
    });

    // Search groups
    groups.forEach((group) => {
      if (
        group.name?.toLowerCase().includes(query) ||
        group.label?.toLowerCase().includes(query) ||
        group.scope?.toLowerCase().includes(query)
      ) {
        results.push({
          id: group.id,
          type: "group",
          name: group.name || `Group ${group.id}`,
          description: `${group.label} (${group.scope})`,
        });
      }
    });

    return results.slice(0, 10);
  }, [recipientSearchQuery, users, groups]);

  // Select and remove recipient functions
  const selectRecipient = useCallback(
    (recipient: RecipientProps) => {
      const isAlreadySelected = selectedRecipients.some(
        (r) => r.id === recipient.id && r.type === recipient.type
      );

      if (!isAlreadySelected) {
        const updatedRecipients = [...selectedRecipients, recipient];
        setSelectedRecipients(updatedRecipients);

        // Convert to DataOptionsProps format for saving
        const updatedDataOptions: DataOptionsProps[] = updatedRecipients.map(
          (r) => ({
            value: r.id,
            label: r.name,
            type: r.type, // Store type in the data
          })
        );
        setSelectedUsers(updatedDataOptions);
      }

      setRecipientSearchQuery("");
      setSelectedSuggestionIndex(-1);
    },
    [selectedRecipients]
  );

  const removeRecipient = useCallback(
    (recipient: RecipientProps) => {
      const updatedRecipients = selectedRecipients.filter(
        (r) => !(r.id === recipient.id && r.type === recipient.type)
      );
      setSelectedRecipients(updatedRecipients);

      // Update selectedUsers to match
      const updatedDataOptions: DataOptionsProps[] = updatedRecipients.map(
        (r) => ({
          value: r.id,
          label: r.name,
          type: r.type,
        })
      );
      setSelectedUsers(updatedDataOptions);
    },
    [selectedRecipients]
  );

  const handleUpdateConfiguration = useCallback(() => {
    // Combine channel actions with selectedActions
    const allActionIds = new Set<number>();

    // Add channel actions from policy.allowedActions
    if (policy.allowedActions) {
      policy.allowedActions.from.forEach((id) => allActionIds.add(id));
      policy.allowedActions.through.forEach((id) => allActionIds.add(id));
      policy.allowedActions.to.forEach((id) => allActionIds.add(id));
    }

    // Add existing selectedActions
    selectedActions.forEach((action) => allActionIds.add(action.value));

    // Convert all action IDs to SelectedActionsProps[]
    const convertedActions: SelectedActionsProps[] = Array.from(
      allActionIds
    ).map((actionId) => {
      // Find the full action data from documentActions
      const fullAction = documentActions.find((da) => da.id === actionId);
      return {
        identifier:
          fullAction?.name || fullAction?.label || `Action ${actionId}`,
        action: fullAction || ({} as DocumentActionResponseData),
      };
    });

    const configuration = {
      ...state,
      meta_data: {
        policy,
        recipients: selectedUsers,
        actions: convertedActions,
        activities: postProcessingActivities,
        comments: state.meta_data?.comments || [],
        settings: state.meta_data?.settings || {
          priority: "medium",
          accessLevel: "private",
          access_token: "",
          lock: false,
          confidentiality: "general",
        },
      } as DocumentMetaDataProps,
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
  }, [
    policy,
    selectedUsers,
    selectedActions,
    postProcessingActivities,
    documentActions,
    state,
    repo,
    navigate,
  ]);

  const handleActionChange = useCallback(
    (action: DataOptionsProps, checked: boolean) => {
      setSelectedActions((prev) => {
        if (checked) {
          return [...prev, action];
        }
        return prev.filter((a) => a.label !== action.label);
      });
    },
    []
  );

  const handleDeleteActivity = useCallback((index: number) => {
    Alert.flash(
      "Remove Activity",
      "warning",
      "Are you sure you want to remove this post-processing activity?"
    ).then((result) => {
      if (result.isConfirmed) {
        setPostProcessingActivities((prev) =>
          prev.filter((_, idx) => idx !== index)
        );
        toast.info("Activity removed");
      }
    });
  }, []);

  const handlePolicyFieldChange = useCallback(
    (field: keyof DocumentPolicy) =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = Array.isArray(newValue)
          ? (newValue as DataOptionsProps[])[0] || null
          : (newValue as DataOptionsProps) || null;

        // For fields that store IDs as numbers, extract the value
        const idFields: (keyof DocumentPolicy)[] = [
          "department_id",
          "initiator_group_id",
          "approval_group_id",
          "destination_department_id",
          "through_group_id",
          "initiator_workflow_stage_id",
          "approval_workflow_stage_id",
          "through_workflow_stage_id",
          "initiator_user_id",
          "through_user_id",
          "to_user_id",
        ];

        if (idFields.includes(field)) {
          setPolicy((prev) => ({
            ...prev,
            [field]: updatedValue?.value || null,
          }));
        } else {
          setPolicy((prev) => ({
            ...prev,
            [field]: updatedValue,
          }));
        }
      },
    []
  );

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

  // Calculate dropdown position
  useEffect(() => {
    if (recipientSearchQuery.trim()) {
      const searchInput = document.querySelector(
        'input[name="recipient-search"]'
      ) as HTMLInputElement;
      if (searchInput) {
        const rect = searchInput.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 6,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    } else {
      setDropdownPosition(null);
    }
  }, [recipientSearchQuery]);

  useEffect(() => {
    if (state.meta_data) {
      const existingPolicy = (state.meta_data.policy as DocumentPolicy) || {};
      const defaultPolicy: DocumentPolicy = {
        strict: false,
        scope: "public",
        can_override: false,
        clearance_level: null,
        fallback_approver: null,
        for_signed: false,
        days: 0,
        frequency: "days",
        allowedActions: {
          from: [],
          through: [],
          to: [],
        },
        department_id: null,
        initiator_group_id: null,
        approval_group_id: null,
        destination_department_id: null,
        mustPassThrough: false,
        through_group_id: null,
        initiator_workflow_stage_id: null,
        approval_workflow_stage_id: null,
        through_workflow_stage_id: null,
        initiator_should_sign: true,
        through_should_sign: true,
        initiator_user_id: null,
        through_user_id: null,
        to_user_id: null,
      };

      const mergedAllowedActions = {
        from: existingPolicy.allowedActions?.from || [],
        through: existingPolicy.allowedActions?.through || [],
        to: existingPolicy.allowedActions?.to || [],
      };
      setPolicy({
        ...defaultPolicy,
        ...existingPolicy,
        // Ensure allowedActions has the correct structure
        allowedActions: mergedAllowedActions,
      });
      if (state.meta_data.actions) {
        // Convert SelectedActionsProps[] to DataOptionsProps[]

        // I think i understand it now.
        const convertedActions: DataOptionsProps[] =
          state.meta_data.actions.map((action) => ({
            value: action.action.id,
            label:
              action.identifier ||
              action.action.name ||
              action.action.label ||
              "",
          }));
        setSelectedActions(convertedActions);

        // TODO: Load channel-based actions if stored separately
        // For now, we'll derive them from the workflow stages
      }
      if (state.meta_data.recipients) {
        setSelectedUsers(state.meta_data.recipients);
        // Convert DataOptionsProps[] to RecipientProps[]
        const convertedRecipients: RecipientProps[] =
          state.meta_data.recipients.map((r) => {
            const type = (r as any).type || "user"; // Default to user if type not found
            if (type === "group") {
              const group = groups.find((g) => g.id === r.value);
              return {
                id: r.value,
                type: "group",
                name: r.label,
                description: group
                  ? `${group.label} (${group.scope})`
                  : undefined,
              };
            } else {
              const user = users.find((u) => u.id === r.value);
              return {
                id: r.value,
                type: "user",
                name: r.label,
                email: user?.email,
              };
            }
          });
        setSelectedRecipients(convertedRecipients);
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
    users,
    groups,
  ]);

  return (
    <>
      <div className="configuration__header__section mb-4">
        <h3>Document Category Configuration</h3>
      </div>

      <div className="configuration__body__section">
        <div className="configuration__body__item">
          <div className="configuration__body__section__header">
            <h5>
              <i className="ri-shield-check-line"></i>
              Policy Configuration
            </h5>
          </div>

          <div className="configuration__body__item__content">
            {/* Basic Policy Settings */}
            <div className="policy__form__row">
              <div className="policy__form__field">
                <label htmlFor="policy-strict">Strict Policy</label>
                <div className="policy__checkbox__group">
                  <input
                    type="checkbox"
                    id="policy-strict"
                    checked={policy.strict}
                    onChange={(e) =>
                      setPolicy((prev) => ({
                        ...prev,
                        strict: e.target.checked,
                      }))
                    }
                  />
                  <label
                    htmlFor="policy-strict"
                    className="policy__checkbox__label"
                  >
                    <span className="policy__checkbox__text">
                      Enforce strict policy rules
                    </span>
                    <small className="policy__checkbox__description">
                      When enabled, all policy rules must be strictly followed
                      without exceptions
                    </small>
                  </label>
                </div>
              </div>
            </div>

            <div className="policy__form__row">
              <div className="policy__form__field">
                <label htmlFor="policy-scope">Document Scope</label>
                <Select
                  label=""
                  value={policy.scope}
                  onChange={(e) =>
                    setPolicy((prev) => ({
                      ...prev,
                      scope: e.target.value as DocumentPolicy["scope"],
                    }))
                  }
                  defaultValue=""
                  defaultText="Select scope"
                  name="scope"
                  valueKey="value"
                  labelKey="label"
                  options={[
                    { value: "public", label: "Public" },
                    { value: "private", label: "Private" },
                    { value: "confidential", label: "Confidential" },
                    { value: "restricted", label: "Restricted" },
                  ]}
                />
                <small>
                  Determines the visibility and access level of documents in
                  this category
                </small>
              </div>

              <div className="policy__form__field">
                <label htmlFor="policy-can-override">Allow Override</label>
                <div className="policy__checkbox__group">
                  <input
                    type="checkbox"
                    id="policy-can-override"
                    checked={policy.can_override}
                    onChange={(e) =>
                      setPolicy((prev) => ({
                        ...prev,
                        can_override: e.target.checked,
                      }))
                    }
                  />
                  <label
                    htmlFor="policy-can-override"
                    className="policy__checkbox__label"
                  >
                    <span className="policy__checkbox__text">
                      Allow policy override
                    </span>
                    <small className="policy__checkbox__description">
                      Enable administrators to override policy rules when
                      necessary
                    </small>
                  </label>
                </div>
              </div>
            </div>

            <div className="policy__form__row">
              <div className="policy__form__field">
                <label htmlFor="policy-clearance-level">Clearance Level</label>
                {renderMultiSelect(
                  "",
                  formatOptions(groups, "id", "name", true),
                  policy.clearance_level,
                  handlePolicyFieldChange("clearance_level"),
                  "Select clearance level",
                  false,
                  12,
                  false
                )}
              </div>

              <div className="policy__form__field">
                <label htmlFor="policy-fallback-approver">
                  Fallback Approver
                </label>
                {renderMultiSelect(
                  "",
                  formatOptions(groups, "id", "name", true),
                  policy.fallback_approver,
                  handlePolicyFieldChange("fallback_approver"),
                  "Select fallback approver",
                  false,
                  12,
                  false
                )}
              </div>
            </div>

            <div className="policy__form__row">
              <div className="policy__form__field">
                <label htmlFor="policy-for-signed">For Signed Documents</label>
                <div className="policy__checkbox__group">
                  <input
                    type="checkbox"
                    id="policy-for-signed"
                    checked={policy.for_signed}
                    onChange={(e) =>
                      setPolicy((prev) => ({
                        ...prev,
                        for_signed: e.target.checked,
                      }))
                    }
                  />
                  <label
                    htmlFor="policy-for-signed"
                    className="policy__checkbox__label"
                  >
                    <span className="policy__checkbox__text">
                      Apply policy to signed documents only
                    </span>
                    <small className="policy__checkbox__description">
                      Policy rules will only apply to documents that have been
                      signed
                    </small>
                  </label>
                </div>
              </div>
            </div>

            <div className="policy__form__row">
              <div className="policy__form__field">
                <label htmlFor="policy-days">Retention Period (Days)</label>
                <TextInput
                  type="number"
                  value={policy.days}
                  onChange={(e) =>
                    setPolicy((prev) => ({
                      ...prev,
                      days: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="Enter number of days"
                  name="days"
                  min={0}
                />
                <small>
                  Number of days documents in this category should be retained
                </small>
              </div>

              <div className="policy__form__field">
                <label htmlFor="policy-frequency">Retention Frequency</label>
                <Select
                  label=""
                  value={policy.frequency}
                  onChange={(e) =>
                    setPolicy((prev) => ({
                      ...prev,
                      frequency: e.target.value as DocumentPolicy["frequency"],
                    }))
                  }
                  defaultValue=""
                  defaultText="Select frequency"
                  name="frequency"
                  valueKey="value"
                  labelKey="label"
                  options={[
                    { value: "days", label: "Days" },
                    { value: "weeks", label: "Weeks" },
                    { value: "months", label: "Months" },
                    { value: "years", label: "Years" },
                  ]}
                />
                <small>Time unit for the retention period</small>
              </div>
            </div>
          </div>
        </div>

        <div className="configuration__body__item">
          <div className="configuration__body__section__header">
            <h5>
              <i className="ri-user-settings-line"></i>
              Signatories Configuration
            </h5>
          </div>

          <div className="configuration__body__item__content">
            {/* Department Configuration */}
            <div className="policy__form__row">
              <div className="policy__form__field">
                <label htmlFor="policy-department">Department</label>
                {renderMultiSelect(
                  "",
                  formatOptions(
                    departments,
                    "id",
                    "name",
                    true,
                    false,
                    "Originating Department"
                  ),
                  policy.department_id
                    ? formatOptions(
                        departments,
                        "id",
                        "name",
                        true,
                        false,
                        "Originating Department"
                      ).find((d) => d.value === policy.department_id) || null
                    : { value: 0, label: "Originating Department" },
                  handlePolicyFieldChange("department_id"),
                  "Select department",
                  false,
                  12,
                  false
                )}
              </div>

              <div className="policy__form__field">
                <label htmlFor="policy-destination-department">
                  Destination Department
                </label>
                {renderMultiSelect(
                  "",
                  formatOptions(
                    departments,
                    "id",
                    "name",
                    true,
                    false,
                    "Approving Department"
                  ),
                  policy.destination_department_id
                    ? formatOptions(
                        departments,
                        "id",
                        "name",
                        true,
                        false,
                        "Approving Department"
                      ).find(
                        (d) => d.value === policy.destination_department_id
                      ) || null
                    : { value: 0, label: "Approving Department" },
                  handlePolicyFieldChange("destination_department_id"),
                  "Select destination department",
                  false,
                  12,
                  false
                )}
              </div>
            </div>

            {/* Group Configuration */}
            <div className="policy__form__row">
              <div className="policy__form__field">
                <label htmlFor="policy-initiator-group">Initiator Group</label>
                {renderMultiSelect(
                  "",
                  formatOptions(groups, "id", "name"),
                  policy.initiator_group_id
                    ? formatOptions(groups, "id", "name").find(
                        (g) => g.value === policy.initiator_group_id
                      ) || null
                    : null,
                  handlePolicyFieldChange("initiator_group_id"),
                  "Select initiator group",
                  false,
                  12,
                  false
                )}
              </div>

              <div className="policy__form__field">
                <label htmlFor="policy-approval-group">Approval Group</label>
                {renderMultiSelect(
                  "",
                  formatOptions(groups, "id", "name"),
                  policy.approval_group_id
                    ? formatOptions(groups, "id", "name").find(
                        (g) => g.value === policy.approval_group_id
                      ) || null
                    : null,
                  handlePolicyFieldChange("approval_group_id"),
                  "Select approval group",
                  false,
                  12,
                  false
                )}
              </div>
            </div>

            {/* Through Group Configuration */}
            <div className="policy__form__row">
              <div className="policy__form__field">
                <label htmlFor="policy-must-pass-through">
                  Must Pass Through
                </label>
                <div className="policy__checkbox__group">
                  <input
                    type="checkbox"
                    id="policy-must-pass-through"
                    checked={policy.mustPassThrough || false}
                    onChange={(e) =>
                      setPolicy((prev) => ({
                        ...prev,
                        mustPassThrough: e.target.checked,
                      }))
                    }
                  />
                  <label
                    htmlFor="policy-must-pass-through"
                    className="policy__checkbox__label"
                  >
                    <span className="policy__checkbox__text">
                      Enforce through resolution
                    </span>
                    <small className="policy__checkbox__description">
                      When enabled, documents must pass through even if
                      initiator and approver are in the same department
                    </small>
                  </label>
                </div>
              </div>
            </div>

            {policy.mustPassThrough && (
              <div className="policy__form__row">
                <div className="policy__form__field">
                  <label htmlFor="policy-through-group">Through Group</label>
                  {renderMultiSelect(
                    "",
                    formatOptions(groups, "id", "name"),
                    policy.through_group_id
                      ? formatOptions(groups, "id", "name").find(
                          (g) => g.value === policy.through_group_id
                        ) || null
                      : null,
                    handlePolicyFieldChange("through_group_id"),
                    "Select through group",
                    false,
                    12,
                    false
                  )}
                </div>
              </div>
            )}

            {/* Workflow Stage Configuration */}
            <div className="policy__form__row">
              <div className="policy__form__field">
                <label htmlFor="policy-initiator-workflow-stage">
                  Initiator Workflow Stage
                </label>
                {renderMultiSelect(
                  "",
                  formatOptions(workflowStages, "id", "name"),
                  policy.initiator_workflow_stage_id
                    ? formatOptions(workflowStages, "id", "name").find(
                        (ws) => ws.value === policy.initiator_workflow_stage_id
                      ) || null
                    : null,
                  handlePolicyFieldChange("initiator_workflow_stage_id"),
                  "Select initiator workflow stage",
                  false,
                  12,
                  false
                )}
              </div>

              <div className="policy__form__field">
                <label htmlFor="policy-approval-workflow-stage">
                  Approval Workflow Stage
                </label>
                {renderMultiSelect(
                  "",
                  formatOptions(workflowStages, "id", "name"),
                  policy.approval_workflow_stage_id
                    ? formatOptions(workflowStages, "id", "name").find(
                        (ws) => ws.value === policy.approval_workflow_stage_id
                      ) || null
                    : null,
                  handlePolicyFieldChange("approval_workflow_stage_id"),
                  "Select approval workflow stage",
                  false,
                  12,
                  false
                )}
              </div>
            </div>

            {policy.mustPassThrough && (
              <div className="policy__form__row">
                <div className="policy__form__field">
                  <label htmlFor="policy-through-workflow-stage">
                    Through Workflow Stage
                  </label>
                  {renderMultiSelect(
                    "",
                    formatOptions(workflowStages, "id", "name"),
                    policy.through_workflow_stage_id
                      ? formatOptions(workflowStages, "id", "name").find(
                          (ws) => ws.value === policy.through_workflow_stage_id
                        ) || null
                      : null,
                    handlePolicyFieldChange("through_workflow_stage_id"),
                    "Select through workflow stage",
                    false,
                    12,
                    false
                  )}
                </div>
              </div>
            )}

            {/* Signing Control */}
            <div className="policy__form__row">
              <div className="policy__form__field">
                <label htmlFor="policy-initiator-should-sign">
                  Initiator Should Sign
                </label>
                <div className="policy__checkbox__group">
                  <input
                    type="checkbox"
                    id="policy-initiator-should-sign"
                    checked={policy.initiator_should_sign !== false}
                    onChange={(e) =>
                      setPolicy((prev) => ({
                        ...prev,
                        initiator_should_sign: e.target.checked,
                      }))
                    }
                  />
                  <label
                    htmlFor="policy-initiator-should-sign"
                    className="policy__checkbox__label"
                  >
                    <span className="policy__checkbox__text">
                      Require initiator signature
                    </span>
                    <small className="policy__checkbox__description">
                      When enabled, the initiator must sign documents in this
                      category
                    </small>
                  </label>
                </div>
              </div>

              <div className="policy__form__field">
                <label htmlFor="policy-through-should-sign">
                  Through Should Sign
                </label>
                <div className="policy__checkbox__group">
                  <input
                    type="checkbox"
                    id="policy-through-should-sign"
                    checked={policy.through_should_sign !== false}
                    onChange={(e) =>
                      setPolicy((prev) => ({
                        ...prev,
                        through_should_sign: e.target.checked,
                      }))
                    }
                  />
                  <label
                    htmlFor="policy-through-should-sign"
                    className="policy__checkbox__label"
                  >
                    <span className="policy__checkbox__text">
                      Require through signature
                    </span>
                    <small className="policy__checkbox__description">
                      When enabled, the through user must sign documents in this
                      category
                    </small>
                  </label>
                </div>
              </div>
            </div>

            {/* Fixed User IDs (Override Resolution) */}
            <div className="policy__form__row">
              <div className="policy__form__field" style={{ flex: 1 }}>
                <label htmlFor="policy-initiator-user">
                  Initiator User (Fixed)
                </label>
                {renderMultiSelect(
                  "",
                  formatOptions(users, "id", "name", true, false, "Initiator"),
                  policy.initiator_user_id
                    ? formatOptions(users, "id", "name").find(
                        (u) => u.value === policy.initiator_user_id
                      ) || null
                    : { value: 0, label: "Initiator" },
                  handlePolicyFieldChange("initiator_user_id"),
                  "Select fixed initiator user",
                  false,
                  12,
                  false
                )}
              </div>

              <div className="policy__form__field" style={{ flex: 1 }}>
                <label htmlFor="policy-through-user">
                  Through User (Fixed)
                </label>
                {renderMultiSelect(
                  "",
                  formatOptions(users, "id", "name", true, false, "Authoriser"),
                  policy.through_user_id
                    ? formatOptions(
                        users,
                        "id",
                        "name",
                        true,
                        false,
                        "Authoriser"
                      ).find((u) => u.value === policy.through_user_id) || null
                    : { value: 0, label: "Authoriser" },
                  handlePolicyFieldChange("through_user_id"),
                  "Select fixed through user",
                  false,
                  12,
                  false
                )}
              </div>

              <div className="policy__form__field" style={{ flex: 1 }}>
                <label htmlFor="policy-to-user">Approver User (Fixed)</label>
                {renderMultiSelect(
                  "",
                  formatOptions(users, "id", "name", true, false, "Approver"),
                  policy.to_user_id
                    ? formatOptions(
                        users,
                        "id",
                        "name",
                        true,
                        false,
                        "Approver"
                      ).find((u) => u.value === policy.to_user_id) || null
                    : { value: 0, label: "Approver" },
                  handlePolicyFieldChange("to_user_id"),
                  "Select fixed approver user",
                  false,
                  12,
                  false
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="configuration__body__item">
          <div className="configuration__body__section__header">
            <h5>
              <i className="ri-notification-line"></i>
              Notifications Configuration
            </h5>
          </div>

          <div className="configuration__body__item__content">
            <div className="watchers__container">
              {/* Search Input */}
              <div className="watchers__search__section">
                <TextInput
                  label="Search Users & Groups"
                  name="recipient-search"
                  type="text"
                  value={recipientSearchQuery}
                  onChange={(e) => setRecipientSearchQuery(e.target.value)}
                  placeholder="Type to search users and groups..."
                  size="xl"
                  width={100}
                />
              </div>

              {/* Selected Recipients */}
              {selectedRecipients &&
                Array.isArray(selectedRecipients) &&
                selectedRecipients.length > 0 && (
                  <div className="watchers__selected__section">
                    <h4 className="watchers__selected__title">
                      Selected Recipients
                    </h4>
                    <div className="watchers__selected__list">
                      {selectedRecipients.map((recipient) => (
                        <div
                          key={`${recipient.type}-${recipient.id}`}
                          className="watcher__card"
                        >
                          <div className="watcher__card__avatar">
                            <i
                              className={`ri-${
                                recipient.type === "user"
                                  ? "user-line"
                                  : "group-line"
                              }`}
                            ></i>
                          </div>
                          <div className="watcher__card__info">
                            <div className="watcher__card__name">
                              {recipient.name}
                            </div>
                            <div className="watcher__card__type">
                              {recipient.type === "user" ? "Staff" : "Group"}
                            </div>
                            {recipient.type === "user" && recipient.email && (
                              <div className="watcher__card__email">
                                {recipient.email}
                              </div>
                            )}
                            {recipient.type === "group" &&
                              recipient.description && (
                                <div className="watcher__card__description">
                                  {recipient.description}
                                </div>
                              )}
                          </div>
                          <button
                            className="watcher__card__remove"
                            onClick={() => removeRecipient(recipient)}
                            title="Remove recipient"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="configuration__body__item">
          <div className="configuration__body__section__header">
            <h5>
              <i className="ri-settings-3-line"></i>
              Actions Configuration
            </h5>
          </div>

          <div className="configuration__body__item__content">
            {/* Initiator Channel */}
            {policy.initiator_group_id &&
              policy.initiator_group_id > 0 &&
              policy.initiator_workflow_stage_id &&
              policy.initiator_workflow_stage_id > 0 && (
                <div className="policy__form__row">
                  <div
                    className="policy__form__field"
                    style={{ width: "100%" }}
                  >
                    <div className="actions__channel__header">
                      <h6>
                        <i className="ri-user-line"></i>
                        Initiator Channel
                      </h6>
                    </div>
                    <div className="actions__channel__info">
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">
                          Department:
                        </span>
                        <span className="actions__channel__value">
                          {resolveDepartmentName(policy.department_id)}
                        </span>
                      </div>
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">Group:</span>
                        <span className="actions__channel__value">
                          {resolveGroupName(policy.initiator_group_id) || "N/A"}
                        </span>
                      </div>
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">Desk:</span>
                        <span className="actions__channel__value">
                          {resolveWorkflowStage(
                            policy.initiator_workflow_stage_id
                          ).name || "N/A"}
                        </span>
                      </div>
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">
                          Signing Required:
                        </span>
                        <span className="actions__channel__value">
                          {policy.initiator_should_sign === false
                            ? "No"
                            : "Yes"}
                        </span>
                      </div>
                    </div>
                    <div className="actions__channel__actions">
                      <label className="actions__channel__actions__label">
                        Available Actions:
                      </label>
                      <div className="actions__channel__actions__list">
                        {resolveWorkflowStage(
                          policy.initiator_workflow_stage_id
                        ).actions.length > 0 ? (
                          resolveWorkflowStage(
                            policy.initiator_workflow_stage_id
                          ).actions.map((action) => (
                            <div
                              key={`initiator-action-${action.id}`}
                              className="policy__checkbox__group"
                            >
                              <input
                                type="checkbox"
                                id={`initiator-action-${action.id}`}
                                checked={
                                  policy.allowedActions?.from.includes(
                                    action.id
                                  ) || false
                                }
                                onChange={(e) =>
                                  handleChannelActionChange(
                                    "from",
                                    action.id,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`initiator-action-${action.id}`}
                                className="policy__checkbox__label"
                              >
                                <span className="policy__checkbox__text">
                                  {action.name ||
                                    action.label ||
                                    `Action ${action.id}`}
                                </span>
                                {action.action_status && (
                                  <small className="policy__checkbox__description">
                                    {action.action_status}
                                  </small>
                                )}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="actions__channel__no__actions">
                            No actions available for this workflow stage
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Approval Channel */}
            {policy.approval_group_id &&
              policy.approval_group_id > 0 &&
              policy.approval_workflow_stage_id &&
              policy.approval_workflow_stage_id > 0 && (
                <div className="policy__form__row">
                  <div
                    className="policy__form__field"
                    style={{ width: "100%" }}
                  >
                    <div className="actions__channel__header">
                      <h6>
                        <i className="ri-checkbox-circle-line"></i>
                        Approval Channel
                      </h6>
                    </div>
                    <div className="actions__channel__info">
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">
                          Department:
                        </span>
                        <span className="actions__channel__value">
                          {resolveDepartmentName(
                            policy.destination_department_id
                          )}
                        </span>
                      </div>
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">Group:</span>
                        <span className="actions__channel__value">
                          {resolveGroupName(policy.approval_group_id) || "N/A"}
                        </span>
                      </div>
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">Desk:</span>
                        <span className="actions__channel__value">
                          {resolveWorkflowStage(
                            policy.approval_workflow_stage_id
                          ).name || "N/A"}
                        </span>
                      </div>
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">
                          Signing Required:
                        </span>
                        <span className="actions__channel__value">Yes</span>
                      </div>
                    </div>
                    <div className="actions__channel__actions">
                      <label className="actions__channel__actions__label">
                        Available Actions:
                      </label>
                      <div className="actions__channel__actions__list">
                        {resolveWorkflowStage(policy.approval_workflow_stage_id)
                          .actions.length > 0 ? (
                          resolveWorkflowStage(
                            policy.approval_workflow_stage_id
                          ).actions.map((action) => (
                            <div
                              key={`approval-action-${action.id}`}
                              className="policy__checkbox__group"
                            >
                              <input
                                type="checkbox"
                                id={`approval-action-${action.id}`}
                                checked={
                                  policy.allowedActions?.to.includes(
                                    action.id
                                  ) || false
                                }
                                onChange={(e) =>
                                  handleChannelActionChange(
                                    "to",
                                    action.id,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`approval-action-${action.id}`}
                                className="policy__checkbox__label"
                              >
                                <span className="policy__checkbox__text">
                                  {action.name ||
                                    action.label ||
                                    `Action ${action.id}`}
                                </span>
                                {action.action_status && (
                                  <small className="policy__checkbox__description">
                                    {action.action_status}
                                  </small>
                                )}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="actions__channel__no__actions">
                            No actions available for this workflow stage
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Verification Channel */}
            <div className="policy__form__row">
              <div className="policy__form__field" style={{ width: "100%" }}>
                <div className="actions__channel__header">
                  <h6>
                    <i className="ri-shield-check-line"></i>
                    Verification Channel
                  </h6>
                </div>

                {policy.mustPassThrough && (
                  <div className="actions__channel__alert">
                    <i className="ri-error-warning-line"></i>
                    This document category should go through an authoriser, but
                    this might not always be the case!
                  </div>
                )}

                {(policy.through_group_id ||
                  policy.through_workflow_stage_id ||
                  policy.through_user_id) && (
                  <>
                    <div className="actions__channel__info">
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">
                          Department:
                        </span>
                        <span className="actions__channel__value">
                          {policy.through_user_id
                            ? resolveDepartmentName(
                                resolveUserById(policy.through_user_id)
                                  ?.department_id
                              )
                            : resolveDepartmentName(policy.department_id)}
                        </span>
                      </div>
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">Group:</span>
                        <span className="actions__channel__value">
                          {resolveGroupName(policy.through_group_id) || "N/A"}
                        </span>
                      </div>
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">Desk:</span>
                        <span className="actions__channel__value">
                          {resolveWorkflowStage(
                            policy.through_workflow_stage_id
                          ).name || "N/A"}
                        </span>
                      </div>
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">
                          Signing Required:
                        </span>
                        <span className="actions__channel__value">
                          {policy.through_should_sign === false ? "No" : "Yes"}
                        </span>
                      </div>
                      <div className="actions__channel__info__item">
                        <span className="actions__channel__label">User:</span>
                        <span className="actions__channel__value">
                          {resolveUserName(policy.through_user_id)}
                        </span>
                      </div>
                    </div>
                    <div className="actions__channel__actions">
                      <label className="actions__channel__actions__label">
                        Available Actions:
                      </label>
                      <div className="actions__channel__actions__list">
                        {resolveWorkflowStage(policy.through_workflow_stage_id)
                          .actions.length > 0 ? (
                          resolveWorkflowStage(
                            policy.through_workflow_stage_id
                          ).actions.map((action) => (
                            <div
                              key={`through-action-${action.id}`}
                              className="policy__checkbox__group"
                            >
                              <input
                                type="checkbox"
                                id={`through-action-${action.id}`}
                                checked={
                                  policy.allowedActions?.through.includes(
                                    action.id
                                  ) || false
                                }
                                onChange={(e) =>
                                  handleChannelActionChange(
                                    "through",
                                    action.id,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`through-action-${action.id}`}
                                className="policy__checkbox__label"
                              >
                                <span className="policy__checkbox__text">
                                  {action.name ||
                                    action.label ||
                                    `Action ${action.id}`}
                                </span>
                                {action.description && (
                                  <small className="policy__checkbox__description">
                                    {action.description}
                                  </small>
                                )}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="actions__channel__no__actions">
                            No actions available for this workflow stage
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {!policy.through_group_id &&
                  !policy.through_workflow_stage_id &&
                  !policy.through_user_id && (
                    <div className="actions__channel__info">
                      <p className="actions__channel__placeholder">
                        Verification channel configuration has not been set up
                        yet.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
        <div className="configuration__body__item">
          <div className="configuration__body__section__header">
            <h5>
              <i className="ri-file-text-line"></i>
              Post Processing Configuration
            </h5>
          </div>
          <div className="configuration__body__item__content">
            <div className="post-processing__toolbar">
              <div className="post-processing__summary">
                <h6>Post Processing Activities</h6>
                <p>
                  Compose the downstream automations and trackers that run after
                  this document completes its approvals.
                </p>
              </div>
              <Button
                label="Add Activity"
                icon="ri-add-line"
                variant="success"
                size="md"
                handleClick={() => handleOpenPostProcessingForm()}
              />
            </div>

            {postProcessingActivities.length > 0 ? (
              <div className="post-processing__cards">
                {postProcessingActivities.map((activity, index) => (
                  <div
                    key={activity.id ?? `post-processing-activity-${index}`}
                    className="post-processing__card"
                  >
                    <div className="post-processing__card__header">
                      <div className="post-processing__card__title">
                        <span
                          className={`post-processing__badge post-processing__badge--${activity.category}`}
                        >
                          {toTitleCase(activity.category.replace(/_/g, " "))}
                        </span>
                        <h6>{activity.title || `Activity ${index + 1}`}</h6>
                      </div>
                      <div className="post-processing__card__actions">
                        <button
                          type="button"
                          className="post-processing__card__action"
                          onClick={() =>
                            handleOpenPostProcessingForm(activity, index)
                          }
                          title="Edit activity"
                        >
                          <i className="ri-pencil-line"></i>
                        </button>
                        <button
                          type="button"
                          className="post-processing__card__action danger"
                          onClick={() => handleDeleteActivity(index)}
                          title="Remove activity"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>

                    <div className="post-processing__card__body">
                      <div className="post-processing__info post-processing__info--full">
                        <span className="post-processing__info__label">
                          Desk
                        </span>
                        <span className="post-processing__info__value">
                          {resolveWorkflowStage(activity.workflow_stage_id)
                            .name || "Not specified"}
                        </span>
                      </div>
                      <div className="post-processing__card__meta">
                        <div className="post-processing__info">
                          <span className="post-processing__info__label">
                            Department
                          </span>
                          <span className="post-processing__info__value">
                            {resolveDepartmentName(activity.department_id)}
                          </span>
                        </div>
                        <div className="post-processing__info">
                          <span className="post-processing__info__label">
                            Group
                          </span>
                          <span className="post-processing__info__value">
                            {resolveGroupName(activity.group_id) ||
                              "Not specified"}
                          </span>
                        </div>
                        <div className="post-processing__info">
                          <span className="post-processing__info__label">
                            Fixed User
                          </span>
                          <span className="post-processing__info__value">
                            {resolveUserName(activity.user_id)}
                          </span>
                        </div>
                      </div>
                      <div className="post-processing__card__status">
                        <div className="post-processing__info">
                          <span className="post-processing__info__label">
                            Action Status
                          </span>
                          <span className="post-processing__info__value">
                            {activity.document_action_status
                              ? toTitleCase(
                                  activity.document_action_status.replace(
                                    /_/g,
                                    " "
                                  )
                                )
                              : "Not specified"}
                          </span>
                        </div>
                        <div className="post-processing__info">
                          <span className="post-processing__info__label">
                            Trigger Action
                          </span>
                          <span className="post-processing__info__value">
                            {resolveDocumentActionName(
                              activity.trigger_action_id
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="post-processing__empty">
                <i className="ri-magic-line"></i>
                <h6>No post-processing activities yet</h6>
                <p>
                  Define trackers, mailers, and notification rules that should
                  fire after this document is approved.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portal Dropdown - Rendered at document body level */}
      {recipientSearchQuery &&
        dropdownPosition &&
        createPortal(
          <div
            className="watchers__suggestions__dropdown--portal"
            style={{
              position: "fixed",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 999999,
            }}
          >
            {filteredRecipients.length > 0 ? (
              <div className="watchers__suggestions__list">
                {filteredRecipients.map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`watcher__suggestion__item ${
                      selectedSuggestionIndex === index ? "selected" : ""
                    }`}
                    onClick={() => selectRecipient(item)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  >
                    <div className="watcher__suggestion__avatar">
                      <i
                        className={`ri-${
                          item.type === "user" ? "user-line" : "group-line"
                        }`}
                      ></i>
                    </div>
                    <div className="watcher__suggestion__info">
                      <div className="watcher__suggestion__name">
                        {item.name}
                      </div>
                      <div className="watcher__suggestion__type">
                        {item.type === "user" ? "Staff" : "Group"}
                      </div>
                      {item.type === "user" && item.email && (
                        <div className="watcher__suggestion__email">
                          {item.email}
                        </div>
                      )}
                      {item.type === "group" && item.description && (
                        <div className="watcher__suggestion__description">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="watchers__no__results">
                <i className="ri-search-line"></i>
                <p>No users or groups found</p>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export default DocumentCategoryConfiguration;
