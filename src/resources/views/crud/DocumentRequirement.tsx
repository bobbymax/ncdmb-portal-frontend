import { DocumentRequirementResponseData } from "app/Repositories/DocumentRequirement/data";
import { FormPageComponentProps } from "bootstrap";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import Textarea from "../components/forms/Textarea";

const DocumentRequirement: React.FC<
  FormPageComponentProps<DocumentRequirementResponseData>
> = ({ state, handleChange, loading }) => {
  return (
    <>
      <div className="col-md-8 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Requirement Name"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Priority"
          name="priority"
          value={state.priority}
          onChange={handleChange}
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
          defaultValue=""
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-12 mb-4">
        <Textarea
          label="Description"
          name="description"
          value={state.description}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Requirement Description"
          rows={5}
        />
      </div>
    </>
  );
};

export default DocumentRequirement;
