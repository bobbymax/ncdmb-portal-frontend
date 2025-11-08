import { ProjectCategoryResponseData } from "@/app/Repositories/ProjectCategory/data";
import { ThresholdResponseData } from "@/app/Repositories/Threshold/data";
import { ProjectResponseData } from "app/Repositories/Project/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { formatDateForInput } from "app/Support/DateHelpers";
import { ActionMeta } from "react-select";
import Box from "../components/forms/Box";
import { useAuth } from "app/Context/AuthContext";
import Select from "../components/forms/Select";
import { FundResponseData } from "@/app/Repositories/Fund/data";
import FormSection from "../components/forms/FormSection";
import ToggleCard from "../components/forms/ToggleCard";

interface DependencyProps {
  thresholds: ThresholdResponseData[];
  projectCategories: ProjectCategoryResponseData[];
  funds: FundResponseData[];
  projectPrograms: any[];
}

const Project: React.FC<FormPageComponentProps<ProjectResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
  loading,
  mode,
}) => {
  const { staff } = useAuth();
  const {
    thresholds = [],
    projectCategories = [],
    funds = [],
    projectPrograms = [],
  } = useMemo(() => dependencies as DependencyProps, [dependencies]);

  const [category, setCategory] = useState<DataOptionsProps | null>(null);
  const [isInclusive, setIsInclusive] = useState<"yes" | "no">("no");
  const [threshold, setThreshold] = useState<ThresholdResponseData | null>(
    null
  );

  const handleCategoryChange = useCallback(
    (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
      const value = newValue as DataOptionsProps;
      setCategory(value);
      if (setState) {
        setState((prev) => ({
          ...prev,
          project_category_id: value.value,
        }));
      }
    },
    [setState]
  );

  useEffect(() => {
    if (state.total_proposed_amount > 0) {
      const sorted = thresholds.sort(
        (a, b) => Number(a.amount) - Number(b.amount)
      );
      const threshold: ThresholdResponseData | null =
        sorted.find(
          (t) => Number(state.total_proposed_amount) <= Number(t.amount)
        ) ?? null;

      if (setState) {
        setState((prev) => ({
          ...prev,
          threshold_id: threshold?.id ?? 0,
        }));
      }

      setThreshold(threshold);
    }
  }, [state.total_proposed_amount]);

  useEffect(() => {
    if (state.total_proposed_amount > 0 && isInclusive === "yes") {
      const vatValue = Number(state.total_proposed_amount) * (3 / 43);

      if (setState) {
        setState((prev) => ({
          ...prev,
          vat_amount: parseFloat(vatValue.toFixed(2)) ?? 0,
        }));
      }
    }
  }, [state.total_proposed_amount, isInclusive]);

  useEffect(() => {
    if (state.sub_total_amount > 0 && state.service_charge_percentage > 0) {
      const adminFee =
        Number(state.sub_total_amount) *
        (Number(state.service_charge_percentage) / 100);
      const vatValue = adminFee * 0.075;

      const grandTotal = Number(state.sub_total_amount) + adminFee + vatValue;

      if (setState) {
        setState((prev) => ({
          ...prev,
          markup_amount: parseFloat(adminFee.toFixed(2)) ?? 0,
          total_proposed_amount: parseFloat(grandTotal.toFixed(2)) ?? 0,
          vat_amount: parseFloat(vatValue.toFixed(2)) ?? 0,
        }));
      }
    }
  }, [state.sub_total_amount, state.service_charge_percentage]);

  useEffect(() => {
    if (staff && setState) {
      setState((prev) => ({
        ...prev,
        department_id: staff.department_id,
        user_id: staff.id,
      }));
    }
  }, [staff]);

  // Initialize category in update mode
  useEffect(() => {
    if (
      mode === "update" &&
      state.project_category_id &&
      projectCategories.length > 0 &&
      !category
    ) {
      const selectedCategory = projectCategories.find(
        (cat) => cat.id === state.project_category_id
      );
      if (selectedCategory) {
        setCategory({
          value: selectedCategory.id,
          label: selectedCategory.name,
        });
      }
    }
  }, [mode, state.project_category_id, projectCategories, category]);

  return (
    <>
      {/* Section 1: Basic Information */}
      <div className="col-md-12 mb-4">
        <div className="card shadow-sm">
          <div
            className="card-header"
            style={{
              backgroundColor: "#f0f7f4",
              borderBottom: "2px solid #d4e9e2",
            }}
          >
            <h6 className="mb-0 text-dark">
              <i
                className="ri-information-line me-2"
                style={{ color: "#5a9279" }}
              ></i>
              Basic Information
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Program/Phase Selection */}
              <div className="col-md-5 mb-3">
                <MultiSelect
                  label="Parent Program (Optional)"
                  options={formatOptions(projectPrograms, "id", "title")}
                  value={
                    state.program_id
                      ? {
                          value: state.program_id,
                          label:
                            projectPrograms.find(
                              (p) => p.id === state.program_id
                            )?.title || "",
                        }
                      : null
                  }
                  onChange={(newValue) => {
                    const value = newValue as DataOptionsProps;
                    if (setState) {
                      setState((prev) => ({
                        ...prev,
                        program_id: value?.value ?? null,
                      }));
                    }
                  }}
                  placeholder="Select program (leave empty for standalone project)"
                  isSearchable
                  isDisabled={loading}
                />
                <small className="text-muted">
                  <i className="ri-information-line me-1"></i>
                  If this is a phase of a larger program, select the program
                  here
                </small>
              </div>

              {state.program_id && (
                <>
                  <div className="col-md-3 mb-3">
                    <TextInput
                      label="Phase Name"
                      name="phase_name"
                      value={state.phase_name || ""}
                      onChange={handleChange}
                      placeholder="e.g., Phase 1, Phase 2A"
                    />
                    <small className="text-muted">
                      Human-readable phase identifier
                    </small>
                  </div>

                  <div className="col-md-3 mb-3">
                    <TextInput
                      label="Phase Order"
                      name="phase_order"
                      type="number"
                      value={state.phase_order || ""}
                      onChange={handleChange}
                      placeholder="1, 2, 3..."
                      min="1"
                    />
                    <small className="text-muted">Execution sequence</small>
                  </div>
                </>
              )}

              <div className="col-md-7 mb-3">
                <TextInput
                  label="Project Title"
                  name="title"
                  value={state.title}
                  onChange={handleChange}
                  placeholder="Enter a clear and concise project title"
                />
              </div>

              <div className="col-md-12 mb-3">
                <Textarea
                  label="Project Description"
                  name="description"
                  value={state.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the project objectives, deliverables, and expected outcomes"
                  rows={5}
                />
              </div>

              <div className="col-md-12 mb-3">
                <Textarea
                  label="Strategic Alignment"
                  name="strategic_alignment"
                  value={state.strategic_alignment}
                  onChange={handleChange}
                  placeholder="Explain how this project aligns with organizational strategic goals and priorities"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Classification & Timeline */}
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm h-100">
          <div
            className="card-header"
            style={{
              backgroundColor: "#e8f5e9",
              borderBottom: "2px solid #c8e6c9",
            }}
          >
            <h6 className="mb-0 text-dark">
              <i
                className="ri-price-tag-3-line me-2"
                style={{ color: "#4caf50" }}
              ></i>
              Project Classification
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12 mb-3">
                <Select
                  label="Project Type"
                  name="project_type"
                  valueKey="value"
                  labelKey="label"
                  value={state.project_type}
                  onChange={handleChange}
                  defaultValue=""
                  defaultCheckDisabled
                  options={[
                    { value: "capital", label: "Capital Project" },
                    { value: "operational", label: "Operational" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "research", label: "Research & Development" },
                    { value: "infrastructure", label: "Infrastructure" },
                  ]}
                />
              </div>

              <div className="col-md-6 mb-3">
                <Select
                  label="Priority Level"
                  name="priority"
                  valueKey="value"
                  labelKey="label"
                  value={state.priority}
                  onChange={handleChange}
                  defaultValue=""
                  defaultCheckDisabled
                  options={[
                    { value: "critical", label: "🔴 Critical" },
                    { value: "high", label: "🟠 High" },
                    { value: "medium", label: "🟡 Medium" },
                    { value: "low", label: "🟢 Low" },
                  ]}
                />
              </div>

              <div className="col-md-6 mb-3">
                <Select
                  label="Execution Type"
                  name="type"
                  valueKey="value"
                  labelKey="label"
                  value={state.type}
                  onChange={handleChange}
                  defaultValue=""
                  defaultCheckDisabled
                  options={[
                    { value: "staff", label: "Internal (Staff)" },
                    { value: "third-party", label: "External (Contractor)" },
                  ]}
                />
              </div>

              <div className="col-md-12 mb-3">
                <MultiSelect
                  label="Project Category"
                  options={formatOptions(projectCategories, "id", "name")}
                  value={category}
                  onChange={handleCategoryChange}
                  placeholder="Select a category"
                  isSearchable
                  isDisabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Timeline */}
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm h-100">
          <div
            className="card-header"
            style={{
              backgroundColor: "#e3f2fd",
              borderBottom: "2px solid #bbdefb",
            }}
          >
            <h6 className="mb-0 text-dark">
              <i
                className="ri-calendar-line me-2"
                style={{ color: "#2196f3" }}
              ></i>
              Project Timeline
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12 mb-3">
                <TextInput
                  label="Proposed Start Date"
                  name="proposed_start_date"
                  value={formatDateForInput(state.proposed_start_date)}
                  onChange={handleChange}
                  type="date"
                />
              </div>

              <div className="col-md-12 mb-3">
                <TextInput
                  label="Proposed End Date"
                  name="proposed_end_date"
                  value={formatDateForInput(state.proposed_end_date)}
                  onChange={handleChange}
                  type="date"
                />
              </div>

              <div className="col-md-12">
                <div className="alert alert-info mb-0" role="alert">
                  <small>
                    <i className="ri-information-line me-1"></i>
                    <strong>Note:</strong> Dates can be adjusted during project
                    approval and execution phases
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Financial Information */}
      <div className="col-md-12 mb-4">
        <div className="card shadow-sm">
          <div
            className="card-header"
            style={{
              backgroundColor: "#fff8e1",
              borderBottom: "2px solid #ffe082",
            }}
          >
            <h6 className="mb-0 text-dark">
              <i
                className="ri-money-dollar-circle-line me-2"
                style={{ color: "#ffa726" }}
              ></i>
              Financial Information
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Funding Source & Year */}
              <div className="col-md-6 mb-3">
                <MultiSelect
                  label="Funding Source"
                  options={formatOptions(funds, "id", "name")}
                  value={
                    state.fund_id
                      ? {
                          value: state.fund_id,
                          label:
                            funds.find((f) => f.id === state.fund_id)?.name ||
                            "",
                        }
                      : null
                  }
                  onChange={(newValue) => {
                    const value = newValue as DataOptionsProps;
                    if (setState) {
                      setState((prev) => ({
                        ...prev,
                        fund_id: value?.value ?? null,
                      }));
                    }
                  }}
                  placeholder="Select funding source"
                  isSearchable
                  isDisabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <TextInput
                  label="Budget Year"
                  name="budget_year"
                  value={state.budget_year}
                  onChange={handleChange}
                  placeholder="e.g., 2025"
                />
              </div>

              {/* Budget Options */}
              <ToggleCard
                title="VAT Calculation Mode"
                description="Choose how to handle VAT in your budget calculation"
                icon="ri-percent-line"
                iconColor="#2196f3"
                checked={isInclusive === "yes"}
                onChange={(checked) => setIsInclusive(checked ? "yes" : "no")}
                checkedLabel="VAT Inclusive"
                uncheckedLabel="VAT Exclusive"
                disabled={state.sub_total_amount > 0}
              />

              {/* Simple Budget Entry */}
              {isInclusive === "yes" && (
                <div className="col-md-12 mb-3">
                  <TextInput
                    label="Total Proposed Amount"
                    name="total_proposed_amount"
                    value={state.total_proposed_amount}
                    onChange={handleChange}
                    placeholder="Enter total project budget"
                  />
                </div>
              )}

              {/* Detailed Budget Breakdown */}
              {isInclusive === "no" && (
                <>
                  <div className="col-md-12 mb-2">
                    <h6 className="text-muted">
                      <i className="ri-file-list-3-line me-2"></i>
                      Budget Breakdown
                    </h6>
                  </div>

                  <div className="col-md-8 mb-3">
                    <TextInput
                      label="Sub Total Amount"
                      value={state.sub_total_amount}
                      name="sub_total_amount"
                      onChange={handleChange}
                      placeholder="Base amount before charges"
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <TextInput
                      label="Service Charge (%)"
                      type="number"
                      name="service_charge_percentage"
                      value={state.service_charge_percentage}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <TextInput
                      label="Admin Fee"
                      value={state.markup_amount}
                      name="markup_amount"
                      onChange={handleChange}
                      isDisabled
                    />
                    <small className="text-muted">Auto-calculated</small>
                  </div>

                  <div className="col-md-4 mb-3">
                    <TextInput
                      label="VAT Amount"
                      value={state.vat_amount}
                      name="vat_amount"
                      onChange={handleChange}
                      isDisabled
                    />
                    <small className="text-muted">Auto-calculated</small>
                  </div>

                  <div className="col-md-4 mb-3">
                    <TextInput
                      label="Total Budget"
                      value={state.total_proposed_amount}
                      name="total_proposed_amount"
                      onChange={handleChange}
                      isDisabled
                    />
                    <small className="text-muted">Auto-calculated</small>
                  </div>
                </>
              )}

              {/* Approval Threshold Display */}
              <div className="col-md-12">
                <div className="alert alert-secondary mb-0">
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <strong>Approval Threshold:</strong>
                    </div>
                    <div className="col-md-9">
                      {threshold ? (
                        <span className="badge bg-primary fs-6">
                          {threshold.name}
                        </span>
                      ) : (
                        <span className="text-muted">
                          <i className="ri-information-line me-1"></i>
                          Will be determined based on total amount
                        </span>
                      )}
                      {state.program_id && (
                        <span className="ms-3 badge bg-info fs-6">
                          <i className="ri-stack-line me-1"></i>
                          Phase-Based Procurement
                        </span>
                      )}
                    </div>
                  </div>
                  {state.program_id && (
                    <div className="mt-2">
                      <small className="text-muted">
                        <i className="ri-lightbulb-line me-1"></i>
                        <strong>Note:</strong> This phase will be evaluated
                        independently for procurement approval based on its own
                        budget amount.
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Procurement Details */}
      {state.type === "third-party" && (
        <div className="col-md-12 mb-4">
          <div className="card shadow-sm">
            <div
              className="card-header"
              style={{
                backgroundColor: "#e8f5e9",
                borderBottom: "2px solid #a5d6a7",
              }}
            >
              <h6 className="mb-0 text-dark">
                <i
                  className="ri-auction-line me-2"
                  style={{ color: "#66bb6a" }}
                ></i>
                Procurement Information
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <Select
                    label="Procurement Method"
                    name="procurement_method"
                    valueKey="value"
                    labelKey="label"
                    value={state.procurement_method || ""}
                    onChange={handleChange}
                    defaultValue=""
                    defaultCheckDisabled
                    options={[
                      {
                        value: "open_competitive",
                        label: "Open Competitive Bidding (>₦50M)",
                      },
                      {
                        value: "selective",
                        label: "Selective Bidding (₦10M-₦50M)",
                      },
                      {
                        value: "rfq",
                        label: "Request for Quotation (₦250K-₦5M)",
                      },
                      { value: "direct", label: "Direct Procurement (<₦5M)" },
                      { value: "emergency", label: "Emergency Procurement" },
                      { value: "framework", label: "Framework Agreement" },
                    ]}
                  />
                  <small className="text-muted">
                    Select appropriate method based on project value and urgency
                  </small>
                </div>

                <div className="col-md-6 mb-3">
                  <Select
                    label="Procurement Type"
                    name="procurement_type"
                    valueKey="value"
                    labelKey="label"
                    value={state.procurement_type || ""}
                    onChange={handleChange}
                    defaultValue=""
                    defaultCheckDisabled
                    options={[
                      { value: "goods", label: "Goods/Supplies" },
                      { value: "works", label: "Works/Construction" },
                      { value: "services", label: "Services" },
                      { value: "consultancy", label: "Consultancy Services" },
                    ]}
                  />
                </div>

                <div className="col-md-12 mb-3">
                  <Textarea
                    label="Method Justification"
                    name="method_justification"
                    value={state.method_justification || ""}
                    onChange={handleChange}
                    placeholder="Provide justification for the selected procurement method (mandatory for direct and emergency procurement)"
                    rows={3}
                  />
                  <small className="text-muted">
                    Required for compliance with Public Procurement Act 2007
                  </small>
                </div>

                {/* BPP Clearance Indicator */}
                {state.total_proposed_amount >= 50000000 && (
                  <div className="col-md-12">
                    <div className="alert alert-warning mb-0">
                      <div className="d-flex align-items-start">
                        <i className="ri-alert-line me-3 fs-4"></i>
                        <div className="flex-grow-1">
                          <h6 className="mb-2">
                            <strong>⚠️ BPP Clearance Required</strong>
                          </h6>
                          <p className="mb-1 small">
                            This project exceeds <strong>₦50,000,000</strong>{" "}
                            and requires
                            <strong>
                              {" "}
                              Bureau of Public Procurement (BPP)
                            </strong>{" "}
                            clearance:
                          </p>
                          <ul className="mb-0 small ps-3">
                            <li>
                              No Objection Certificate (NOC) to invite bids
                            </li>
                            <li>
                              No Objection Certificate (NOC) to award contract
                            </li>
                            <li>Minimum 6-week tender period</li>
                            <li>Public bid opening ceremony</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Procurement Guide */}
                {state.procurement_method && (
                  <div className="col-md-12 mt-2">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="mb-2">
                          <i className="ri-information-line me-2"></i>
                          Procurement Timeline Guide
                        </h6>
                        <small className="text-muted">
                          {state.procurement_method === "open_competitive" && (
                            <>
                              <strong>Open Competitive:</strong> Minimum 6-week
                              submission period, public advertisement, pre-bid
                              meeting, BPP clearance required
                            </>
                          )}
                          {state.procurement_method === "selective" && (
                            <>
                              <strong>Selective Bidding:</strong> Minimum 4-week
                              submission period, invitation to pre-qualified
                              vendors
                            </>
                          )}
                          {state.procurement_method === "rfq" && (
                            <>
                              <strong>Request for Quotation:</strong> Minimum 3
                              written quotations, simplified evaluation process
                            </>
                          )}
                          {state.procurement_method === "direct" && (
                            <>
                              <strong>Direct Procurement:</strong> Single
                              source, written justification required, value must
                              be below ₦5M
                            </>
                          )}
                          {state.procurement_method === "emergency" && (
                            <>
                              <strong>Emergency:</strong> BPP notification
                              required, detailed justification for emergency
                              status mandatory
                            </>
                          )}
                        </small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Project;
