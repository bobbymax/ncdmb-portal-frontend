import { ProjectBidResponseData } from "app/Repositories/ProjectBid/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useMemo } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import Select from "../components/forms/Select";
import FormSection from "../components/forms/FormSection";

interface DependencyProps {
  projects: any[];
  vendors: any[];
  bidInvitations: any[];
}

const ProjectBid: React.FC<FormPageComponentProps<ProjectBidResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
  loading,
}) => {
  const { projects = [], vendors = [], bidInvitations = [] } = useMemo(
    () => dependencies as DependencyProps,
    [dependencies]
  );

  return (
    <>
      {/* Section 1: Bid Details */}
      <FormSection 
        title="Bid Submission Details" 
        icon="ri-article-line"
        headerStyle="primary"
      >
              <div className="col-md-6 mb-3">
                <MultiSelect
                  label="Project"
                  options={formatOptions(projects, "id", "title")}
                  value={
                    state.project_id
                      ? {
                          value: state.project_id,
                          label:
                            projects.find((p) => p.id === state.project_id)
                              ?.title || "",
                        }
                      : null
                  }
                  onChange={(newValue) => {
                    const value = newValue as DataOptionsProps;
                    if (setState) {
                      setState((prev) => ({
                        ...prev,
                        project_id: value?.value ?? 0,
                      }));
                    }
                  }}
                  placeholder="Select project"
                  isSearchable
                  isDisabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <MultiSelect
                  label="Vendor"
                  options={formatOptions(vendors, "id", "name")}
                  value={
                    state.vendor_id
                      ? {
                          value: state.vendor_id,
                          label:
                            vendors.find((v) => v.id === state.vendor_id)
                              ?.name || "",
                        }
                      : null
                  }
                  onChange={(newValue) => {
                    const value = newValue as DataOptionsProps;
                    if (setState) {
                      setState((prev) => ({
                        ...prev,
                        vendor_id: value?.value ?? 0,
                      }));
                    }
                  }}
                  placeholder="Select vendor"
                  isSearchable
                  isDisabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <TextInput
                  label="Bid Amount (₦)"
                  name="bid_amount"
                  value={state.bid_amount}
                  onChange={handleChange}
                  type="number"
                  placeholder="Enter bid amount"
                />
              </div>

              <div className="col-md-6 mb-3">
                <Select
                  label="Submission Method"
                  name="submission_method"
                  valueKey="value"
                  labelKey="label"
                  value={state.submission_method}
                  onChange={handleChange}
                  defaultValue=""
                  defaultCheckDisabled
                  options={[
                    { value: "physical", label: "Physical Submission" },
                    { value: "electronic", label: "Electronic Submission" },
                    { value: "hybrid", label: "Hybrid (Physical + Electronic)" },
                  ]}
                />
              </div>
      </FormSection>

      {/* Section 2: Bid Security */}
      <FormSection 
        title="Bid Security" 
        icon="ri-shield-check-line"
        headerStyle="yellow"
      >
              <div className="col-md-12 mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="bid_security_submitted"
                    checked={state.bid_security_submitted}
                    onChange={(e) => {
                      if (setState) {
                        setState((prev) => ({
                          ...prev,
                          bid_security_submitted: e.target.checked,
                        }));
                      }
                    }}
                  />
                  <label className="form-check-label">
                    Bid Security Submitted
                  </label>
                </div>
              </div>

              {state.bid_security_submitted && (
                <>
                  <div className="col-md-6 mb-3">
                    <Select
                      label="Security Type"
                      name="bid_security_type"
                      valueKey="value"
                      labelKey="label"
                      value={state.bid_security_type || ""}
                      onChange={handleChange}
                      defaultValue=""
                      defaultCheckDisabled
                      options={[
                        { value: "bank_guarantee", label: "Bank Guarantee" },
                        { value: "insurance_bond", label: "Insurance Bond" },
                        { value: "cash", label: "Cash Deposit" },
                      ]}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <TextInput
                      label="Security Reference"
                      name="bid_security_reference"
                      value={state.bid_security_reference || ""}
                      onChange={handleChange}
                      placeholder="Enter security reference number"
                    />
                  </div>
                </>
              )}
      </FormSection>
    </>
  );
};

export default ProjectBid;

