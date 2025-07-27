import React, { useCallback, useState } from "react";
import { DocumentBuilderComponentProps } from "../../DocumentBuilder";
import ProjectRepository from "@/app/Repositories/Project/ProjectRepository";
import { ProjectResponseData } from "@/app/Repositories/Project/data";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";

const ProjectDocumentGenerator: React.FC<
  DocumentBuilderComponentProps<ProjectRepository, ProjectResponseData>
> = ({
  repo,
  service,
  collection: projects,
  plug,
  category,
  state,
  setState,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{
    project: DataOptionsProps | null;
  }>({
    project: null,
  });

  const [project, setProject] = useState<ProjectResponseData | null>(null);

  const handleSelectionChange = useCallback(
    (key: "project") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;
        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
        const selectedProject =
          projects.find((project) => project.id === updatedValue.value) ?? null;

        if (key === "project") {
          setProject(selectedProject);
          setState((prev) => ({
            ...prev,
            documentable_id: updatedValue.value,
          }));
        }

        if (selectedProject && plug) {
          plug(selectedProject);
        }
      },
    [projects, setState, plug]
  );

  return (
    <div className="document__generator__container">
      <div className="row">
        <div className="col-md-12 mb-4">
          <MultiSelect
            label="Projects"
            options={formatOptions(projects, "id", "title")}
            value={selectedOptions.project}
            onChange={handleSelectionChange("project")}
            placeholder="Resource"
            isSearchable
            isDisabled={loading}
          />
        </div>
        <div className="col-md-12 mb-4">
          <div className="project__display__card">
            {project ? (
              <div className="project__card">
                <div className="project__card__header">
                  <i className="ri-briefcase-line"></i>
                  <span className="project__card__title">Selected Project</span>
                </div>
                <div className="project__card__content">
                  <div className="project__card__code">
                    <strong>Code:</strong> {project.code}
                  </div>
                  <div className="project__card__title_text">
                    <strong>Title:</strong> {project.title}
                  </div>
                  <div className="project__card__description">
                    <strong>Description:</strong>{" "}
                    {project.description || "No description"}
                  </div>
                  <div className="project__card__amounts">
                    <div className="project__card__amount">
                      <strong>Proposed Amount:</strong> ₦
                      {project.total_proposed_amount?.toLocaleString() || "0"}
                    </div>
                    <div className="project__card__amount">
                      <strong>Approved Amount:</strong> ₦
                      {project.total_approved_amount?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="project__card__dates">
                    <div className="project__card__date">
                      <strong>Start Date:</strong>{" "}
                      {project.approved_start_date ||
                        project.proposed_start_date ||
                        "Not set"}
                    </div>
                    <div className="project__card__date">
                      <strong>End Date:</strong>{" "}
                      {project.approved_end_date ||
                        project.proposed_end_date ||
                        "Not set"}
                    </div>
                  </div>
                  <div className="project__card__status">
                    <strong>Status:</strong>
                    <span
                      className={`status__badge status__${project.status?.toLowerCase()}`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="project__card__empty">
                <i className="ri-briefcase-line"></i>
                <p>No project selected</p>
                <span>Select a project to generate a document for</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentGenerator;
