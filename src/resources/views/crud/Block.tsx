import { BlockResponseData } from "app/Repositories/Block/data";
import { FormPageComponentProps } from "bootstrap";
import React from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
// import Button from "../components/forms/Button";

const Block: React.FC<FormPageComponentProps<BlockResponseData>> = ({
  state,
  handleChange,
}) => {
  return (
    <>
      <div className="col-md-5 mb-3">
        <TextInput
          label="Title"
          name="title"
          value={state.title}
          onChange={handleChange}
          placeholder="Enter Title"
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Max Words"
          name="max_words"
          type="number"
          value={state.max_words}
          onChange={handleChange}
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Icon"
          name="icon"
          value={state.icon}
          onChange={handleChange}
          placeholder="Enter Icon Here"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Data Type"
          name="data_type"
          valueKey="value"
          labelKey="label"
          value={state.data_type}
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          defaultText="Data Type"
          options={[
            { value: "paragraph", label: "Paragraph" },
            { value: "purchase", label: "Purchase" },
            { value: "event", label: "Event" },
            { value: "milestone", label: "Milestone" },
            { value: "estacode", label: "Estacode" },
            { value: "invoice", label: "Invoice" },
            { value: "training", label: "Training" },
            { value: "posting", label: "Staff Move" },
            { value: "bullet", label: "Bullet List" },
            { value: "approval", label: "Approvals" },
          ]}
          size="sm"
        />
      </div>

      <div className="col-md-3 mb-3">
        <Select
          label="Input Block"
          name="input_type"
          valueKey="value"
          labelKey="label"
          value={state.input_type}
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          defaultText="Input Block"
          options={[
            { value: "ParagraphBlock", label: "Paragraph Block" },
            { value: "EventBlock", label: "Event Block" },
            { value: "MilestoneBlock", label: "Milestone Block" },
            { value: "FundBlock", label: "Fund Block" },
            { value: "TableBlock", label: "Table Block" },
            { value: "SignatureBlock", label: "Signature Block" },
            { value: "ListBlock", label: "List Block" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Category"
          name="type"
          valueKey="value"
          labelKey="label"
          value={state.type}
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          defaultText="Category"
          options={[
            { value: "staff", label: "Staff" },
            { value: "third-party", label: "Third Party" },
            { value: "document", label: "Document" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Deprecated"
          name="active"
          valueKey="value"
          labelKey="label"
          value={state.active}
          onChange={handleChange}
          defaultValue={999}
          defaultCheckDisabled
          defaultText="State"
          options={[
            { value: 0, label: "Yes" },
            { value: 1, label: "No" },
          ]}
          size="sm"
        />
      </div>
      {/* <div className="col-md-12 mt-3 mb">
        <small className="tip">
          If this block is a table, Please add the table headers here!!
        </small>

        <div className="row">
          <div className="col-md-12 mb-3">
            <Button
              label="Add Header Option"
              handleClick={() => {}}
              icon="ri-grid-line"
              variant="info"
              size="sm"
            />
          </div>
        </div>
      </div> */}
    </>
  );
};

export default Block;
