import { StageCategoryResponseData } from "app/Repositories/StageCategory/data";
import { FormPageComponentProps } from "bootstrap";
import React, { ChangeEvent, useCallback } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";

const StageCategory: React.FC<
  FormPageComponentProps<StageCategoryResponseData>
> = ({ state, setState, handleChange, loading }) => {
  const handleFileUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const file = e.target.files[0];

        if (setState) {
          setState((prev) => ({
            ...prev,
            icon_path_blob: file,
          }));
        }
      }
    },
    [setState]
  );
  return (
    <>
      <div className="col-md-12">
        <div className="row">
          <div className="col-md-6 mb-3">
            <TextInput
              label="Name"
              name="name"
              value={state.name}
              onChange={handleChange}
              placeholder="Enter Category Name"
              isDisabled={loading}
            />
          </div>
          <div className="col-md-6 mb-3">
            <TextInput
              label="Upload Icon"
              name="icon_path_blob"
              type="file"
              // value={state.icon_path_blob}
              onChange={handleFileUpload}
              isDisabled={loading}
            />
          </div>
          <div className="col-md-12 mb-3">
            <Textarea
              label="Description"
              name="description"
              value={state.description}
              onChange={handleChange}
              rows={5}
              placeholder="Enter Category Description"
              isDisabled={loading}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default StageCategory;
