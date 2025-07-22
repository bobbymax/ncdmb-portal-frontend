import { ProjectCategoryResponseData } from "app/Repositories/ProjectCategory/data";
import { FormPageComponentProps } from "bootstrap";
import React from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";

const ProjectCategory: React.FC<
  FormPageComponentProps<ProjectCategoryResponseData>
> = ({ state, handleChange, dependencies }) => {
  return (
    <>
      <div className="col-md-12 mb-3">
        <TextInput
          label="Name"
          value={state.name}
          name="name"
          onChange={handleChange}
          placeholder="Enter Project Category Name"
        />
      </div>
      <div className="col-md-12 mb-3">
        <Textarea
          name="description"
          value={state.description}
          label="Description"
          onChange={handleChange}
          rows={3}
          placeholder="Enter Description Here!!!"
        />
      </div>
    </>
  );
};

export default ProjectCategory;
