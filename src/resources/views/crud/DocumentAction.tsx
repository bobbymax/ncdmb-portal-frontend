import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import Textarea from "../components/forms/Textarea";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import { StageCategoryResponseData } from "app/Repositories/StageCategory/data";

interface DependencyProps {
  stageCategories: StageCategoryResponseData[];
}

const DocumentAction: React.FC<
  FormPageComponentProps<DocumentActionResponseData>
> = ({ state, handleChange, loading, dependencies }) => {
  const [categories, setCategories] = useState<StageCategoryResponseData[]>([]);

  useEffect(() => {
    if (dependencies) {
      const { stageCategories = [] } = dependencies as DependencyProps;

      setCategories(stageCategories);
    }
  }, [dependencies]);

  return (
    <>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Action Name"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Button Text"
          name="button_text"
          value={state.button_text}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Button Text"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Button Icon"
          name="icon"
          value={state.icon}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Button Icon"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Workflow Stage Category"
          name="workflow_stage_category_id"
          value={state.workflow_stage_category_id}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="id"
          labelKey="name"
          options={categories}
          defaultValue=""
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Button Variant"
          name="variant"
          value={state.variant}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "primary", label: "Primary" },
            { value: "success", label: "Success" },
            { value: "danger", label: "Danger" },
            { value: "warning", label: "Warning" },
            { value: "info", label: "Info" },
            { value: "dark", label: "Dark" },
          ]}
          defaultValue=""
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Button Status"
          name="status"
          value={state.status}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Button Status"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Progress Status"
          name="process_status"
          value={state.process_status}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "next", label: "Next Stage" },
            { value: "stall", label: "Stall Process" },
            { value: "goto", label: "Go to Stage" },
            { value: "end", label: "End Process" },
            { value: "complete", label: "Close Process" },
          ]}
          defaultValue=""
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-12 mb-3">
        <Textarea
          label="Description"
          name="description"
          value={state.description}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Category Description"
          rows={4}
        />
      </div>
    </>
  );
};

export default DocumentAction;
