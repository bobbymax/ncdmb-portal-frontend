import React, { useCallback, useEffect, useState } from "react";
import { BlockContentComponentPorps } from ".";
import { BlockDataType } from "app/Repositories/Block/data";
import Button from "resources/views/components/forms/Button";
import {
  TableContentAreaHeaderProps,
  TableContentAreaProps,
  TableContentAreaRowProps,
} from "app/Hooks/useBuilder";
import { useModal } from "app/Context/ModalContext";
import useClaimCalculator from "app/Hooks/useClaimCalculator";
import { formatOptions } from "app/Support/Helpers";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import useDirectories from "app/Hooks/useDirectories";
import { repo } from "bootstrap/repositories";
import DynamicTableBuilder from "../builders/DynamicTableBuilder";
import { ActionMeta } from "react-select";
import TextInput from "resources/views/components/forms/TextInput";
import Select from "resources/views/components/forms/Select";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";
import { ExpenseResponseData } from "app/Repositories/Expense/data";
import RowBlockModal, {
  CalculatorStateProps,
} from "../../modals/blocks/RowBlockModal";
import _ from "lodash";
import { UserResponseData } from "@/app/Repositories/User/data";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";

const trainingHeaders: TableContentAreaHeaderProps[] = [
  {
    id: "name-flag",
    display_name: "Name",
    column: "name",
    endpoint_column: "name",
    value: "",
    format: "text",
    currency: "NA",
    type: "list",
    input_field: "multi-select",
    compute_column: "",
    placeholder: "Staff",
    editable: false,
    computeable: false,
  },
  {
    id: "grade-level-flag",
    display_name: "Grade Level",
    column: "grade_level",
    endpoint_column: "grade_level",
    value: "",
    format: "text",
    currency: "NA",
    type: "list",
    input_field: "text",
    compute_column: "",
    placeholder: "Grade Level",
    editable: false,
    computeable: false,
  },
  {
    id: "amount-flag",
    display_name: "Amount",
    column: "amount",
    endpoint_column: "amount",
    value: "",
    format: "currency",
    currency: "NGN",
    type: "total",
    input_field: "text",
    compute_column: "amount",
    placeholder: "Grade Level",
    editable: false,
    computeable: true,
  },
];

export type UserTrainingTableMetaDataProps = {
  user_id: number;
  grade_level_id: number;
  remunerations: RemunerationResponseData[];
  department_id: number;
  staff_no: string | number;
  expenses: ExpenseResponseData[];
  user_current_location: DataOptionsProps | null;
  mode: "flight" | "road";
  amount: number;
};

export type RemunerationResultProp = {
  distance: number;
  expenses: ExpenseResponseData[];
  total: number;
};

const TrainingBlock: React.FC<BlockContentComponentPorps> = ({
  localContentState,
  updateLocal,
  blockId,
}) => {
  const { state, actions } = useTemplateBoard();
  const userRepo = repo("user");
  const { openBlock, closeModal } = useModal();
  const { collection: users } = useDirectories(userRepo, "users");
  const { cities } = useClaimCalculator();
  const identifier: BlockDataType = "training";

  // Find the current block content from global state
  const currentBlock = state.contents.find((content) => content.id === blockId);
  const currentContent = currentBlock?.content?.table as TableContentAreaProps;

  const [localState, setLocalState] = useState<TableContentAreaProps>({
    filter: "none",
    compute: "remunerations",
    type: "input",
    headers: [],
    rows: [],
    source: "users",
  });

  const [calcState, setCalcState] = useState<CalculatorStateProps>({
    destination: null,
    isResident: false,
    start_date: "",
    end_date: "",
    residence: "non-residence",
    route: "return",
  });

  const handleSelectionChange = useCallback(
    (key: "destination") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;
        setCalcState((prev) => ({ ...prev, [key]: updatedValue }));
      },
    []
  );

  const handleBlockChange = (detail: unknown) => {
    const updatedRows = [
      detail as TableContentAreaRowProps,
      ...localState.rows,
    ];
    const updatedState: TableContentAreaProps = {
      ...localState,
      rows: updatedRows,
    };

    setLocalState(updatedState);

    // Update global state directly
    if (currentBlock) {
      actions.updateContent(currentBlock.id, updatedState, "table");
    }

    // Also update local state in parent for compatibility
    updateLocal(updatedState, "table");

    closeModal();
  };

  const addStaffToList = () => {
    openBlock(
      RowBlockModal,
      {
        title: "Nominate Staff",
        type: identifier,
        blockState: localState,
        isUpdating: false,
        addBlockComponent: handleBlockChange,
        dependencies: {
          partials: [],
          extras: {
            users,
            calcState,
            cities,
          },
        },
      },
      identifier
    );
  };

  useEffect(() => {
    setLocalState((prev) => ({
      ...prev,
      headers: trainingHeaders,
    }));
  }, []);

  useEffect(() => {
    if (currentContent) {
      setLocalState((prev) => ({
        ...prev,
        ...currentContent,
      }));
    } else if (
      localContentState?.table &&
      !_.isEmpty(localContentState.table)
    ) {
      setLocalState((prev) => ({
        ...prev,
        ...localContentState.table,
      }));
    }
  }, [currentContent, localContentState?.table]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isDisabled: boolean = false,
    grid: number = 12,
    description: string = ""
  ) => (
    <div className={`col-md-${grid} mb-3`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={isDisabled}
        description={description}
      />
    </div>
  );

  return (
    <div className="table__block__area mt-4 mb-4">
      <div className="row">
        {renderMultiSelect(
          "Destination",
          formatOptions(cities, "id", "name"),
          calcState.destination,
          handleSelectionChange("destination"),
          "State"
        )}

        <div className="col-md-6 mb-3">
          <TextInput
            label="Start Date"
            name="start_date"
            value={calcState.start_date}
            onChange={(e) =>
              setCalcState((prev) => ({
                ...prev,
                start_date: e.target.value,
              }))
            }
            type="date"
          />
        </div>
        <div className="col-md-6 mb-3">
          <TextInput
            label="End Date"
            name="end_date"
            type="date"
            value={calcState.end_date}
            onChange={(e) =>
              setCalcState((prev) => ({
                ...prev,
                end_date: e.target.value,
              }))
            }
          />
        </div>

        <div className="col-md-12 mb-3">
          <Select
            label="Resident Event"
            valueKey="value"
            labelKey="label"
            value={calcState.residence}
            onChange={(e) =>
              setCalcState((prev) => ({
                ...prev,
                residence: e.target.value as "residence" | "non-residence",
                isResident: e.target.value === "residence",
              }))
            }
            options={[
              { value: "residence", label: "Resident" },
              { value: "non-residence", label: "Non Resident" },
            ]}
            defaultValue=""
            defaultCheckDisabled
            size="sm"
          />
        </div>

        <div className="constraint">
          {calcState.destination &&
            calcState.start_date &&
            calcState.end_date && (
              <Button
                label="Add Staff"
                size="sm"
                icon="ri-user-add-line"
                handleClick={addStaffToList}
                variant="dark"
              />
            )}
        </div>
      </div>

      {/* {preview && (
        <DynamicTableBuilder
          headers={state.headers}
          rows={sharedContentState.rows}
        />
      )} */}
    </div>
  );
};

export default TrainingBlock;
