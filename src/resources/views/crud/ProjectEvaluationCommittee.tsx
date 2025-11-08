import { ProjectEvaluationCommitteeResponseData } from "app/Repositories/ProjectEvaluationCommittee/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useMemo } from "react";
import TextInput from "../components/forms/TextInput";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import Select from "../components/forms/Select";
import FormSection from "../components/forms/FormSection";

interface DependencyProps {
  projects: any[];
  users: any[];
}

const ProjectEvaluationCommittee: React.FC<
  FormPageComponentProps<ProjectEvaluationCommitteeResponseData>
> = ({ state, setState, handleChange, dependencies, loading }) => {
  const { projects = [], users = [] } = useMemo(
    () => dependencies as DependencyProps,
    [dependencies]
  );

  return (
    <>
      {/* Section 1: Committee Information */}
      <FormSection 
        title="Committee Information" 
        icon="ri-group-line"
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
                  placeholder="Select project"
                  isSearchable
                  isDisabled={loading}
                />
              </div>

              <div className="col-md-12 mb-3">
                <TextInput
                  label="Committee Name"
                  name="committee_name"
                  value={state.committee_name}
                  onChange={handleChange}
                  placeholder="Enter committee name"
                />
              </div>

              <div className="col-md-6 mb-3">
                <Select
                  label="Committee Type"
                  name="committee_type"
                  valueKey="value"
                  labelKey="label"
                  value={state.committee_type}
                  onChange={handleChange}
                  defaultValue=""
                  defaultCheckDisabled
                  options={[
                    { value: "tender_board", label: "Tenders Board" },
                    { value: "technical", label: "Technical Committee" },
                    { value: "financial", label: "Financial Committee" },
                    { value: "opening", label: "Bid Opening Committee" },
                  ]}
                />
              </div>

              <div className="col-md-6 mb-3">
                <MultiSelect
                  label="Chairman"
                  options={formatOptions(users, "id", "name")}
                  value={
                    state.chairman_id
                      ? {
                          value: state.chairman_id,
                          label:
                            users.find((u) => u.id === state.chairman_id)
                              ?.name || "",
                        }
                      : null
                  }
                  onChange={(newValue) => {
                    const value = newValue as DataOptionsProps;
                    if (setState) {
                      setState((prev) => ({
                        ...prev,
                        chairman_id: value?.value ?? 0,
                      }));
                    }
                  }}
                  placeholder="Select committee chairman"
                  isSearchable
                  isDisabled={loading}
                />
              </div>

              <div className="col-md-12">
                <div className="alert alert-info mb-0">
                  <small>
                    <i className="ri-information-line me-1"></i>
                    Committee members can be added after creation
                  </small>
                </div>
              </div>
      </FormSection>
    </>
  );
};

export default ProjectEvaluationCommittee;

