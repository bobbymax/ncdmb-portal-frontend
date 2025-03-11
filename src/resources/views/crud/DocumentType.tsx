import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import { FileTemplateResponseData } from "app/Repositories/FileTemplate/data";
import Select from "../components/forms/Select";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";

interface DependencyProps {
  templates: FileTemplateResponseData[];
  apiServices: string[];
}

const DocumentType: React.FC<
  FormPageComponentProps<DocumentTypeResponseData>
> = ({ state, setState, handleChange, loading, dependencies, mode }) => {
  const [templates, setTemplates] = useState<DataOptionsProps[]>([]);
  const [services, setServices] = useState<DataOptionsProps[]>([]);
  const [service, setService] = useState<DataOptionsProps | null>(null);

  const handleSelectionChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    const updatedValue = newValue as DataOptionsProps;

    // Update modal state dynamically
    if (setState) {
      setState((prev) => ({ ...prev, service: updatedValue.value }));
    }

    setService(updatedValue);
  };

  useEffect(() => {
    if (dependencies) {
      const services: DataOptionsProps[] = [];
      const { templates = [], apiServices = [] } =
        dependencies as DependencyProps;

      apiServices.map((serve) =>
        services.push({
          value: serve,
          label: serve.toUpperCase(),
        })
      );

      setTemplates([
        { value: 0, label: "None" },
        ...formatOptions(templates, "id", "name"),
      ]);
      setServices(services);
    }
  }, [dependencies]);

  useEffect(() => {
    if (mode === "update" && services.length > 0 && state.service !== "") {
      const service =
        services.find((serve) => serve.value === state.service) ?? null;
      setService(service);
    }
  }, [mode, services, state.service]);

  return (
    <>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Type Name"
        />
      </div>
      <div className="col-md-4 mb-3">
        <MultiSelect
          label="Api Services"
          options={services}
          value={service}
          onChange={handleSelectionChange}
          placeholder="Api Service"
          isSearchable
          isDisabled={loading}
        />
      </div>
      <div className="col-md-4 mb-3">
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
          size="sm"
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
