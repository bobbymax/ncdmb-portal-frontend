import React, { useState, useEffect, useMemo } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { useResourceContext } from "app/Context/ResourceContext";
import {
  ProcessFlowConfigProps,
  ProcessFlowType,
  WorkflowDependencyProps,
} from "../../crud/DocumentWorkflow";
import {
  CategoryProgressTrackerProps,
  DocumentCategoryResponseData,
  DocumentMetaDataProps,
} from "@/app/Repositories/DocumentCategory/data";
import { DataOptionsProps } from "../forms/MultiSelect";
import { useModal } from "app/Context/ModalContext";
import FlowConfigModal from "../../crud/modals/FlowConfigModal";
import Select from "../forms/Select";
import TextInput from "../forms/TextInput";
import Box from "../forms/Box";
import { createPortal } from "react-dom";

interface SettingsGeneratorTabProps {
  category: DocumentCategoryResponseData | null;
}

export type PermissionProps = {
  group: DataOptionsProps | null;
  stage: DataOptionsProps | null;
  action: string;
  access: "r" | "rw" | "rwx";
};

export type WatcherProps = {
  id: number;
  type: "user" | "group";
  name: string;
  email?: string;
  description?: string;
};

export type SettingsProps = {
  priority: "low" | "medium" | "high" | "urgent";
  accessLevel: "public" | "private" | "confidential" | "restricted";
  access_token: string;
  lock: boolean;
  confidentiality: "general" | "sensitive" | "classified";
};

