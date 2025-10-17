import { DepartmentResponseData } from "@/app/Repositories/Department/data";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { GroupResponseData } from "@/app/Repositories/Group/data";
import {
  SignatoryResponseData,
  SignatoryType,
} from "@/app/Repositories/Signatory/data";
import { UserResponseData } from "@/app/Repositories/User/data";
import { WorkflowStageResponseData } from "@/app/Repositories/WorkflowStage/data";
import { FormPageComponentProps } from "@/bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import DocumentCategoryRepository from "app/Repositories/DocumentCategory/DocumentCategoryRepository";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import MultiSelect from "../components/forms/MultiSelect";
import Select from "../components/forms/Select";
import Checkbox from "../components/forms/Checkbox";
import Button from "../components/forms/Button";
import { ActionMeta } from "react-select";
import TextInput from "../components/forms/TextInput";
import { ProcessFlowType } from "./DocumentWorkflow";

interface DependencyProps {
  users: UserResponseData[];
  groups: GroupResponseData[];
  departments: DepartmentResponseData[];
  signatories: SignatoryResponseData[];
  workflowStages: WorkflowStageResponseData[];
}

interface SignatoryFormState {
  signatory: SignatoryResponseData;
  selectedOptions: {
    user: DataOptionsProps | null;
    group: DataOptionsProps | null;
    department: DataOptionsProps | null;
    workflowStage: DataOptionsProps | null;
  };
  isExpanded: boolean;
  isEditing: boolean;
}

