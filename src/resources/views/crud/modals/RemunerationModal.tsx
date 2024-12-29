import { useStateContext } from "app/Context/ContentContext";
import { ModalValueProps, useModal } from "app/Context/ModalContext";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";
import { generateRandomNumbers } from "app/Support/Helpers";
import React, { useEffect, useState } from "react";
import { ActionMeta } from "react-select";
import Button from "resources/views/components/forms/Button";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import TextInput from "resources/views/components/forms/TextInput";
import { ResponseSubmitData } from "../Allowance";

const RemunerationModal: React.FC<ModalValueProps> = ({
  title,
  data,
  isUpdating,
  dependencies,
  onSubmit,
  count,
  currentId,
}) => {
  const { getModalState, updateModalState } = useModal();
  const { isLoading } = useStateContext();
  const identifier = "remuneration";
  //   const state: RemunerationResponseData = getModalState(identifier);

  const [gradeLevels, setGradeLevels] = useState<DataOptionsProps[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<DataOptionsProps[]>([]);
  const [amount, setAmount] = useState("");

  //   console.log(state);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    updateModalState(identifier, { [name]: value });
  };

  const handleSubmit = () => {
    const mode = isUpdating ? "update" : "store";
    let uniqueId: number;

    if (isUpdating) {
      uniqueId = currentId ?? 0;
    } else {
      uniqueId = count ? count + 1 : 1;
    }

    const result: ResponseSubmitData = {
      id: uniqueId,
      gradeLevels: selectedGrades,
      amount,
    };

    onSubmit(result, mode);
  };

  const handleGradesChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    setSelectedGrades(newValue as DataOptionsProps[]);
  };

  useEffect(() => {
    if (dependencies && dependencies.length > 0) {
      setGradeLevels((dependencies[0] as DataOptionsProps[]) ?? []);
    }
  }, [dependencies]);

  useEffect(() => {
    if (data) {
      const raw = data as ResponseSubmitData;
      setAmount(raw.amount);
      setSelectedGrades(raw.gradeLevels);
    }
  }, [data]);

  return (
    <>
      <div className="col-md-12 mb-3">
        <MultiSelect
          label="Grade Levels"
          options={gradeLevels}
          value={selectedGrades}
          onChange={handleGradesChange}
          placeholder="Select Roles"
          isSearchable
          isMulti
          isDisabled={isLoading}
        />
      </div>

      <div className="col-md-12 mb-3">
        <TextInput
          label="Amount"
          name="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter Amount"
        />
      </div>

      <div className="col-md-12 mb-3">
        <Button
          label="Add Remuneration"
          icon="ri-apps-2-add-line"
          handleClick={handleSubmit}
          variant="dark"
          isDisabled={amount === "" || selectedGrades.length < 1}
          size="sm"
        />
      </div>
    </>
  );
};

export default RemunerationModal;
