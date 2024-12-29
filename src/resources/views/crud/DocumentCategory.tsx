import { DocumentCategoryResponseData } from "app/Repositories/DocumentCategory/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import Textarea from "../components/forms/Textarea";
import TextInput from "../components/forms/TextInput";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import Select from "../components/forms/Select";

interface DependencyProps {
  documentTypes: DocumentTypeResponseData[];
}

const DocumentCategory: React.FC<
  FormPageComponentProps<DocumentCategoryResponseData>
> = ({ state, handleChange, loading, dependencies }) => {
  const [docTypes, setDocTypes] = useState<DocumentTypeResponseData[]>([]);

  useEffect(() => {
    if (dependencies) {
      const { documentTypes = [] } = dependencies as DependencyProps;
      setDocTypes(documentTypes);
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
          placeholder="Enter Document Category Name"
        />
      </div>

      <div className="col-md-4 mb-3">
        <Select
          label="Document Type"
          name="document_type_id"
          value={state.document_type_id}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="id"
          labelKey="name"
          options={docTypes}
          defaultValue={0}
          defaultCheckDisabled
        />
      </div>

      <div className="col-md-4 mb-3">
        <TextInput
          label="Icon"
          name="icon"
          value={state.icon}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Category Icon"
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

export default DocumentCategory;
