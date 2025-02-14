import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import { FileTemplateResponseData } from "app/Repositories/FileTemplate/data";
import Select from "../components/forms/Select";
import { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";

interface DependencyProps {
  templates: FileTemplateResponseData[];
}

const DocumentType: React.FC<
  FormPageComponentProps<DocumentTypeResponseData>
> = ({ state, handleChange, loading, dependencies }) => {
  const [templates, setTemplates] = useState<DataOptionsProps[]>([]);

  useEffect(() => {
    if (dependencies) {
      const { templates = [] } = dependencies as DependencyProps;

      setTemplates([
        { value: 0, label: "None" },
        ...formatOptions(templates, "id", "name"),
      ]);
    }
  }, [dependencies]);

  return (
    <>
      <div className="col-md-7 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Type Name"
        />
      </div>
      <div className="col-md-5 mb-3">
        <Select
          label="Template"
          name="file_template_id"
          valueKey="value"
          labelKey="label"
          value={state.file_template_id}
          options={templates}
          onChange={handleChange}
          defaultValue={999}
          defaultCheckDisabled
          isDisabled={loading}
        />
      </div>
      <div className="col-md-12 mb-3">
        <Textarea
          label="Description"
          name="description"
          value={state.description}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Type Description"
          rows={4}
        />
      </div>
    </>
  );
};

export default DocumentType;
