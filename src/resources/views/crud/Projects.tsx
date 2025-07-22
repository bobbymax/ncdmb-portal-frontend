import { ProjectResponseData } from "@/app/Repositories/Project/data";
import ProjectRepository from "@/app/Repositories/Project/ProjectRepository";
import { CardPageComponentProps } from "@/bootstrap";
import React from "react";
import projectIcon from "../../assets/images/projects.png";
import moment from "moment";
import Button from "../components/forms/Button";
import ProjectCard from "../components/pages/ProjectCard";

const Projects: React.FC<
  CardPageComponentProps<ProjectResponseData, ProjectRepository>
> = ({ Repository, collection: projects, onManageRawData, View }) => {
  return (
    <div className="projects__container">
      <div className="row">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="col-md-4 mb-3">
              <ProjectCard data={project} handleAction={() => {}} />
            </div>
          ))
        ) : (
          <p>No Projects Here!!</p>
        )}
      </div>
    </div>
  );
};

export default Projects;