const generateUniqueId = (): string => {
  return `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const DocumentCategorySignatories: React.FC<
  FormPageComponentProps<DocumentCategoryResponseData>
> = ({ state, loading, dependencies, mode }) => {
  const navigate = useNavigate();
  const documentCategoryRepository = new DocumentCategoryRepository();
  const [users, setUsers] = useState<UserResponseData[]>([]);
  const [groups, setGroups] = useState<GroupResponseData[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponseData[]>([]);
  const [workflowStages, setWorkflowStages] = useState<
    WorkflowStageResponseData[]
  >([]);
  const [signatoryForms, setSignatoryForms] = useState<SignatoryFormState[]>(
    []
  );
  const [submitting, setSubmitting] = useState(false);
  const [signatories, setSignatories] = useState<SignatoryResponseData[]>([]);
  const [isManaging, setIsManaging] = useState(false);

  const flowTypes: { value: ProcessFlowType; label: string }[] = [
    { value: "from", label: "From" },
    { value: "through", label: "Through" },
    { value: "to", label: "To" },
  ];

  const signatoryTypes: { value: SignatoryType; label: string }[] = [
    { value: "owner", label: "Owner" },
    { value: "initiator", label: "Initiator" },
    { value: "witness", label: "Witness" },
    { value: "approval", label: "Approval" },
    { value: "authorised", label: "Authorised" },
    { value: "attestation", label: "Attestation" },
    { value: "auditor", label: "Auditor" },
    { value: "vendor", label: "Vendor" },
    { value: "other", label: "Other" },
  ];

  const handleAddSignatories = async () => {
    // Validation
    if (signatoryForms.length === 0) {
      toast.error("Please add at least one signatory");
      return;
    }

    // Validate each signatory has at least one of user, group, or department
    const invalidSignatories = signatoryForms.filter(
      (form) =>
        !form.signatory.user_id &&
        !form.signatory.group_id &&
        !form.signatory.department_id
    );

    if (invalidSignatories.length > 0) {
      toast.error(
        "Each signatory must have at least one of: User, Group, or Department"
      );
      return;
    }

    const body = {
      document_category_id: state.id,
      mode: isManaging ? "update" : "store",
      signatories: signatoryForms.map((form) => form.signatory),
    };

    setSubmitting(true);
    try {
      const response = await documentCategoryRepository.store(
        "document-category/signatories",
        body
      );
      if (response.code === 200) {
        toast.success(response.message);
        navigate("/specifications/document-categories");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const addNewSignatoryForm = () => {
    const newOrder = signatoryForms.length + 1;
    const newSignatory: SignatoryResponseData = {
      id: 0,
      user_id: 0,
      group_id: 0,
      department_id: 0,
      flow_type: "from",
      type: "owner",
      document_category_id: state.id,
      order: newOrder,
      should_sign: false,
      identifier: generateUniqueId(),
      workflow_stage_id: 0,
    };

    const newForm: SignatoryFormState = {
      signatory: newSignatory,
      selectedOptions: {
        user: null,
        group: null,
        department: null,
        workflowStage: null,
      },
      isExpanded: true,
      isEditing: false,
    };

    setSignatoryForms((prev) => [...prev, newForm]);
  };

  const deleteSignatory = (index: number) => {
    setSignatoryForms((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Reorder
      return updated.map((form, i) => ({
        ...form,
        signatory: { ...form.signatory, order: i + 1 },
      }));
    });
    toast.success("Signatory removed");
  };

  const toggleExpanded = (index: number) => {
    setSignatoryForms((prev) =>
      prev.map((form, i) =>
        i === index ? { ...form, isExpanded: !form.isExpanded } : form
      )
    );
  };

  const handleSignatoryChange = (
    index: number,
    field: keyof SignatoryResponseData,
    value: any
  ) => {
    setSignatoryForms((prev) =>
      prev.map((form, i) =>
        i === index
          ? { ...form, signatory: { ...form.signatory, [field]: value } }
          : form
      )
    );
  };

  const handleMultiSelectChange = useCallback(
    (index: number, key: "user" | "group" | "department" | "workflowStage") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps | null;

        setSignatoryForms((prev) =>
          prev.map((form, i) => {
            if (i === index) {
              // Handle workflow_stage_id mapping differently
              const fieldName =
                key === "workflowStage" ? "workflow_stage_id" : `${key}_id`;

              return {
                ...form,
                selectedOptions: {
                  ...form.selectedOptions,
                  [key]: updatedValue,
                },
                signatory: {
                  ...form.signatory,
                  [fieldName]: updatedValue?.value ?? 0,
                },
              };
            }
            return form;
          })
        );
      },
    []
  );

  useEffect(() => {
    if (dependencies) {
      const {
        users = [],
        groups = [],
        departments = [],
        signatories = [],
        workflowStages = [],
      } = dependencies as DependencyProps;
      setUsers(users);
      setGroups(groups);
      setDepartments(departments);
      setSignatories(signatories);
      setWorkflowStages(workflowStages);
    }
  }, [dependencies]);

  // Load existing signatories when in update mode
  useEffect(() => {
    if (
      mode === "update" &&
      signatories.length > 0 &&
      users.length > 0 &&
      groups.length > 0 &&
      departments.length > 0 &&
      workflowStages.length > 0 &&
      signatoryForms.length === 0
    ) {
      // Filter signatories for this document category only
      const filteredSignatories = signatories.filter(
        (sig) => sig.document_category_id === state.id
      );

      // Convert signatories to SignatoryFormState
      const forms: SignatoryFormState[] = filteredSignatories.map((sig) => {
        const userOption = formatOptions(
          users,
          "id",
          "name",
          true,
          false,
          "Owner"
        ).find((u) => u.value === sig.user_id);
        const groupOption = formatOptions(groups, "id", "name").find(
          (g) => g.value === sig.group_id
        );
        const deptOption = formatOptions(
          departments,
          "id",
          "abv",
          true,
          false,
          "Originating Department"
        ).find((d) => d.value === sig.department_id);
        const workflowStageOption = formatOptions(
          workflowStages,
          "id",
          "name"
        ).find((ws) => ws.value === sig.workflow_stage_id);

        return {
          signatory: sig,
          selectedOptions: {
            user: userOption ?? null,
            group: groupOption ?? null,
            department: deptOption ?? null,
            workflowStage: workflowStageOption ?? null,
          },
          isExpanded: false,
          isEditing: false,
        };
      });

      setSignatoryForms(forms);
    }
  }, [
    mode,
    signatories,
    users,
    groups,
    departments,
    workflowStages,
    signatoryForms.length,
    state.id,
  ]);

  // console.log(signatoryForms);

  const getSignatorySummary = (form: SignatoryFormState): string => {
    const parts: string[] = [];
    if (form.selectedOptions.user) {
      parts.push(`User: ${form.selectedOptions.user.label}`);
    }
    if (form.selectedOptions.group) {
      parts.push(`Group: ${form.selectedOptions.group.label}`);
    }
    if (form.selectedOptions.department) {
      parts.push(`Dept: ${form.selectedOptions.department.label}`);
    }
    return parts.length > 0
      ? parts.join(" | ")
      : "No user/group/department selected";
  };

  // Filter signatories for this document category
  const categorySignatories = signatories.filter(
    (sig) => sig.document_category_id === state.id
  );

  const isViewMode =
    mode === "update" && categorySignatories.length > 0 && !isManaging;

  return (
    <div className="container-fluid mb-5">
      <div className="row">
        <div className="col-12">
          <div className="mb-4">
            <h4 className="mb-2">
              Document Category: <strong>{state.name}</strong>
            </h4>
            <p className="text-muted">
              {isViewMode
                ? "View signatories involved in the document workflow"
                : "Add signatories who will be involved in the document workflow"}
            </p>
          </div>

          {/* View Mode Header with Manage Button */}
          {isViewMode && (
            <div className="mb-4 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Signatories ({signatoryForms.length})</h5>
              </div>
              <Button
                label="Manage Signatories"
                icon="ri-edit-line"
                variant="success"
                handleClick={() => setIsManaging(true)}
                isDisabled={loading}
              />
            </div>
          )}

          {/* Edit Mode: Add New Signatory Button */}
          {!isViewMode && (
            <div className="mb-4">
              <Button
                label="Add Signatory"
                icon="ri-user-add-line"
                variant="success"
                handleClick={addNewSignatoryForm}
                isDisabled={loading || submitting}
              />
            </div>
          )}

          {/* Signatory List - View or Edit Mode */}
          {signatoryForms.length === 0 ? (
            <div className="alert alert-info">
              <i className="ri-information-line me-2"></i>
              No signatories added yet. Click &quot;Add Signatory&quot; to
              begin.
            </div>
          ) : (
            <div className="signatories-list">
              {signatoryForms.map((form, index) => (
                <div
                  key={form.signatory.identifier}
                  className="signatory-card mb-3"
                >
                  {/* Header */}
                  <div
                    className="signatory-card-header"
                    onClick={() => !isViewMode && toggleExpanded(index)}
                    style={{ cursor: isViewMode ? "default" : "pointer" }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center flex-grow-1">
                        <span className="signatory-order me-3">
                          #{form.signatory.order}
                        </span>
                        <div className="flex-grow-1">
                          <h6 className="mb-0">
                            {form.signatory.type.charAt(0).toUpperCase() +
                              form.signatory.type.slice(1)}{" "}
                            ({form.signatory.flow_type})
                          </h6>
                          <small className="text-muted">
                            {getSignatorySummary(form)}
                          </small>
                          {form.signatory.should_sign && (
                            <span className="badge bg-success ms-2">
                              <i className="ri-checkbox-circle-line me-1"></i>
                              Requires Signature
                            </span>
                          )}
                        </div>
                      </div>
                      {!isViewMode && (
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            icon={
                              form.isExpanded
                                ? "ri-arrow-up-s-line"
                                : "ri-arrow-down-s-line"
                            }
                            variant="outline"
                            size="sm"
                            handleClick={() => toggleExpanded(index)}
                          />
                          <Button
                            icon="ri-close-line"
                            variant="danger"
                            size="sm"
                            handleClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this signatory?"
                                )
                              ) {
                                deleteSignatory(index);
                              }
                            }}
                            isDisabled={loading || submitting}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View Mode: Display Details */}
                  {isViewMode && (
                    <div className="signatory-card-body-view">
                      <div className="row">
                        <div className="col-md-3">
                          <div className="signatory-info-item">
                            <label>Flow Type</label>
                            <p>{form.signatory.flow_type.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="signatory-info-item">
                            <label>Type</label>
                            <p>
                              {form.signatory.type.charAt(0).toUpperCase() +
                                form.signatory.type.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="signatory-info-item">
                            <label>Order</label>
                            <p>{form.signatory.order}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="signatory-info-item">
                            <label>Must Sign</label>
                            <p>
                              {form.signatory.should_sign ? (
                                <span className="text-success">
                                  <i className="ri-check-line"></i> Yes
                                </span>
                              ) : (
                                <span className="text-muted">
                                  <i className="ri-close-line"></i> No
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-12 mt-3">
                          <div className="signatory-info-item">
                            <label>Workflow Stage</label>
                            <p>
                              {form.selectedOptions.workflowStage?.label || (
                                <span className="text-muted">Not assigned</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edit Mode: Form Content */}
                  {!isViewMode && form.isExpanded && (
                    <div className="signatory-card-body">
                      <div className="row">
                        {/* User Selection */}
                        <div className="col-md-4 mb-3">
                          <MultiSelect
                            label="User"
                            options={formatOptions(
                              users,
                              "id",
                              "name",
                              true,
                              false,
                              "Owner"
                            )}
                            value={form.selectedOptions.user}
                            onChange={handleMultiSelectChange(index, "user")}
                            placeholder="User"
                            isSearchable
                            isDisabled={loading || submitting}
                          />
                        </div>

                        {/* Group Selection */}
                        <div className="col-md-4 mb-3">
                          <MultiSelect
                            label="Group"
                            options={formatOptions(groups, "id", "name")}
                            value={form.selectedOptions.group}
                            onChange={handleMultiSelectChange(index, "group")}
                            placeholder="Group"
                            isSearchable
                            isDisabled={loading || submitting}
                          />
                        </div>

                        {/* Department Selection */}
                        <div className="col-md-4 mb-3">
                          <MultiSelect
                            label="Department"
                            options={formatOptions(
                              departments,
                              "id",
                              "abv",
                              true,
                              false,
                              "Originating Department"
                            )}
                            value={form.selectedOptions.department}
                            onChange={handleMultiSelectChange(
                              index,
                              "department"
                            )}
                            placeholder="Department"
                            isSearchable
                            isDisabled={loading || submitting}
                          />
                        </div>

                        {/* Flow Type */}
                        <div className="col-md-4 mb-3">
                          <Select
                            label="Flow Type"
                            options={flowTypes}
                            value={form.signatory.flow_type}
                            onChange={(e) =>
                              handleSignatoryChange(
                                index,
                                "flow_type",
                                e.target.value as ProcessFlowType
                              )
                            }
                            valueKey="value"
                            labelKey="label"
                            name={`flow_type_${index}`}
                            defaultValue=""
                            isDisabled={loading || submitting}
                          />
                        </div>

                        {/* Signatory Type */}
                        <div className="col-md-4 mb-3">
                          <Select
                            label="Signatory Type"
                            options={signatoryTypes}
                            value={form.signatory.type}
                            onChange={(e) =>
                              handleSignatoryChange(
                                index,
                                "type",
                                e.target.value as SignatoryType
                              )
                            }
                            valueKey="value"
                            labelKey="label"
                            name={`type_${index}`}
                            defaultValue=""
                            isDisabled={loading || submitting}
                          />
                        </div>

                        {/* Order */}
                        <div className="col-md-4 mb-3">
                          <TextInput
                            label="Order"
                            type="number"
                            value={form.signatory.order}
                            onChange={(e) =>
                              handleSignatoryChange(
                                index,
                                "order",
                                parseInt(e.target.value) || 0
                              )
                            }
                            name={`order_${index}`}
                            min={1}
                            isDisabled={loading || submitting}
                          />
                        </div>

                        {/* Workflow Stage Selection */}
                        <div className="col-md-12 mb-3">
                          <MultiSelect
                            label="Workflow Stage"
                            options={formatOptions(
                              workflowStages,
                              "id",
                              "name"
                            )}
                            value={form.selectedOptions.workflowStage}
                            onChange={handleMultiSelectChange(
                              index,
                              "workflowStage"
                            )}
                            placeholder="Select Workflow Stage"
                            isSearchable
                            isDisabled={loading || submitting}
                          />
                        </div>

                        {/* Should Sign Checkbox */}
                        <div className="col-md-12 mb-3">
                          <Checkbox
                            label="Should Sign"
                            name={`should_sign_${index}`}
                            checked={form.signatory.should_sign}
                            onChange={(e) =>
                              handleSignatoryChange(
                                index,
                                "should_sign",
                                e.target.checked
                              )
                            }
                            isDisabled={loading || submitting}
                            helpText="Check this if this signatory is required to sign the document"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {!isViewMode && (
            <div className="d-flex justify-content-between mt-4">
              <Button
                label={mode === "update" ? "Cancel" : "Back"}
                variant="outline"
                handleClick={() => {
                  if (mode === "update" && isManaging) {
                    setIsManaging(false);
                  } else {
                    navigate("/specifications/document-categories");
                  }
                }}
                isDisabled={submitting}
              />
              <Button
                label={submitting ? "Saving..." : "Save Signatories"}
                icon="ri-save-line"
                variant="success"
                handleClick={handleAddSignatories}
                isDisabled={
                  loading || submitting || signatoryForms.length === 0
                }
              />
            </div>
          )}

          {/* View Mode: Back Button */}
          {isViewMode && (
            <div className="d-flex justify-content-start mt-4">
              <Button
                label="Back to Document Categories"
                icon="ri-arrow-left-line"
                variant="outline"
                handleClick={() =>
                  navigate("/specifications/document-categories")
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCategorySignatories;
