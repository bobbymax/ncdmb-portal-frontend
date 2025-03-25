import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import Textarea from "../components/forms/Textarea";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import { StageCategoryResponseData } from "app/Repositories/StageCategory/data";
import { CarderResponseData } from "app/Repositories/Carder/data";

interface DependencyProps {
  stageCategories: StageCategoryResponseData[];
  carders: CarderResponseData[];
}

const DocumentAction: React.FC<
  FormPageComponentProps<DocumentActionResponseData>
> = ({ state, handleChange, loading, dependencies }) => {
  const [categories, setCategories] = useState<StageCategoryResponseData[]>([]);
  const [carders, setCarders] = useState<CarderResponseData[]>([]);

  useEffect(() => {
    if (dependencies) {
      const { stageCategories = [], carders = [] } =
        dependencies as DependencyProps;

      setCategories(stageCategories);
      setCarders(carders);
    }
  }, [dependencies]);

  return (
    <>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Action Name"
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Button Text"
          name="button_text"
          value={state.button_text}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Button Text"
        />
      </div>
      <div className="col-md-3 mb-3">
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
        <TextInput
          label="Document Status"
          name="draft_status"
          value={state.draft_status}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Status"
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
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Action Status"
          name="action_status"
          value={state.action_status}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "passed", label: "Pass" },
            { value: "failed", label: "Reject" },
            { value: "attend", label: "Needs Attention" },
            { value: "appeal", label: "Appeal" },
            { value: "stalled", label: "Stall" },
            { value: "cancelled", label: "Cancel Process" },
            { value: "reversed", label: "Reverse Last Draft" },
            { value: "complete", label: "Complete" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="State"
          name="state"
          value={state.state}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "conditional", label: "Conditional" },
            { value: "fixed", label: "Fixed" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Mode"
          name="mode"
          value={state.mode}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "store", label: "Store" },
            { value: "update", label: "Update" },
            { value: "destroy", label: "Destroy" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Update Draft"
          name="has_update"
          value={state.has_update}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: 0, label: "No" },
            { value: 1, label: "Yes" },
          ]}
          defaultValue={999}
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Access Level"
          name="carder_id"
          value={state.carder_id}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="id"
          labelKey="name"
          options={carders}
          defaultValue={0}
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Resource Type"
          name="resource_type"
          value={state.resource_type}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "searchable", label: "Searchable" },
            { value: "classified", label: "Classified" },
            { value: "private", label: "Private" },
            { value: "archived", label: "Archived" },
            { value: "computed", label: "Computed" },
            { value: "generated", label: "Generated" },
            { value: "report", label: "Report" },
            { value: "other", label: "Other" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Action Category"
          name="category"
          value={state.category}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "signature", label: "Signature" },
            { value: "comment", label: "Comment" },
            { value: "template", label: "Template" },
            { value: "resource", label: "Resource" },
            { value: "request", label: "Request" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-8 mb-3">
        <TextInput
          label="Action Component"
          name="component"
          value={state.component}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Action Component"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Is Resource"
          name="is_resource"
          value={state.is_resource}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: 0, label: "No" },
            { value: 1, label: "Yes" },
          ]}
          defaultValue={999}
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-12 mb-3">
        <Textarea
          label="Message"
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
