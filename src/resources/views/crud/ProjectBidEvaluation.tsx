import { ProjectBidEvaluationResponseData } from "app/Repositories/ProjectBidEvaluation/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useMemo } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import Select from "../components/forms/Select";
import FormSection from "../components/forms/FormSection";

interface DependencyProps {
  projectBids: any[];
  users: any[];
}

const ProjectBidEvaluation: React.FC<
  FormPageComponentProps<ProjectBidEvaluationResponseData>
> = ({ state, setState, handleChange, dependencies, loading }) => {
  const { projectBids = [], users = [] } = useMemo(
    () => dependencies as DependencyProps,
    [dependencies]
  );

  return (
    <>
      {/* Section 1: Evaluation Details */}
      <FormSection 
        title="Evaluation Information" 
        icon="ri-file-list-line"
        headerStyle="primary"
      >
              <div className="col-md-6 mb-3">
                <MultiSelect
                  label="Bid"
                  options={formatOptions(projectBids, "id", "bid_reference")}
                  value={
                    state.project_bid_id
                      ? {
                          value: state.project_bid_id,
                          label:
                            projectBids.find(
                              (b) => b.id === state.project_bid_id
                            )?.bid_reference || "",
                        }
                      : null
                  }
                  onChange={(newValue) => {
                    const value = newValue as DataOptionsProps;
                    if (setState) {
                      setState((prev) => ({
                        ...prev,
                        project_bid_id: value?.value ?? 0,
                      }));
                    }
                  }}
                  placeholder="Select bid to evaluate"
                  isSearchable
                  isDisabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <Select
                  label="Evaluation Type"
                  name="evaluation_type"
                  valueKey="value"
                  labelKey="label"
                  value={state.evaluation_type}
                  onChange={handleChange}
                  defaultValue=""
                  defaultCheckDisabled
                  options={[
                    { value: "administrative", label: "Administrative Check" },
                    { value: "technical", label: "Technical Evaluation" },
                    { value: "financial", label: "Financial Evaluation" },
                    {
                      value: "post_qualification",
                      label: "Post-Qualification",
                    },
                  ]}
                />
              </div>

              <div className="col-md-6 mb-3">
                <TextInput
                  label="Total Score"
                  name="total_score"
                  value={state.total_score || ""}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter total score"
                />
              </div>

              <div className="col-md-6 mb-3">
                <Select
                  label="Pass/Fail"
                  name="pass_fail"
                  valueKey="value"
                  labelKey="label"
                  value={state.pass_fail || ""}
                  onChange={handleChange}
                  defaultValue=""
                  defaultCheckDisabled
                  options={[
                    { value: "pass", label: "✅ Pass" },
                    { value: "fail", label: "❌ Fail" },
                    { value: "conditional", label: "⚠️ Conditional" },
                  ]}
                />
              </div>

              <div className="col-md-12 mb-3">
                <Textarea
                  label="Comments"
                  name="comments"
                  value={state.comments || ""}
                  onChange={handleChange}
                  placeholder="Enter evaluation comments and observations"
                  rows={4}
                />
              </div>

              <div className="col-md-12 mb-3">
                <Textarea
                  label="Recommendations"
                  name="recommendations"
                  value={state.recommendations || ""}
                  onChange={handleChange}
                  placeholder="Enter recommendations for decision-makers"
                  rows={3}
                />
              </div>
      </FormSection>
    </>
  );
};

export default ProjectBidEvaluation;

