import { ProjectResponseData } from "@/app/Repositories/Project/data";
import ProjectRepository from "@/app/Repositories/Project/ProjectRepository";
import { CardPageComponentProps } from "@/bootstrap";
import React, { useMemo } from "react";
import ProjectCard from "../components/pages/ProjectCard";

const Projects: React.FC<
  CardPageComponentProps<ProjectResponseData, ProjectRepository>
> = ({ Repository, collection: projects, onManageRawData, View }) => {
  const stats = useMemo(() => {
    const total = projects.length;
    const byPriority = projects.reduce((acc, p) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = projects.reduce((acc, p) => {
      acc[p.project_type] = (acc[p.project_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byPriority, byType };
  }, [projects]);

  return (
    <div className="projects-container">
      {/* Stats Overview */}
      <div className="projects-stats-bar">
        <div className="stat-item">
          <div
            className="stat-icon"
            style={{
              background:
                "linear-gradient(135deg, rgba(90, 146, 121, 0.1) 0%, rgba(76, 175, 80, 0.15) 100%)",
            }}
          >
            <i className="ri-folder-line" style={{ color: "#5a9279" }}></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <small className="stat-label">Total Projects</small>
          </div>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <div
            className="stat-icon"
            style={{
              background:
                "linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.15) 100%)",
            }}
          >
            <i
              className="ri-error-warning-line"
              style={{ color: "#dc3545" }}
            ></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.byPriority.critical || 0}</span>
            <small className="stat-label">Critical</small>
          </div>
        </div>

        <div className="stat-item">
          <div
            className="stat-icon"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.15) 100%)",
            }}
          >
            <i
              className="ri-alarm-warning-line"
              style={{ color: "#ff9800" }}
            ></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.byPriority.high || 0}</span>
            <small className="stat-label">High Priority</small>
          </div>
        </div>

        <div className="stat-item">
          <div
            className="stat-icon"
            style={{
              background:
                "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.15) 100%)",
            }}
          >
            <i
              className="ri-checkbox-circle-line"
              style={{ color: "#4caf50" }}
            ></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.byPriority.medium || 0}</span>
            <small className="stat-label">Medium</small>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              data={project}
              handleAction={(id, action) => {
                if (action === "manage") {
                  onManageRawData(
                    project,
                    "manage",
                    `/desk/projects/${id}/manage`
                  );
                }
              }}
            />
          ))
        ) : (
          <div className="projects-empty-state">
            <i className="ri-folder-unknow-line"></i>
            <h5>No Projects Found</h5>
            <p>Get started by creating your first project</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
