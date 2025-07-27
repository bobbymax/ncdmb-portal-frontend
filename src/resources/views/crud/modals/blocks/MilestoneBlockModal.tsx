import useFormOnChangeEvents from "app/Hooks/useFormOnChangeEvents";
import { MilestoneResponseData } from "@/app/Repositories/Milestone/data";
import { ProjectResponseData } from "@/app/Repositories/Project/data";
import { BlockModalProps, useModal } from "app/Context/ModalContext";
import React, { useEffect, useMemo } from "react";
import Textarea from "resources/views/components/forms/Textarea";
import TextInput from "resources/views/components/forms/TextInput";
import Select from "resources/views/components/forms/Select";
import Button from "resources/views/components/forms/Button";
import _ from "lodash";

export type MilestoneBlockProps = {
  project: ProjectResponseData;
  totalPercentage: number;
};

export type MilestoneExtraProps = {
  extras: MilestoneBlockProps;
};

const MilestoneBlockModal: React.FC<BlockModalProps<"milestone">> = ({
  type,
  data,
  isUpdating,
  addBlockComponent,
  dependencies,
}) => {
  const { getModalState } = useModal();
  const milestoneState: MilestoneResponseData = getModalState(type);
  const { state, handleChange, setState } =
    useFormOnChangeEvents(milestoneState);
  const { totalPercentage } = useMemo(() => {
    const { extras = {} } = (dependencies ?? {}) as MilestoneExtraProps;
    const extraObjs = extras as MilestoneBlockProps;

    return {
      project: extraObjs.project ?? null,
      totalPercentage: extraObjs.totalPercentage ?? 0,
    };
  }, [dependencies]);

  useEffect(() => {
    if (data) {
      setState((prev) => ({
        ...prev,
        ...(data as MilestoneResponseData),
      }));
    }
  }, [data]);

  return (
    <div className="row">
      <div className="col-md-12 mb-3">
        <Textarea
          value={state.description}
          onChange={handleChange}
          name="description"
          rows={4}
          placeholder="Description"
          label="Description"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          value={state.percentage_completion}
          onChange={handleChange}
          name="percentage_completion"
          placeholder="0"
          label="% Completion"
          type="number"
          min={0}
          max={100 - totalPercentage}
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          value={state.duration}
          onChange={handleChange}
          name="duration"
          placeholder="0"
          label="Duration"
          type="number"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Frequency"
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          valueKey="value"
          labelKey="label"
          value={state.frequency}
          name="frequency"
          options={[
            { value: "days", label: "Days" },
            { value: "weeks", label: "Weeks" },
            { value: "months", label: "Months" },
            { value: "years", label: "Years" },
          ]}
          isDisabled={!state.duration}
          size="sm"
        />
      </div>
      <div className="col-md-12 mb-3">
        <Button
          label={`${isUpdating ? "Update" : "Add"} Milestone`}
          icon="ri-add-box-line"
          size="sm"
          handleClick={() => {
            addBlockComponent(state, isUpdating ? "update" : "store");
          }}
          isDisabled={
            _.isEmpty(state) ||
            !state.description ||
            state.description === "" ||
            !state.percentage_completion ||
            state.percentage_completion < 1 ||
            !state.duration ||
            state.duration < 1 ||
            !state.frequency
          }
        />
      </div>
    </div>
  );
};

export default MilestoneBlockModal;
