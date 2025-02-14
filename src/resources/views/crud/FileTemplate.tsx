import { FileTemplateResponseData } from "app/Repositories/FileTemplate/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";

const FileTemplate: React.FC<
  FormPageComponentProps<FileTemplateResponseData>
> = ({ state, handleChange, dependencies }) => {
  return (
    <>
      <div className="col-md-4 mb-3">
        <TextInput
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Template Name"
          label="Name"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          name="service"
          value={state.service}
          onChange={handleChange}
          placeholder="Enter Service Name"
          label="Service Name"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          name="component"
          value={state.component}
          onChange={handleChange}
          placeholder="Enter Component Name"
          label="Component"
        />
      </div>
      <div className="col-md-6 mb-3">
        <TextInput
          name="repository"
          value={state.repository}
          onChange={handleChange}
          placeholder="Enter Repository Name"
          label="Repository"
        />
      </div>
      <div className="col-md-6 mb-3">
        <TextInput
          name="response_data_format"
          value={state.response_data_format}
          onChange={handleChange}
          placeholder="Enter Response Data Component"
          label="Response Data"
        />
      </div>
      <div className="col-md-12 mb-3">
        <Textarea
          label="Tagline"
          name="tagline"
          value={state.tagline}
          onChange={handleChange}
          placeholder="Enter Tagline"
          rows={4}
        />
      </div>
    </>
  );
};

export default FileTemplate;
