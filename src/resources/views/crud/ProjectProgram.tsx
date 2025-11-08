import { ProjectProgramResponseData } from "app/Repositories/ProjectProgram/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useMemo } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import Select from "../components/forms/Select";
import { formatOptions } from "app/Support/Helpers";
import { formatDateForInput } from "app/Support/DateHelpers";
import FormSection from "../components/forms/FormSection";
import { DepartmentResponseData } from "@/app/Repositories/Department/data";
import { ProjectCategoryResponseData } from "@/app/Repositories/ProjectCategory/data";

interface DependencyProps {
  departments: DepartmentResponseData[];
  projectCategories: ProjectCategoryResponseData[];
}

const ProjectProgram: React.FC<
  FormPageComponentProps<ProjectProgramResponseData>
> = ({ state, setState, handleChange, dependencies, loading, mode }) => {
  const { departments = [], projectCategories = [] } = useMemo(
    () => dependencies as DependencyProps,
    [dependencies]
  );

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <FormSection title="Basic Information" icon="ri-information-line">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Program Title"
            name="title"
            value={state.title}
            onChange={handleChange}
            placeholder="Enter program title"
            isDisabled={loading}
          />

          <TextInput
            label="Program Code"
            name="code"
            value={state.code}
            onChange={handleChange}
            isDisabled={true}
            placeholder="Auto-generated"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Textarea
            label="Description"
            name="description"
            value={state.description}
            onChange={handleChange}
            placeholder="Enter program description"
            isDisabled={loading}
            rows={4}
          />
        </div>
      </FormSection>

      {/* Organization */}
      <FormSection title="Organization" icon="ri-building-line">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Department"
            name="department_id"
            valueKey="value"
            labelKey="label"
            value={state.department_id}
            onChange={handleChange}
            defaultValue=""
            defaultCheckDisabled
            options={formatOptions(departments, "id", "name")}
            isDisabled={loading}
          />

          <Select
            label="Ministry"
            name="ministry_id"
            valueKey="value"
            labelKey="label"
            value={state.ministry_id || ""}
            onChange={handleChange}
            defaultValue=""
            defaultCheckDisabled
            options={formatOptions(departments, "id", "name")}
            isDisabled={loading}
          />

          <Select
            label="Category"
            name="project_category_id"
            valueKey="value"
            labelKey="label"
            value={state.project_category_id || ""}
            onChange={handleChange}
            defaultValue=""
            defaultCheckDisabled
            options={formatOptions(projectCategories, "id", "name")}
            isDisabled={loading}
          />
        </div>
      </FormSection>

      {/* Timeline */}
      <FormSection title="Timeline" icon="ri-calendar-line">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Planned Start Date"
            name="planned_start_date"
            type="date"
            value={formatDateForInput(state.planned_start_date)}
            onChange={handleChange}
            isDisabled={loading}
          />

          <TextInput
            label="Planned End Date"
            name="planned_end_date"
            type="date"
            value={formatDateForInput(state.planned_end_date)}
            onChange={handleChange}
            isDisabled={loading}
          />
        </div>
      </FormSection>

      {/* Classification */}
      <FormSection title="Classification" icon="ri-flag-line">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Priority"
            name="priority"
            value={state.priority}
            onChange={handleChange}
            valueKey="value"
            labelKey="label"
            defaultValue=""
            defaultCheckDisabled
            options={[
              { value: "critical", label: "Critical" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
            isDisabled={loading}
          />

          <Select
            label="Status"
            name="status"
            value={state.status}
            onChange={handleChange}
            valueKey="value"
            labelKey="label"
            defaultValue=""
            defaultCheckDisabled
            options={[
              { value: "concept", label: "Concept" },
              { value: "approved", label: "Approved" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            isDisabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Textarea
            label="Strategic Alignment"
            name="strategic_alignment"
            value={state.strategic_alignment}
            onChange={handleChange}
            placeholder="How does this program align with strategic objectives?"
            isDisabled={loading}
            rows={3}
          />
        </div>
      </FormSection>

      {/* Progress Summary (Read-only in update mode) */}
      {mode === "update" && (
        <FormSection title="Progress Summary" icon="ri-line-chart-line">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">Total Phases</div>
              <div className="text-2xl font-bold text-gray-900">
                {state.total_phases || 0}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">Active Phases</div>
              <div className="text-2xl font-bold text-blue-600">
                {state.active_phases || 0}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">Completed Phases</div>
              <div className="text-2xl font-bold text-green-600">
                {state.completed_phases || 0}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">Total Estimated</div>
              <div className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                }).format(state.total_estimated_amount || 0)}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">Overall Progress</div>
              <div className="text-xl font-bold text-blue-600">
                {state.overall_progress_percentage || 0}%
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">Overall Health</div>
              <div
                className={`text-xl font-bold ${
                  state.overall_health === "on-track"
                    ? "text-green-600"
                    : state.overall_health === "at-risk"
                    ? "text-yellow-600"
                    : state.overall_health === "critical"
                    ? "text-red-600"
                    : "text-purple-600"
                }`}
              >
                {state.overall_health}
              </div>
            </div>
          </div>
        </FormSection>
      )}
    </div>
  );
};

export default ProjectProgram;
