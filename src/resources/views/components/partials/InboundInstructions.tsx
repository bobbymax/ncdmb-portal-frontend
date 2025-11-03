import { InboundResponseData } from "@/app/Repositories/Inbound/data";
import { FormPageComponentProps } from "@/bootstrap";
import React, { useState, useEffect } from "react";
import InboundInstructionRepository from "app/Repositories/InboundInstruction/InboundInstructionRepository";
import { InboundInstructionResponseData } from "app/Repositories/InboundInstruction/data";
import Textarea from "../forms/Textarea";
import TextInput from "../forms/TextInput";
import CustomButton from "../forms/CustomButton";
import { toast } from "react-toastify";
import { useAuth } from "app/Context/AuthContext";
import { UserResponseData } from "app/Repositories/User/data";
import { DepartmentResponseData } from "app/Repositories/Department/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import ReactSelect from "react-select";
import Select from "../forms/Select";
import { useNavigate } from "react-router-dom";

const InboundInstructions = ({
  state,
  setState,
  handleChange,
  dependencies,
}: FormPageComponentProps<InboundResponseData>): JSX.Element => {
  const { staff } = useAuth();
  const instructionRepo = new InboundInstructionRepository();
  const [assignmentCategory, setAssignmentCategory] = useState<
    "user" | "department" | "group"
  >("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Cast dependencies properly
  const {
    users = [],
    departments = [],
    groups = [],
  } = dependencies as {
    users?: UserResponseData[];
    departments?: DepartmentResponseData[];
    groups?: GroupResponseData[];
  };

  // Create unified searchable options
  type AssigneeOption = {
    value: number;
    label: string;
    type: "user" | "department" | "group";
    data: UserResponseData | DepartmentResponseData | GroupResponseData;
  };

  const assigneeOptions: AssigneeOption[] = [
    ...users.map((user) => ({
      value: user.id,
      label: user.name || `User ${user.id}`,
      type: "user" as const,
      data: user,
    })),
    ...departments.map((dept) => ({
      value: dept.id,
      label: dept.name || `Department ${dept.id}`,
      type: "department" as const,
      data: dept,
    })),
    ...groups.map((group) => ({
      value: group.id,
      label: group.name || `Group ${group.id}`,
      type: "group" as const,
      data: group,
    })),
  ];

  // Custom option rendering
  const formatOptionLabel = (option: AssigneeOption) => {
    if (option.type === "user") {
      const user = option.data as UserResponseData;
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.25rem 0",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #137547 0%, #0d5233 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "600",
              fontSize: "0.875rem",
              flexShrink: 0,
            }}
          >
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: "500",
                color: "#2d3748",
                fontSize: "0.9rem",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email || user.staff_no || "Staff Member"}
            </div>
          </div>
          <div
            style={{
              padding: "0.125rem 0.5rem",
              background: "#e0f2fe",
              color: "#0369a1",
              borderRadius: "9999px",
              fontSize: "0.65rem",
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            User
          </div>
        </div>
      );
    }

    if (option.type === "department") {
      const dept = option.data as DepartmentResponseData;
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.25rem 0",
          }}
        >
          {/* Icon Avatar */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "0.5rem",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1.125rem",
              flexShrink: 0,
            }}
          >
            <i className="ri-building-line" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: "500",
                color: "#2d3748",
                fontSize: "0.9rem",
              }}
            >
              {dept.name}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Department
            </div>
          </div>
          <div
            style={{
              padding: "0.125rem 0.5rem",
              background: "#fef3c7",
              color: "#d97706",
              borderRadius: "9999px",
              fontSize: "0.65rem",
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            Dept
          </div>
        </div>
      );
    }

    // Group
    const group = option.data as GroupResponseData;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.25rem 0",
        }}
      >
        {/* Icon Avatar */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "0.5rem",
            background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "1.125rem",
            flexShrink: 0,
          }}
        >
          <i className="ri-team-line" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{ fontWeight: "500", color: "#2d3748", fontSize: "0.9rem" }}
          >
            {group.name}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Group</div>
        </div>
        <div
          style={{
            padding: "0.125rem 0.5rem",
            background: "#f3e8ff",
            color: "#7c3aed",
            borderRadius: "9999px",
            fontSize: "0.65rem",
            fontWeight: "600",
            textTransform: "uppercase",
          }}
        >
          Group
        </div>
      </div>
    );
  };

  // Simple state management without useForm (to avoid complexity)
  const [instructionState, setInstructionState] = useState<
    Partial<InboundInstructionResponseData>
  >({
    ...instructionRepo.getState(),
    inbound_id: state.id,
    created_by_id: staff?.id || 0,
    instruction_type: "review",
    category: assignmentCategory,
    priority: "medium",
    status: "pending",
  });

  const handleInstructionChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setInstructionState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update assignment type when category changes
  useEffect(() => {
    const typeMap = {
      user: "App\\Models\\User",
      department: "App\\Models\\Department",
      group: "App\\Models\\Group",
    };

    setInstructionState((prev) => ({
      ...prev,
      assignable_type: typeMap[assignmentCategory],
    }));
  }, [assignmentCategory]);

  // Handle unified assignee selection
  const handleAssigneeChange = (selectedOption: AssigneeOption | null) => {
    if (!selectedOption) {
      setInstructionState((prev) => ({
        ...prev,
        assignable_id: 0,
        assignable_type: undefined,
      }));
      return;
    }

    const typeMap = {
      user: "App\\Models\\User",
      department: "App\\Models\\Department",
      group: "App\\Models\\Group",
    };

    setAssignmentCategory(selectedOption.type);
    setInstructionState((prev) => ({
      ...prev,
      assignable_id: selectedOption.value,
      assignable_type: typeMap[selectedOption.type],
      category: selectedOption.type,
    }));
  };

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "50px",
      borderRadius: "0.5rem",
      border: state.isFocused ? "2px solid #137547" : "1px solid #e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(19, 117, 71, 0.1)" : "none",
      "&:hover": {
        border: state.isFocused ? "2px solid #137547" : "1px solid #cbd5e1",
      },
      transition: "all 0.2s",
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: "0.5rem",
      boxShadow:
        "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
      zIndex: 9999,
    }),
    menuList: (base: any) => ({
      ...base,
      padding: "0.5rem",
      maxHeight: "280px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgba(19, 117, 71, 0.08)"
        : state.isFocused
        ? "rgba(19, 117, 71, 0.04)"
        : "transparent",
      borderRadius: "0.375rem",
      margin: "0.125rem 0",
      padding: "0.5rem 0.75rem",
      cursor: "pointer",
      transition: "all 0.15s",
      "&:active": {
        backgroundColor: "rgba(19, 117, 71, 0.12)",
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#94a3b8",
      fontSize: "0.9rem",
    }),
    input: (base: any) => ({
      ...base,
      fontSize: "0.9rem",
      color: "#2d3748",
    }),
    singleValue: (base: any) => ({
      ...base,
      fontSize: "0.9rem",
    }),
  };

  const submitInstruction = async () => {
    setIsSubmitting(true);

    // Manually call the repository's store method
    try {
      const response = await instructionRepo.store(
        "inboundInstructions",
        instructionRepo.formatDataOnSubmit({
          ...instructionState,
          inbound_id: state.id,
          created_by_id: staff?.id || 0,
        })
      );

      if (response) {
        toast.success(response.message || "Instruction issued successfully");

        // Reset form
        setInstructionState({
          ...instructionRepo.getState(),
          inbound_id: state.id,
          created_by_id: staff?.id || 0,
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to issue instruction");
    } finally {
      setIsSubmitting(false);
      navigate("/desk/inbounds");
    }
  };

  // Listen for notification progress
  useEffect(() => {
    if (!state.id) return;

    // Safely access Echo (lazy-loaded)
    try {
      const channel = (window as any).Echo?.private(
        `resource.inbound_instruction.${state.id}`
      );

      if (!channel) return;

      channel.listen(".ResourceNotificationProgress", (data: any) => {
        if (data.error) {
          toast.error(data.message);
        } else if (data.completed) {
          toast.success("All notifications sent successfully!");
        } else {
          toast.info(data.message, {
            autoClose: 2000,
            hideProgressBar: false,
            progress: data.percentage / 100,
          });
        }
      });

      return () => {
        channel.stopListening(".ResourceNotificationProgress");
      };
    } catch (error) {
      // Echo not initialized yet, skip
    }
  }, [state.id]);

  // Check if instructions exist
  const hasInstructions =
    Array.isArray(state.instructions) && state.instructions.length > 0;

  // Helper to resolve assignee details
  const getAssigneeDetails = (instruction: InboundInstructionResponseData) => {
    const { assignable_type, assignable_id } = instruction;

    if (assignable_type === "App\\Models\\User") {
      const user = users.find((u) => u.id === assignable_id);
      if (user) {
        const initials =
          user.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase() || "U";
        return {
          name: user.name || `User ${assignable_id}`,
          type: "User" as const,
          initials,
          color: "#137547",
          bgColor: "#d1fae5",
          icon: "ri-user-line",
        };
      }
    } else if (assignable_type === "App\\Models\\Department") {
      const dept = departments.find((d) => d.id === assignable_id);
      if (dept) {
        return {
          name: dept.name || `Department ${assignable_id}`,
          type: "Department" as const,
          initials: dept.name?.substring(0, 2).toUpperCase() || "DP",
          color: "#ea580c",
          bgColor: "#fed7aa",
          icon: "ri-building-line",
        };
      }
    } else if (assignable_type === "App\\Models\\Group") {
      const group = groups.find((g) => g.id === assignable_id);
      if (group) {
        return {
          name: group.name || `Group ${assignable_id}`,
          type: "Group" as const,
          initials: group.name?.substring(0, 2).toUpperCase() || "GP",
          color: "#7c3aed",
          bgColor: "#e9d5ff",
          icon: "ri-team-line",
        };
      }
    }
    return null;
  };

  // Helper to get creator details
  const getCreatorName = (creatorId: number) => {
    const creator = users.find((u) => u.id === creatorId);
    return creator?.name || `Staff ${creatorId}`;
  };

  return (
    <div className="inbound-instructions-tab" style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          paddingBottom: "0.75rem",
          borderBottom: "2px solid #137547",
        }}
      >
        <i
          className="ri-file-list-3-line"
          style={{ fontSize: "1.5rem", color: "#137547" }}
        />
        <h3
          style={{
            margin: 0,
            color: "#2d3748",
            fontSize: "1.25rem",
            fontWeight: "600",
          }}
        >
          {hasInstructions
            ? "Processing Instructions"
            : "Issue Processing Instruction"}
        </h3>
      </div>

      {/* Instruction Form - Only show if no instructions exist */}
      {!hasInstructions && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          {/* Instruction Type */}
          <div className="form-section">
            <Select
              label="Instruction Type"
              name="instruction_type"
              value={instructionState.instruction_type}
              defaultValue=""
              defaultCheckDisabled
              onChange={handleInstructionChange}
              options={[
                { value: "review", label: "Review & Assessment" },
                { value: "respond", label: "Response Required" },
                { value: "forward", label: "Forward to Department" },
                { value: "approve", label: "Approval Required" },
                { value: "archive", label: "Archive/File" },
                { value: "other", label: "Other" },
              ]}
              valueKey="value"
              labelKey="label"
              size="md"
            />
          </div>

          {/* Instruction Text */}
          <div className="form-section">
            <Textarea
              label="Instruction Details"
              name="instruction_text"
              value={instructionState.instruction_text}
              onChange={handleInstructionChange}
              placeholder="Provide detailed instructions for handling this document..."
              rows={4}
            />
          </div>

          {/* Unified Assignment Search */}
          <div className="form-section">
            <label
              className="storm-form-label mb-2"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <i className="ri-search-line" style={{ color: "#137547" }} />
              <span>Assign To (Search Users, Departments, or Groups):</span>
            </label>
            <ReactSelect
              options={assigneeOptions}
              value={
                assigneeOptions.find(
                  (opt) =>
                    opt.value === instructionState.assignable_id &&
                    opt.type === assignmentCategory
                ) || null
              }
              onChange={handleAssigneeChange}
              formatOptionLabel={formatOptionLabel}
              styles={selectStyles}
              placeholder="Search by name..."
              isClearable
              isSearchable
              noOptionsMessage={() => "No users, departments, or groups found"}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            {instructionState.assignable_id !== 0 && (
              <div
                style={{
                  marginTop: "0.75rem",
                  padding: "0.75rem 1rem",
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  color: "#137547",
                }}
              >
                <i
                  className="ri-checkbox-circle-line"
                  style={{ fontSize: "1.125rem" }}
                />
                <span>
                  <strong>
                    {assignmentCategory === "user"
                      ? "User"
                      : assignmentCategory === "department"
                      ? "Department"
                      : "Group"}
                  </strong>{" "}
                  selected
                </span>
              </div>
            )}
          </div>

          {/* Priority & Due Date Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <Select
              label="Priority"
              name="priority"
              value={instructionState.priority}
              defaultValue=""
              defaultCheckDisabled
              onChange={handleInstructionChange}
              options={[
                { value: "low", label: "🟢 Low Priority" },
                { value: "medium", label: "🟡 Medium Priority" },
                { value: "high", label: "🟠 High Priority" },
                { value: "urgent", label: "🔴 Urgent" },
              ]}
              valueKey="value"
              labelKey="label"
              size="md"
            />

            <TextInput
              label="Due Date"
              type="date"
              name="due_date"
              value={instructionState.due_date}
              onChange={handleInstructionChange}
              size="md"
            />
          </div>

          {/* Submit Button */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <CustomButton
              label={
                isSubmitting ? "Issuing Instruction..." : "Issue Instruction"
              }
              handleClick={submitInstruction}
              variant="dark"
              size="md"
              isDisabled={
                isSubmitting ||
                !instructionState.instruction_text ||
                instructionState.assignable_id === 0
              }
              icon="send-plane-2"
            />
          </div>
        </div>
      )}

      {/* Existing Instructions Display */}
      {hasInstructions && (
        <div>
          <h4
            style={{
              marginBottom: "1.5rem",
              color: "#2d3748",
              fontSize: "1.1rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i className="ri-history-line" style={{ color: "#137547" }} />
            Instruction History ({state.instructions.length})
          </h4>

          <div
            style={{ display: "grid", gap: "0.875rem" } as React.CSSProperties}
          >
            {state.instructions.map((instruction) => {
              const assignee = getAssigneeDetails(instruction);
              const creatorName = getCreatorName(instruction.created_by_id);

              const priorityStyles = {
                low: {
                  icon: "🟢",
                  color: "#137547",
                  bg: "#d1fae5",
                  border: "#86efac",
                },
                medium: {
                  icon: "🟡",
                  color: "#d97706",
                  bg: "#fef3c7",
                  border: "#fcd34d",
                },
                high: {
                  icon: "🟠",
                  color: "#ea580c",
                  bg: "#fed7aa",
                  border: "#fb923c",
                },
                urgent: {
                  icon: "🔴",
                  color: "#dc2626",
                  bg: "#fee2e2",
                  border: "#fca5a5",
                },
              };

              const statusStyles = {
                pending: { color: "#d97706", bg: "#fef3c7", border: "#fcd34d" },
                in_progress: {
                  color: "#2563eb",
                  bg: "#dbeafe",
                  border: "#93c5fd",
                },
                completed: {
                  color: "#137547",
                  bg: "#d1fae5",
                  border: "#86efac",
                },
                cancelled: {
                  color: "#6b7280",
                  bg: "#f3f4f6",
                  border: "#d1d5db",
                },
              };

              const priority =
                priorityStyles[
                  instruction.priority as keyof typeof priorityStyles
                ] || priorityStyles.medium;
              const status =
                statusStyles[instruction.status as keyof typeof statusStyles] ||
                statusStyles.pending;

              return (
                <div
                  key={instruction.id}
                  style={
                    {
                      position: "relative",
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
                      border: "1px solid #e8ecef",
                      borderLeft: `4px solid ${priority.color}`,
                      borderRadius: "10px",
                      padding: "1rem",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.03)",
                      transition: "all 0.3s ease",
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 0, 0, 0.06)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 1px 4px rgba(0, 0, 0, 0.03)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Header Section */}
                  <div
                    style={
                      {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.75rem",
                      } as React.CSSProperties
                    }
                  >
                    <div style={{ flex: 1 } as React.CSSProperties}>
                      <div
                        style={
                          {
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            marginBottom: "0.4rem",
                            flexWrap: "wrap",
                          } as React.CSSProperties
                        }
                      >
                        <span
                          style={
                            {
                              padding: "0.25rem 0.65rem",
                              background: status.bg,
                              color: status.color,
                              border: `1px solid ${status.border}`,
                              borderRadius: "16px",
                              fontSize: "0.6875rem",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              letterSpacing: "0.02em",
                            } as React.CSSProperties
                          }
                        >
                          {instruction.status.replace("_", " ")}
                        </span>
                        <span
                          style={
                            {
                              padding: "0.25rem 0.65rem",
                              background: priority.bg,
                              color: priority.color,
                              border: `1px solid ${priority.border}`,
                              borderRadius: "16px",
                              fontSize: "0.6875rem",
                              fontWeight: "600",
                            } as React.CSSProperties
                          }
                        >
                          {priority.icon} {instruction.priority}
                        </span>
                      </div>
                      <div
                        style={
                          {
                            fontSize: "0.75rem",
                            color: "#64748b",
                            fontWeight: "500",
                          } as React.CSSProperties
                        }
                      >
                        <strong
                          style={{ color: "#475569" } as React.CSSProperties}
                        >
                          #{instruction.id}
                        </strong>{" "}
                        • {instruction.instruction_type.replace("_", " ")}
                      </div>
                    </div>
                    {instruction.due_date && (
                      <div
                        style={
                          {
                            textAlign: "right",
                            padding: "0.5rem 0.75rem",
                            background:
                              "linear-gradient(135deg, #fafbfc 0%, #f3f4f6 100%)",
                            borderRadius: "6px",
                            border: "1px solid #e8ecef",
                            minWidth: "100px",
                          } as React.CSSProperties
                        }
                      >
                        <div
                          style={
                            {
                              fontSize: "0.625rem",
                              color: "#64748b",
                              textTransform: "uppercase",
                              fontWeight: "600",
                              letterSpacing: "0.04em",
                              marginBottom: "0.2rem",
                            } as React.CSSProperties
                          }
                        >
                          Due
                        </div>
                        <div
                          style={
                            {
                              fontSize: "0.8125rem",
                              fontWeight: "600",
                              color: "#1e293b",
                            } as React.CSSProperties
                          }
                        >
                          {new Date(instruction.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instruction Text */}
                  <div
                    style={
                      {
                        padding: "0.75rem 1rem",
                        background:
                          "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        marginBottom: "0.75rem",
                      } as React.CSSProperties
                    }
                  >
                    <p
                      style={
                        {
                          margin: 0,
                          color: "#334155",
                          lineHeight: "1.6",
                          fontSize: "0.875rem",
                        } as React.CSSProperties
                      }
                    >
                      {String(instruction.instruction_text || "")}
                    </p>
                  </div>

                  {/* Assignee Section */}
                  {assignee && (
                    <div
                      style={
                        {
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem",
                          padding: "0.75rem",
                          background: assignee.bgColor,
                          border: `1px solid ${assignee.color}33`,
                          borderRadius: "6px",
                          marginBottom: "0.75rem",
                        } as React.CSSProperties
                      }
                    >
                      <div
                        style={
                          {
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${assignee.color} 0%, ${assignee.color}dd 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "0.8125rem",
                            flexShrink: 0,
                            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
                          } as React.CSSProperties
                        }
                      >
                        {assignee.initials}
                      </div>
                      <div style={{ flex: 1 } as React.CSSProperties}>
                        <div
                          style={
                            {
                              fontSize: "0.625rem",
                              color: assignee.color,
                              textTransform: "uppercase",
                              fontWeight: "600",
                              letterSpacing: "0.04em",
                              marginBottom: "0.2rem",
                            } as React.CSSProperties
                          }
                        >
                          Assigned To
                        </div>
                        <div
                          style={
                            {
                              fontSize: "0.8125rem",
                              fontWeight: "600",
                              color: assignee.color,
                            } as React.CSSProperties
                          }
                        >
                          {assignee.name}
                        </div>
                        <div
                          style={
                            {
                              fontSize: "0.75rem",
                              color: assignee.color,
                              opacity: 0.75,
                            } as React.CSSProperties
                          }
                        >
                          {assignee.type}
                        </div>
                      </div>
                      <i
                        className={assignee.icon}
                        style={
                          {
                            fontSize: "1.25rem",
                            color: assignee.color,
                            opacity: 0.25,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    style={
                      {
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid #e8ecef",
                        fontSize: "0.75rem",
                        color: "#64748b",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                      } as React.CSSProperties
                    }
                  >
                    <div
                      style={
                        {
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        } as React.CSSProperties
                      }
                    >
                      <i
                        className="ri-user-line"
                        style={
                          {
                            color: "#94a3b8",
                            fontSize: "0.875rem",
                          } as React.CSSProperties
                        }
                      />
                      <span>
                        <strong
                          style={
                            {
                              color: "#475569",
                              fontWeight: "600",
                            } as React.CSSProperties
                          }
                        >
                          By:
                        </strong>{" "}
                        {creatorName}
                      </span>
                    </div>
                    <div
                      style={
                        {
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        } as React.CSSProperties
                      }
                    >
                      <i
                        className="ri-calendar-line"
                        style={
                          {
                            color: "#94a3b8",
                            fontSize: "0.875rem",
                          } as React.CSSProperties
                        }
                      />
                      <span>
                        {instruction.created_at
                          ? new Date(
                              instruction.created_at
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InboundInstructions;