const SettingsGeneratorTab: React.FC<SettingsGeneratorTabProps> = ({
  category,
}) => {
  const { openWorkflow, closeModal } = useModal();
  const { state, actions } = usePaperBoard();
  const { getResourceById, getResource, resources } = useResourceContext();
  const [selectedScope, setSelectedScope] = useState<string>("private");

  // Initialize preferences with default values if they don't exist
  useEffect(() => {
    if (!state.preferences) {
      const defaultPreferences: SettingsProps = {
        priority: "medium",
        accessLevel: "private",
        access_token: "",
        lock: false,
        confidentiality: "general",
      };
      actions.setPreferences(defaultPreferences);
    }
  }, [state.preferences, actions]);

  // Validate and repair preferences structure if needed
  useEffect(() => {
    if (state.preferences) {
      const requiredFields: (keyof SettingsProps)[] = [
        "priority",
        "accessLevel",
        "access_token",
        "lock",
        "confidentiality",
      ];

      const missingFields = requiredFields.filter(
        (field) => state.preferences![field] === undefined
      );

      if (missingFields.length > 0) {
        const repairedPreferences: SettingsProps = {
          priority: state.preferences.priority || "medium",
          accessLevel: state.preferences.accessLevel || "private",
          access_token: state.preferences.access_token || "",
          lock: state.preferences.lock ?? false,
          confidentiality: state.preferences.confidentiality || "general",
        };

        actions.setPreferences(repairedPreferences);
      }
    }
  }, [state.preferences, actions]);

  // Initialize watchers with default values if they don't exist
  useEffect(() => {
    if (!state.watchers) {
      actions.setWatchers([]);
    }
  }, [state.watchers, actions]);

  // Synchronize local selectedWatchers with global state.watchers
  useEffect(() => {
    if (state.watchers) {
      setSelectedWatchers(state.watchers);
    }
  }, [state.watchers]);

  // Validate and repair watchers structure if needed
  useEffect(() => {
    if (state.watchers && !Array.isArray(state.watchers)) {
      // If watchers is not an array, reset it to empty array
      actions.setWatchers([]);
    }
  }, [state.watchers, actions]);

  // Initialize requirements with default values if they don't exist
  useEffect(() => {
    if (!state.requirements) {
      actions.setRequirements([]);
    }
  }, [state.requirements, actions]);

  // Validate and repair requirements structure if needed
  useEffect(() => {
    if (state.requirements && !Array.isArray(state.requirements)) {
      // If requirements is not an array, reset it to empty array
      actions.setRequirements([]);
    }
  }, [state.requirements, actions]);

  // Auto-fill user info for configState.from when in create mode (no existingDocument)
  useEffect(() => {
    if (
      !state.existingDocument && // Only in create mode
      state.configState?.from && // From stage exists
      state.loggedInUser && // Logged in user exists
      (!state.configState.from.user_id ||
        state.configState.from.user_id < 1 ||
        !state.configState.from.department_id ||
        state.configState.from.department_id < 1)
    ) {
      const updatedFrom = { ...state.configState.from };
      let needsUpdate = false;

      // Set user_id if missing or invalid
      if (!updatedFrom.user_id || updatedFrom.user_id < 1) {
        updatedFrom.user_id = state.loggedInUser.id;
        needsUpdate = true;
      }

      // Set department_id if missing or invalid
      if (!updatedFrom.department_id || updatedFrom.department_id < 1) {
        updatedFrom.department_id = state.loggedInUser.department_id;
        needsUpdate = true;
      }

      // Update configState if changes were made
      if (needsUpdate) {
        actions.updateConfigState({
          ...state.configState,
          from: updatedFrom,
        } as ProcessFlowConfigProps);
      }
    }
  }, [
    state.existingDocument,
    state.configState?.from,
    state.loggedInUser,
    actions,
  ]);

  // Sync department changes to configState.to.department_id
  useEffect(() => {
    if (
      state.configState?.to &&
      state.department_owner?.value &&
      state.department_owner.value !== state.configState.to.department_id
    ) {
      actions.updateConfigState({
        ...state.configState,
        to: {
          ...state.configState.to,
          department_id: state.department_owner.value,
        },
      } as ProcessFlowConfigProps);
    }
  }, [state.department_owner?.value, state.configState?.to, actions]);

  // Watcher search state
  const [watcherSearchQuery, setWatcherSearchQuery] = useState<string>("");
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    useState<number>(-1);
  const [selectedWatchers, setSelectedWatchers] = useState<WatcherProps[]>(
    state.watchers || []
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Get policy data from state
  const policy = state.metaData?.policy;

  // Update selected scope when policy changes
  useEffect(() => {
    if (policy?.scope) {
      setSelectedScope(policy.scope);
    }
  }, [policy?.scope]);

  // Handle scope change
  const handleScopeChange = (scope: string) => {
    setSelectedScope(scope);
    actions.updateMetaData({
      ...(state.metaData || {}),
      policy: { ...(state.metaData?.policy || {}), scope },
    } as DocumentMetaDataProps);
  };

  const handleWorkflowConfigChange = (
    type: ProcessFlowType,
    config: CategoryProgressTrackerProps | null,
    mode: "store" | "update"
  ) => {
    actions.updateConfigState({
      ...(state.configState || {}),
      [type]: config || null,
    } as ProcessFlowConfigProps);
    closeModal();
  };

  // Helper function to capitalize first letter
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Helper function to safely update preferences while maintaining structure
  const updatePreferencesSafely = (updates: Partial<SettingsProps>) => {
    const currentPreferences = state.preferences || {
      priority: "medium",
      accessLevel: "private",
      access_token: "",
      lock: false,
      confidentiality: "general",
    };

    const updatedPreferences: SettingsProps = {
      ...currentPreferences,
      ...updates,
    };

    actions.setPreferences(updatedPreferences);
  };

  // Helper function to safely update watchers while maintaining synchronization
  const updateWatchersSafely = (newWatchers: WatcherProps[]) => {
    setSelectedWatchers(newWatchers);
    actions.setWatchers(newWatchers);
  };

  // Helper function to safely update requirements while maintaining structure
  const updateRequirementsSafely = (updatedRequirement: any) => {
    const currentRequirements = state.requirements || [];

    if (!Array.isArray(currentRequirements)) {
      // If current requirements is not an array, start fresh
      actions.setRequirements([updatedRequirement]);
      return;
    }

    const updatedRequirements = currentRequirements.map((req) =>
      req.id === updatedRequirement.id ? updatedRequirement : req
    );

    actions.setRequirements(updatedRequirements);
  };

  // Filtered watchers based on search query
  const filteredWatchers = useMemo(() => {
    if (!watcherSearchQuery.trim()) return [];

    const query = watcherSearchQuery.toLowerCase();
    const results: Array<{
      id: number;
      type: "user" | "group";
      name: string;
      email?: string;
      description?: string;
    }> = [];

    // Search users
    const users = getResource("users") || [];
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
    const groups = getResource("groups") || [];
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

    // Limit results to first 10
    return results.slice(0, 10);
  }, [watcherSearchQuery, getResourceById]);

  // Select a watcher
  const selectWatcher = (watcher: WatcherProps) => {
    // Check if already selected
    const isAlreadySelected = selectedWatchers.some(
      (w) => w.id === watcher.id && w.type === watcher.type
    );

    if (!isAlreadySelected) {
      const updatedWatchers = [...selectedWatchers, watcher];
      updateWatchersSafely(updatedWatchers);
    }

    // Clear search
    setWatcherSearchQuery("");
    setSelectedSuggestionIndex(-1);
  };

  // Remove a watcher
  const removeWatcher = (watcher: WatcherProps) => {
    const updatedWatchers = selectedWatchers.filter(
      (w) => !(w.id === watcher.id && w.type === watcher.type)
    );
    updateWatchersSafely(updatedWatchers);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWatcherSearchQuery(e.target.value);
  };

  // Calculate dropdown position when search query changes
  useEffect(() => {
    if (watcherSearchQuery.trim()) {
      const searchInput = document.querySelector(
        'input[name="watcher-search"]'
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
  }, [watcherSearchQuery]);

  const openFlowConfigModal = (
    type: ProcessFlowType,
    config?: CategoryProgressTrackerProps | null
  ) => {
    openWorkflow(
      FlowConfigModal,
      type,
      {
        type,
        title: `${capitalizeFirst(type)} Stage Configuration`,
        modalState: state.configState?.[type] || null,
        data: config || null,
        isUpdating: !!config,
        handleSubmit: handleWorkflowConfigChange,
        dependencies: resources as WorkflowDependencyProps,
      },
      state.configState?.[type]
    );
  };

  const scopeOptions = [
    {
      value: "public",
      label: "Public",
      description: "Accessible to all users within the system",
    },
    {
      value: "private",
      label: "Private",
      description: "Accessible only to document owners and authorized users",
    },
    {
      value: "confidential",
      label: "Confidential",
      description: "Restricted access with additional security measures",
    },
    {
      value: "restricted",
      label: "Restricted",
      description: "Highly restricted access with clearance requirements",
    },
  ];

  return (
    <div className="settings__generator__tab__container">
      <div className="settings__cards__grid">
        {/* Workflow Card */}
        <div className="settings__card mb-3">
          <div className="settings__card__header">
            <div className="settings__card__icon">
              <i className="ri-flow-chart"></i>
            </div>
            <div>
              <h3 className="settings__card__title">Workflow</h3>
              <p className="settings__card__subtitle">
                Document approval and routing workflow
              </p>
            </div>
          </div>
          <div className="settings__card__content">
            {state.configState ? (
              <div className="workflow__container">
                <div className="workflow__stages">
                  {/* From Stage */}
                  <div className="workflow__stage__card">
                    <div className="workflow__stage__header">
                      <div className="workflow__stage__icon">
                        <i className="ri-arrow-right-line"></i>
                      </div>
                      <div className="workflow__stage__info">
                        <h4 className="workflow__stage__title">(From) Stage</h4>
                        <div className="workflow__stage__details">
                          {state.configState?.from ? (
                            <>
                              <p className="workflow__stage__description">
                                {getResourceById(
                                  "workflowStages",
                                  state.configState?.from?.workflow_stage_id
                                )?.name ||
                                  `Stage ID: ${state.configState.from.workflow_stage_id}`}
                              </p>
                              <div className="workflow__stage__metadata">
                                <span className="watcher__metadata__item">
                                  <i className="ri-group-line"></i>
                                  {getResourceById(
                                    "groups",
                                    state.configState?.from?.group_id
                                  )?.name ||
                                    `Group ID: ${state.configState.from.group_id}`}
                                </span>
                                <span className="watcher__metadata__item">
                                  <i className="ri-building-line"></i>
                                  {getResourceById(
                                    "departments",
                                    state.configState?.from?.department_id
                                  )?.name ||
                                    `Dept ID: ${state.configState.from.department_id}`}
                                </span>
                                <span className="watcher__metadata__item">
                                  <i className="ri-user-line"></i>
                                  {state.configState.from.permission}
                                </span>
                                <span className="watcher__metadata__item">
                                  <i className="ri-file-signature-line"></i>
                                  {state.configState.from.signatory_type}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="workflow__stage__empty">
                              <p className="workflow__stage__empty__text">
                                No stage configured
                              </p>
                              <button
                                onClick={() => openFlowConfigModal("from")}
                                className="workflow__stage__add__btn"
                              >
                                <i className="ri-add-line"></i>
                                Add Stage
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {state.configState?.from && (
                      <div className="workflow__stage__actions">
                        <button
                          onClick={() =>
                            openFlowConfigModal(
                              "from",
                              state.configState?.from || null
                            )
                          }
                          className="workflow__manage__btn mb-2"
                        >
                          <i className="ri-settings-3-line"></i>
                          Manage
                        </button>
                        <button
                          onClick={() =>
                            actions.updateConfigState({
                              ...(state.configState || {}),
                              from: null,
                            } as ProcessFlowConfigProps)
                          }
                          className="workflow__manage__btn"
                        >
                          <i className="ri-delete-bin-line"></i>
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Through Stage */}
                  <div className="workflow__stage__card">
                    <div className="workflow__stage__header">
                      <div className="workflow__stage__icon">
                        <i className="ri-arrow-right-line"></i>
                      </div>
                      <div className="workflow__stage__info">
                        <h4 className="workflow__stage__title">
                          (Through) Stage
                        </h4>
                        <div className="workflow__stage__details">
                          {state.configState?.through ? (
                            <>
                              <p className="workflow__stage__description">
                                {getResourceById(
                                  "workflowStages",
                                  state.configState?.through?.workflow_stage_id
                                )?.name ||
                                  `Stage ID: ${state.configState.through.workflow_stage_id}`}
                              </p>
                              <div className="workflow__stage__metadata">
                                <span className="watcher__metadata__item">
                                  <i className="ri-group-line"></i>
                                  {getResourceById(
                                    "groups",
                                    state.configState?.through?.group_id
                                  )?.name ||
                                    `Group ID: ${state.configState.through.group_id}`}
                                </span>
                                <span className="watcher__metadata__item">
                                  <i className="ri-building-line"></i>
                                  {getResourceById(
                                    "departments",
                                    state.configState?.through?.department_id
                                  )?.name ||
                                    `Dept ID: ${state.configState.through.department_id}`}
                                </span>
                                <span className="watcher__metadata__item">
                                  <i className="ri-user-line"></i>
                                  {state.configState?.through?.permission}
                                </span>
                                <span className="watcher__metadata__item">
                                  <i className="ri-file-signature-line"></i>
                                  {state.configState?.through?.signatory_type}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="workflow__stage__empty">
                              <p className="workflow__stage__empty__text">
                                No stage configured
                              </p>
                              <button
                                onClick={() => openFlowConfigModal("through")}
                                className="workflow__stage__add__btn"
                              >
                                <i className="ri-add-line"></i>
                                Add Stage
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {state.configState?.through && (
                      <div className="workflow__stage__actions">
                        <button
                          onClick={() =>
                            openFlowConfigModal(
                              "through",
                              state.configState?.through || null
                            )
                          }
                          className="workflow__manage__btn mb-2"
                        >
                          <i className="ri-settings-3-line"></i>
                          Manage
                        </button>
                        <button
                          onClick={() =>
                            actions.updateConfigState({
                              ...(state.configState || {}),
                              through: null,
                            } as ProcessFlowConfigProps)
                          }
                          className="workflow__manage__btn"
                        >
                          <i className="ri-delete-bin-line"></i>
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* To Stage */}
                  <div className="workflow__stage__card">
                    <div className="workflow__stage__header">
                      <div className="workflow__stage__icon">
                        <i className="ri-arrow-right-line"></i>
                      </div>
                      <div className="workflow__stage__info">
                        <h4 className="workflow__stage__title">(To) Stage</h4>
                        <div className="workflow__stage__details">
                          {state.configState?.to ? (
                            <>
                              <p className="workflow__stage__description">
                                {getResourceById(
                                  "workflowStages",
                                  state.configState?.to?.workflow_stage_id
                                )?.name ||
                                  `Stage ID: ${state.configState.to.workflow_stage_id}`}
                              </p>
                              <div className="workflow__stage__metadata">
                                <span className="watcher__metadata__item">
                                  <i className="ri-group-line"></i>
                                  {getResourceById(
                                    "groups",
                                    state.configState?.to?.group_id
                                  )?.name ||
                                    `Group ID: ${state.configState.to.group_id}`}
                                </span>
                                <span className="watcher__metadata__item">
                                  <i className="ri-building-line"></i>
                                  {getResourceById(
                                    "departments",
                                    state.configState?.to?.department_id
                                  )?.name ||
                                    `Dept ID: ${state.configState.to.department_id}`}
                                </span>
                                <span className="watcher__metadata__item">
                                  <i className="ri-user-line"></i>
                                  {state.configState.to.permission}
                                </span>
                                <span className="watcher__metadata__item">
                                  <i className="ri-file-signature-line"></i>
                                  {state.configState.to.signatory_type}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="workflow__stage__empty">
                              <p className="workflow__stage__empty__text">
                                No stage configured
                              </p>
                              <button
                                onClick={() => openFlowConfigModal("to")}
                                className="workflow__stage__add__btn"
                              >
                                <i className="ri-add-line"></i>
                                Add Stage
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {state.configState?.to && (
                      <div className="workflow__stage__actions">
                        <button
                          onClick={() =>
                            openFlowConfigModal(
                              "to",
                              state.configState?.to || null
                            )
                          }
                          className="workflow__manage__btn mb-2"
                        >
                          <i className="ri-settings-3-line"></i>
                          Manage
                        </button>
                        <button
                          onClick={() =>
                            actions.updateConfigState({
                              ...(state.configState || {}),
                              to: null,
                            } as ProcessFlowConfigProps)
                          }
                          className="workflow__manage__btn"
                        >
                          <i className="ri-delete-bin-line"></i>
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p>No workflow configuration available</p>
            )}
          </div>
        </div>

        {/* Requirements Card */}
        <div className="settings__card mb-3">
          <div className="settings__card__header">
            <div className="settings__card__icon">
              <i className="ri-file-list-3-line"></i>
            </div>
            <div>
              <h3 className="settings__card__title">Requirements</h3>
              <p className="settings__card__subtitle">
                Document requirements and upload verification
              </p>
            </div>
          </div>
          <div className="settings__card__content">
            <div className="requirements__container">
              {state.requirements &&
              Array.isArray(state.requirements) &&
              state.requirements.length > 0 ? (
                state.requirements?.map((requirement) => (
                  <div className="requirement__item" key={requirement.id}>
                    <div className="requirement__checkbox">
                      <div className="custom__checkbox">
                        <input
                          type="checkbox"
                          id={`requirement-${requirement.id}`}
                          checked={requirement.is_present || false}
                          onChange={(e) => {
                            const updatedRequirement = {
                              ...requirement,
                              is_present: e.target.checked,
                            };
                            updateRequirementsSafely(updatedRequirement);
                          }}
                          className="checkbox__input"
                        />
                        <label
                          htmlFor={`requirement-${requirement.id}`}
                          className="checkbox__label"
                        >
                          <div className="checkbox__checkmark">
                            <i className="ri-check-line"></i>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="requirement__content">
                      <div className="requirement__header">
                        <h4 className="requirement__title">
                          {requirement.name}
                        </h4>
                        {requirement.is_required && (
                          <span className="requirement__required__tag">
                            Required
                          </span>
                        )}
                      </div>
                      {requirement.description && (
                        <p className="requirement__description">
                          {requirement.description}
                        </p>
                      )}
                      <div className="requirement__metadata">
                        <span className="requirement__priority">
                          <i className="ri-flag-line"></i>
                          {requirement.priority}
                        </span>
                        <span className="requirement__status">
                          <i
                            className={`ri-${
                              requirement.is_present
                                ? "check-double-line"
                                : "close-line"
                            }`}
                          ></i>
                          {requirement.is_present ? "Uploaded" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="requirements__empty">
                  <i className="ri-file-list-3-line"></i>
                  <p>No document requirements configured</p>
                  <small>
                    Requirements will appear here when configured for this
                    document category
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Watchers Card */}
        <div className="settings__card mb-3">
          <div className="settings__card__header">
            <div className="settings__card__icon">
              <i className="ri-group-line"></i>
            </div>
            <div>
              <h3 className="settings__card__title">Watchers</h3>
              <p className="settings__card__subtitle">
                Users and groups monitoring this document
              </p>
            </div>
          </div>
          <div className="settings__card__content">
            <div className="watchers__container">
              {/* Search Input */}
              <div className="watchers__search__section">
                <TextInput
                  label="Search Users & Groups"
                  name="watcher-search"
                  type="text"
                  value={watcherSearchQuery}
                  onChange={handleSearchChange}
                  placeholder="Type to search users and groups..."
                  size="xl"
                  width={100}
                />
              </div>

              {/* Selected Watchers */}
              {selectedWatchers &&
                Array.isArray(selectedWatchers) &&
                selectedWatchers.length > 0 && (
                  <div className="watchers__selected__section">
                    <h4 className="watchers__selected__title">
                      Selected Watchers
                    </h4>
                    <div className="watchers__selected__list">
                      {selectedWatchers.map((watcher, index) => (
                        <div
                          key={`${watcher.type}-${watcher.id}`}
                          className="watcher__card"
                        >
                          <div className="watcher__card__avatar">
                            <i
                              className={`ri-${
                                watcher.type === "user"
                                  ? "user-line"
                                  : "group-line"
                              }`}
                            ></i>
                          </div>
                          <div className="watcher__card__info">
                            <div className="watcher__card__name">
                              {watcher.name}
                            </div>
                            <div className="watcher__card__type">
                              {watcher.type === "user" ? "Staff" : "Group"}
                            </div>
                            {watcher.type === "user" && watcher.email && (
                              <div className="watcher__card__email">
                                {watcher.email}
                              </div>
                            )}
                            {watcher.type === "group" &&
                              watcher.description && (
                                <div className="watcher__card__description">
                                  {watcher.description}
                                </div>
                              )}
                          </div>
                          <button
                            className="watcher__card__remove"
                            onClick={() => removeWatcher(watcher)}
                            title="Remove watcher"
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

        {/* Policy Card */}
        <div className="settings__card mb-3">
          <div className="settings__card__header">
            <div className="settings__card__icon">
              <i className="ri-shield-check-line"></i>
            </div>
            <div>
              <h3 className="settings__card__title">Policy</h3>
              <p className="settings__card__subtitle">
                Document access and security policies
              </p>
            </div>
          </div>
          <div className="settings__card__content">
            {policy ? (
              <div className="policy__scope__container">
                <div className="policy__scope__title">Document Scope</div>
                <div className="policy__scope__options">
                  {scopeOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`policy__scope__option ${
                        selectedScope === option.value ? "selected" : ""
                      }`}
                      data-scope={option.value}
                      onClick={() => handleScopeChange(option.value)}
                    >
                      <input
                        type="radio"
                        name="scope"
                        value={option.value}
                        checked={selectedScope === option.value}
                        onChange={() => handleScopeChange(option.value)}
                        className="policy__scope__radio"
                      />
                      <div>
                        <div className="policy__scope__label">
                          {option.label}
                        </div>
                        <div className="policy__scope__description">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No policy configuration available</p>
            )}
          </div>
        </div>

        {/* Settings Card */}
        <div className="settings__card mb-3">
          <div className="settings__card__header">
            <div className="settings__card__icon">
              <i className="ri-settings-3-line"></i>
            </div>
            <div>
              <h3 className="settings__card__title">Preferences</h3>
              <p className="settings__card__subtitle">
                General document settings and preferences
              </p>
            </div>
          </div>
          <div className="settings__card__content">
            <div className="preferences__form">
              {/* Checkbox Options */}
              <div className="preferences__form__section">
                <h4 className="preferences__section__title">
                  Document Settings
                </h4>
                <p className="preferences__section__description mb-4">
                  Configure additional document settings
                </p>
                <div className="preferences__checkboxes">
                  <div className="preferences__checkbox__item">
                    <div className="custom__toggle__switch">
                      <input
                        type="checkbox"
                        id="document-lock"
                        checked={state.preferences?.lock || false}
                        onChange={(e) => {
                          updatePreferencesSafely({
                            lock: e.target.checked,
                          });
                        }}
                        className="toggle__input"
                        disabled={state.metaData?.policy?.scope === "public"}
                      />
                      <label htmlFor="document-lock" className="toggle__label">
                        <div className="toggle__switch">
                          <div className="toggle__slider">
                            <i className="toggle__icon toggle__icon--lock"></i>
                            <i className="toggle__icon toggle__icon--unlock"></i>
                          </div>
                        </div>
                        <span className="toggle__text">Lock Document</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Token */}
              <div className="preferences__form__section">
                <h4 className="preferences__section__title">Access Control</h4>
                <p className="preferences__section__description mb-3">
                  Configure document access and security settings
                </p>
                <TextInput
                  label="Access Token"
                  name="access_token"
                  type="text"
                  value={state.preferences?.access_token || ""}
                  onChange={(e) => {
                    updatePreferencesSafely({
                      access_token: e.target.value,
                    });
                  }}
                  placeholder="Enter access token (optional)"
                  size="xl"
                  width={100}
                />
              </div>

              {/* Priority Selection */}
              <div className="preferences__form__section">
                <h4 className="preferences__section__title">
                  Document Priority
                </h4>
                <p className="preferences__section__description mb-3">
                  Set the priority level for this document
                </p>
                <Select
                  label="Priority Level"
                  name="priority"
                  value={state.preferences?.priority || "medium"}
                  onChange={(e) => {
                    updatePreferencesSafely({
                      priority: e.target.value as
                        | "low"
                        | "medium"
                        | "high"
                        | "urgent",
                    });
                  }}
                  defaultValue=""
                  defaultText="Select Priority"
                  valueKey="value"
                  labelKey="label"
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "urgent", label: "Urgent" },
                  ]}
                  size="xl"
                  width={100}
                  defaultCheckDisabled
                />
              </div>

              {/* Confidentiality Level */}
              <div className="preferences__form__section">
                <h4 className="preferences__section__title">Confidentiality</h4>
                <p className="preferences__section__description mb-3">
                  Set the confidentiality level for this document
                </p>
                <Select
                  label="Confidentiality Level"
                  name="confidentiality"
                  value={state.preferences?.confidentiality || "general"}
                  onChange={(e) => {
                    updatePreferencesSafely({
                      confidentiality: e.target.value as
                        | "general"
                        | "sensitive"
                        | "classified",
                    });
                  }}
                  defaultValue=""
                  defaultText=""
                  valueKey="value"
                  labelKey="label"
                  options={[
                    { value: "general", label: "General" },
                    {
                      value: "sensitive",
                      label: "Sensitive",
                    },
                    {
                      value: "classified",
                      label: "Classified",
                    },
                  ]}
                  size="xl"
                  width={100}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Dropdown - Rendered at document body level */}
      {watcherSearchQuery &&
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
            {filteredWatchers.length > 0 ? (
              <div className="watchers__suggestions__list">
                {filteredWatchers.map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`watcher__suggestion__item ${
                      selectedSuggestionIndex === index ? "selected" : ""
                    }`}
                    onClick={() => selectWatcher(item)}
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
                    <div className="watcher__suggestion__action">
                      <i className="ri-add-line"></i>
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
    </div>
  );
};

export default SettingsGeneratorTab;
