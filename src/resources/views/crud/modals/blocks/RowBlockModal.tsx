import { BlockModalProps, useModal } from "app/Context/ModalContext";
import { TableContentAreaRowProps } from "app/Hooks/useBuilder";
import useClaimCalculator from "app/Hooks/useClaimCalculator";
import { CityResponseData } from "app/Repositories/City/data";
import { UserResponseData } from "app/Repositories/User/data";
import { formatCurrency, formatOptions } from "app/Support/Helpers";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActionMeta } from "react-select";
import Button from "resources/views/components/forms/Button";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import Select from "resources/views/components/forms/Select";

export type CalculatorStateProps = {
  destination: DataOptionsProps | null;
  isResident: boolean;
  route: "one-way" | "return";
  start_date: string;
  end_date: string;
  residence: "non-residence" | "residence";
};

export type TrainingRowBlockProps = {
  users: UserResponseData[];
  calcState: CalculatorStateProps;
  cities: CityResponseData[];
};

export type ExtraProps = {
  extras: TrainingRowBlockProps;
};

const RowBlockModal: React.FC<BlockModalProps<"training">> = ({
  type,
  blockState,
  isUpdating,
  addBlockComponent,
  dependencies,
}) => {
  const { getModalState, updateModalState } = useModal();
  const { users, cities, calcState } = useMemo(() => {
    const { extras = {} } = (dependencies ?? {}) as ExtraProps;
    const extraObjs = extras as TrainingRowBlockProps;

    return {
      users: extraObjs.users ?? [],
      cities: extraObjs.cities ?? [],
      calcState: extraObjs.calcState,
    };
  }, [dependencies]);
  const { getDistance, calculate } = useClaimCalculator();

  const state: TableContentAreaRowProps = getModalState(type);
  const [rowState, setRowState] = useState<{
    staff: DataOptionsProps | null;
    takeoff: DataOptionsProps | null;
    airport: DataOptionsProps | null;
    distance: number;
    mode: "flight" | "road";
    route: "one-way" | "return";
  }>({
    staff: null,
    takeoff: null,
    airport: null,
    distance: 0,
    mode: "flight",
    route: "return",
  });

  const handleSelectionChange = useCallback(
    (key: "staff" | "takeoff" | "airport") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;
        setRowState((prev) => ({ ...prev, [key]: updatedValue }));
      },
    []
  );

  // console.log(rows);
  useEffect(() => {
    const shouldRun = rowState.takeoff && calcState.destination;
    if (!shouldRun) return;

    getDistance(
      String(rowState.takeoff?.label) ?? "",
      String(calcState.destination?.label) ?? ""
    ).then((res) => {
      const computedDistance = res ?? 0;
      const travelMode = computedDistance > 300 ? "flight" : "road";

      setRowState((prev) => ({
        ...prev,
        distance: computedDistance,
        mode: travelMode,
      }));
    });
  }, [rowState.takeoff, calcState.destination]);

  useEffect(() => {
    if (
      !(
        rowState.staff ||
        rowState.takeoff ||
        calcState.destination ||
        calcState.start_date ||
        calcState.end_date ||
        users
      )
    )
      return;

    const selectedStaff = users.find(
      (user) => user.id === rowState.staff?.value
    );

    if (!selectedStaff) return;

    const expenses = calculate(
      selectedStaff.remunerations ?? [],
      selectedStaff.grade_level_id,
      calcState.start_date,
      calcState.end_date,
      rowState.takeoff,
      calcState.destination,
      rowState.mode,
      calcState.isResident,
      rowState.distance,
      rowState.route,
      rowState.airport as DataOptionsProps | null
    );

    const amount = expenses.reduce(
      (sum, item) => sum + Number(item.total_amount_spent),
      0
    );

    const row: TableContentAreaRowProps = {
      user_id: selectedStaff.id,
      name: selectedStaff.name,
      grade_level: selectedStaff.grade_level,
      amount: formatCurrency(amount),
      identifier: crypto.randomUUID(),
      isVisible: true,
      approved_amount: amount,
      meta_data: {
        user_id: selectedStaff.id,
        grade_level_id: selectedStaff.grade_level_id,
        remunerations: selectedStaff.remunerations ?? [],
        department_id: selectedStaff.department_id,
        staff_no: selectedStaff.staff_no,
        expenses,
        user_current_location: null,
        mode: rowState.mode,
        amount,
      },
    };

    updateModalState(type, row);
  }, [
    rowState.staff,
    rowState.takeoff,
    rowState.airport,
    rowState.distance,
    rowState.mode,
    calcState.destination,
    calcState.start_date,
    calcState.end_date,
    rowState.route,
    calcState.isResident,
    users,
  ]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isDisabled: boolean = false,
    grid: number = 7,
    description: string = ""
  ) => (
    <div className={`col-md-${grid} mb-2`}>
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
    <div className="row">
      {renderMultiSelect(
        "Staff",
        formatOptions(users, "id", "name"),
        rowState.staff,
        handleSelectionChange("staff"),
        "Staff",
        false,
        7,
        "Select the staff going on this trip, another thing is here again. I just want to add more text right here to see it."
      )}
      {renderMultiSelect(
        "Takeoff State",
        formatOptions(cities, "id", "name"),
        rowState.takeoff,
        handleSelectionChange("takeoff"),
        "Takeoff State",
        false,
        5,
        "Select the staff going on this trip, another thing is here again. I just want to add more text right here to see it."
      )}
      {renderMultiSelect(
        "Airport",
        formatOptions(
          cities.filter((city) => city.has_airport),
          "id",
          "name"
        ),
        rowState.airport,
        handleSelectionChange("airport"),
        "Airport",
        rowState.mode === "road",
        4
      )}
      <div className="col-md-4 mb-2">
        <Select
          label="Mode of Transportation"
          valueKey="value"
          labelKey="label"
          value={rowState.mode}
          onChange={(e) =>
            setRowState((prev) => ({
              ...prev,
              mode: e.target.value as "flight" | "road",
            }))
          }
          options={[
            { value: "flight", label: "Flight" },
            { value: "road", label: "Road" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-4 mb-2">
        <Select
          label="Route"
          valueKey="value"
          labelKey="label"
          value={rowState.route}
          onChange={(e) =>
            setRowState((prev) => ({
              ...prev,
              route: e.target.value as "one-way" | "return",
            }))
          }
          options={[
            { value: "one-way", label: "One Way" },
            { value: "return", label: "Return" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-12 mt-3 mb-3">
        <Button
          label="Nominate"
          icon="ri-server-line"
          size="sm"
          handleClick={() => {
            addBlockComponent(state);
            // updateModalState(type, {});
          }}
          isDisabled={
            !rowState.takeoff ||
            (rowState.mode === "flight" && !rowState.airport) ||
            !rowState.staff
          }
        />
      </div>
    </div>
  );
};

export default RowBlockModal;
