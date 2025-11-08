import { ProjectBidInvitationResponseData } from "app/Repositories/ProjectBidInvitation/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useMemo } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { formatDateTimeForInput } from "app/Support/DateHelpers";
import FormSection from "../components/forms/FormSection";
import ToggleCard from "../components/forms/ToggleCard";

interface DependencyProps {
  projects: any[];
}

const ProjectBidInvitation: React.FC<
  FormPageComponentProps<ProjectBidInvitationResponseData>
> = ({ state, setState, handleChange, dependencies, loading }) => {
  const { projects = [] } = useMemo(
    () => dependencies as DependencyProps,
    [dependencies]
  );

  return (
    <>
      {/* Section 1: Basic Information */}
      <FormSection 
        title="Tender Information" 
        icon="ri-file-list-3-line"
        headerStyle="primary"
      >
              <div className="col-md-12 mb-3">
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
                  placeholder="Select project for procurement"
                  isSearchable
                  isDisabled={loading}
                />
              </div>

              <div className="col-md-12 mb-3">
                <TextInput
                  label="Tender Title"
                  name="title"
                  value={state.title}
                  onChange={handleChange}
                  placeholder="Enter tender title"
                />
              </div>

              <div className="col-md-12 mb-3">
                <Textarea
                  label="Description"
                  name="description"
                  value={state.description || ""}
                  onChange={handleChange}
                  placeholder="Brief description of the procurement"
                  rows={4}
                />
              </div>

              <div className="col-md-12 mb-3">
                <Textarea
                  label="Technical Specifications"
                  name="technical_specifications"
                  value={state.technical_specifications || ""}
                  onChange={handleChange}
                  placeholder="Detailed technical requirements and specifications"
                  rows={6}
                />
              </div>

              <div className="col-md-12 mb-3">
                <Textarea
                  label="Scope of Work"
                  name="scope_of_work"
                  value={state.scope_of_work || ""}
                  onChange={handleChange}
                  placeholder="Detailed scope of work and deliverables"
                  rows={6}
                />
              </div>

              <div className="col-md-12 mb-3">
                <Textarea
                  label="Expected Deliverables"
                  name="deliverables"
                  value={state.deliverables || ""}
                  onChange={handleChange}
                  placeholder="List all expected deliverables"
                  rows={4}
                />
              </div>
      </FormSection>

      {/* Section 2: Timeline & Deadlines */}
      <FormSection 
        title="Timeline & Deadlines" 
        icon="ri-calendar-event-line"
        headerStyle="blue"
        width="half"
        height="full"
      >
              <div className="col-md-12 mb-3">
                <TextInput
                  label="Submission Deadline"
                  name="submission_deadline"
                  value={formatDateTimeForInput(state.submission_deadline)}
                  onChange={handleChange}
                  type="datetime"
                />
                <small className="text-muted">
                  Minimum 6 weeks for competitive bidding
                </small>
              </div>

              <div className="col-md-12 mb-3">
                <TextInput
                  label="Bid Opening Date"
                  name="opening_date"
                  value={formatDateTimeForInput(state.opening_date)}
                  onChange={handleChange}
                  type="datetime"
                />
                <small className="text-muted">
                  Must be after submission deadline
                </small>
              </div>

              <div className="col-md-12 mb-3">
                <TextInput
                  label="Opening Location"
                  name="opening_location"
                  value={state.opening_location || ""}
                  onChange={handleChange}
                  placeholder="Venue for public bid opening"
                />
              </div>

              <div className="col-md-12 mb-3">
                <TextInput
                  label="Pre-Bid Meeting Date"
                  name="pre_bid_meeting_date"
                  value={formatDateTimeForInput(state.pre_bid_meeting_date)}
                  onChange={handleChange}
                  type="datetime"
                />
              </div>

              <div className="col-md-12 mb-3">
                <TextInput
                  label="Pre-Bid Meeting Location"
                  name="pre_bid_meeting_location"
                  value={state.pre_bid_meeting_location || ""}
                  onChange={handleChange}
                  placeholder="Venue for pre-bid meeting"
                />
              </div>
      </FormSection>

      {/* Section 3: Financial & Evaluation */}
      <FormSection 
        title="Financial & Evaluation" 
        icon="ri-money-dollar-circle-line"
        headerStyle="yellow"
        width="half"
        height="full"
      >
              <div className="col-md-12 mb-3">
                <TextInput
                  label="Estimated Contract Value (₦)"
                  name="estimated_contract_value"
                  value={state.estimated_contract_value || ""}
                  onChange={handleChange}
                  type="number"
                  placeholder="Enter estimated contract value"
                />
              </div>

              {/* Bid Security Section - Redesigned */}
              <ToggleCard
                title="Bid Security"
                description="Require vendors to submit bid security (guarantee/bond)"
                icon="ri-shield-check-line"
                checked={state.bid_security_required}
                onChange={(checked) => {
                  if (setState) {
                    setState((prev) => ({ ...prev, bid_security_required: checked }));
                  }
                }}
                checkedLabel="Required"
                uncheckedLabel="Optional"
              />

              {state.bid_security_required && (
                <div className="col-md-12 mb-3">
                  <TextInput
                    label="Bid Security Amount (₦)"
                    name="bid_security_amount"
                    value={state.bid_security_amount || ""}
                    onChange={handleChange}
                    type="number"
                    placeholder="Enter bid security amount (typically 1-2% of bid value)"
                  />
                  <small className="text-muted">
                    Common practice: 1-2% of estimated contract value
                  </small>
                </div>
              )}

              <div className="col-md-6 mb-3">
                <TextInput
                  label="Technical Weight (%)"
                  name="technical_weight"
                  value={state.technical_weight}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  max="100"
                />
              </div>

              <div className="col-md-6 mb-3">
                <TextInput
                  label="Financial Weight (%)"
                  name="financial_weight"
                  value={state.financial_weight}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  max="100"
                />
              </div>

              <div className="col-md-12">
                <div className="alert alert-info mb-0">
                  <small>
                    <i className="ri-information-line me-1"></i>
                    Technical + Financial weights must equal 100%
                  </small>
                </div>
              </div>
      </FormSection>
    </>
  );
};

export default ProjectBidInvitation;

