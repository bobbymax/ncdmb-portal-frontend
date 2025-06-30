import { DocumentCategoryResponseData } from "app/Repositories/DocumentCategory/data";
import { TemplateResponseData } from "app/Repositories/Template/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import Select from "../components/forms/Select";
import TextInput from "../components/forms/TextInput";

interface DependencyProps {
  documentCategories: DocumentCategoryResponseData[];
}

const Template: React.FC<FormPageComponentProps<TemplateResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
}) => {
  const [documentCategories, setDocumentCategories] = useState<
    DocumentCategoryResponseData[]
  >([]);

  useEffect(() => {
    if (
      setState &&
      Number(state.document_category_id) > 0 &&
      documentCategories.length > 0
    ) {
      const category = documentCategories.find(
        (cat) => cat.id === Number(state.document_category_id)
      );

      if (category) {
        setState((prev) => ({
          ...prev,
          name: `${category.name} Template`,
        }));
      } else {
        console.log("what is wrong");
      }
    }
  }, [state.document_category_id, documentCategories]);

  useEffect(() => {
    if (dependencies) {
      const { documentCategories = [] } = dependencies as DependencyProps;

      setDocumentCategories(documentCategories);
    }
  }, [dependencies]);

  return (
    <>
      <div className="col-md-5 mb-3">
        <Select
          valueKey="id"
          labelKey="name"
          name="document_category_id"
          value={state.document_category_id}
          onChange={handleChange}
          options={documentCategories}
          defaultValue={0}
          defaultCheckDisabled
          label="Document Category"
          size="sm"
        />
      </div>
      <div className="col-md-7 mb-3">
        <Select
          valueKey="value"
          labelKey="label"
          name="header"
          value={state.header}
          onChange={handleChange}
          options={[
            { value: "memo", label: "Memo" },
            { value: "banner", label: "Banner" },
            { value: "resource", label: "Resource" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          label="Header Block"
          size="sm"
        />
      </div>
      <div className="col-md-7 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Name"
          isDisabled
        />
      </div>
      <div className="col-md-5 mb-3">
        <TextInput
          label="Footer Name"
          name="footer"
          value={state.footer}
          onChange={handleChange}
          placeholder="Enter Footer"
        />
      </div>
    </>
  );
};

export default Template;
