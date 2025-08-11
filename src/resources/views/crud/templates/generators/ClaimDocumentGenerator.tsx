import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { DocumentBuilderComponentProps } from "../../DocumentBuilder";
import ClaimRepository from "@/app/Repositories/Claim/ClaimRepository";
import { ClaimResponseData } from "@/app/Repositories/Claim/data";
import { BlockDataType } from "@/app/Repositories/Block/data";
import { useAuth } from "app/Context/AuthContext";
import useClaimCalculator from "app/Hooks/useClaimCalculator";
import useDirectories from "app/Hooks/useDirectories";
import { repo } from "bootstrap/repositories";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import TextInput from "resources/views/components/forms/TextInput";
import Select from "resources/views/components/forms/Select";
import Box from "resources/views/components/forms/Box";
import { ExpenseResponseData } from "@/app/Repositories/Expense/data";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";

const ClaimDocumentGenerator: React.FC<
  DocumentBuilderComponentProps<ClaimRepository, ClaimResponseData>
> = ({
  repo: claimRepo,
  service,
  collection: claims,
  plug,
  category,
  state,
  setState,
  updateGlobalState,
}) => {
  // Memoize the repo call to prevent useDirectories from re-fetching
  const departmentRepo = useMemo(() => repo("department"), []);

  const { collection: departments } = useDirectories(
    departmentRepo,
    "departments"
  );

  const { staff } = useAuth();
  const { getDistance, calculate, cities, allowances } = useClaimCalculator();
  const { state: templateState, actions } = useTemplateBoard();
  const identifier: BlockDataType = "expense";

  // Use ref to store getDistance to prevent infinite API calls
  const getDistanceRef = useRef(getDistance);

  // Update ref when getDistance changes
  useEffect(() => {
    getDistanceRef.current = getDistance;
  }, [getDistance]);

  const [selectedOptions, setSelectedOptions] = useState<{
    departure_city: DataOptionsProps | null;
    destination_city: DataOptionsProps | null;
    sponsoring_department: DataOptionsProps | null;
    airport: DataOptionsProps | null;
  }>({
    departure_city: null,
    destination_city: null,
    sponsoring_department: null,
    airport: null,
  });

  const [claimState, setClaimState] = useState<ClaimResponseData>({
    route: "one-way", // Set default route
  } as ClaimResponseData);

  // Track manually edited expenses to prevent auto-calculation from overwriting them
  const [manualEdits, setManualEdits] = useState<
    Record<string, ExpenseResponseData>
  >({});

  // Use ref to track current claimState to avoid infinite loops
  const claimStateRef = useRef(claimState);

  // Update ref when claimState changes
  useEffect(() => {
    claimStateRef.current = claimState;
  }, [claimState]);

  // Use ref for updateGlobalState to avoid dependency issues
  const updateGlobalStateRef = useRef(updateGlobalState);

  // Update ref when updateGlobalState changes
  useEffect(() => {
    updateGlobalStateRef.current = updateGlobalState;
  }, [updateGlobalState]);

  // Update shared state when claimState changes
  const updateSharedClaimState = useCallback(
    (
      newClaimStateOrUpdater:
        | ClaimResponseData
        | ((prev: ClaimResponseData) => ClaimResponseData)
    ) => {
      setClaimState((prev) => {
        const newClaimState =
          typeof newClaimStateOrUpdater === "function"
            ? newClaimStateOrUpdater(prev)
            : newClaimStateOrUpdater;

        // Update both the local generatedData and template context
        const expenseData = {
          claimState: newClaimState,
          expenses: newClaimState.expenses ?? [],
        };

        // Update generatedData (existing functionality)
        if (updateGlobalStateRef.current) {
          updateGlobalStateRef.current(expenseData, "expense");
        }

        // Update template context
        const expenseContent = templateState.contents.find(
          (content) => content.type === "expense"
        );
        if (expenseContent) {
          actions.updateContent(expenseContent.id, expenseData, identifier);
        }

        return newClaimState;
      });
    },
    [updateGlobalStateRef] // Remove template context dependencies to prevent infinite loops
  );

  // Use ref to store the latest updateSharedClaimState function
  const updateSharedClaimStateRef = useRef(updateSharedClaimState);

  // Update ref when updateSharedClaimState changes
  useEffect(() => {
    updateSharedClaimStateRef.current = updateSharedClaimState;
  }, [updateSharedClaimState]);

  // Function to update manual edits
  const updateManualEdits = useCallback(
    (expenseId: string, updatedExpense: ExpenseResponseData) => {
      setManualEdits((prev) => ({
        ...prev,
        [expenseId]: updatedExpense,
      }));
    },
    []
  );

  // Function to remove manual edit
  const removeManualEdit = useCallback((expenseId: string) => {
    setManualEdits((prev) => {
      const newEdits = { ...prev };
      delete newEdits[expenseId];
      return newEdits;
    });
  }, []);

  // Function to add new expense to manual edits
  const addManualExpense = useCallback((newExpense: ExpenseResponseData) => {
    setManualEdits((prev) => ({
      ...prev,
      [newExpense.id]: newExpense,
    }));
  }, []);

  // Function to remove expense from manual edits
  const removeManualExpense = useCallback((expenseId: string) => {
    setManualEdits((prev) => {
      const newEdits = { ...prev };
      delete newEdits[expenseId];
      return newEdits;
    });
  }, []);

  const handleSelectionChange = useCallback(
    (
        key:
          | "departure_city"
          | "destination_city"
          | "sponsoring_department"
          | "airport"
      ) =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;
        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
        if (key === "sponsoring_department") {
          actions.setDepartmentOwner(updatedValue);
        }
        updateSharedClaimStateRef.current((prev) => ({
          ...prev,
          [`${key}_id`]: updatedValue?.value,
        }));
      },
    [] // Remove updateSharedClaimState from dependencies
  );

  useEffect(() => {
    const shouldRun = !!(
      claimStateRef.current.start_date &&
      claimStateRef.current.end_date &&
      claimStateRef.current.departure_city_id &&
      claimStateRef.current.destination_city_id &&
      claimStateRef.current.airport_id &&
      claimStateRef.current.resident_type &&
      claimStateRef.current.distance &&
      claimStateRef.current.mode &&
      staff &&
      selectedOptions.departure_city &&
      selectedOptions.destination_city &&
      selectedOptions.airport
    );

    if (!shouldRun) return;

    const autoGeneratedExpenses: ExpenseResponseData[] = calculate(
      staff.remunerations ?? [],
      staff.grade_level_id,
      claimStateRef.current.start_date,
      claimStateRef.current.end_date,
      selectedOptions.departure_city,
      selectedOptions.destination_city,
      claimStateRef.current.mode as "flight" | "road",
      claimStateRef.current.resident_type === "resident",
      claimStateRef.current.distance ?? 0,
      claimStateRef.current.route ?? "one-way",
      selectedOptions.airport
    );

    // Merge auto-generated expenses with manual edits
    const mergedExpenses = autoGeneratedExpenses.map(
      (expense) => manualEdits[expense.id] || expense
    );

    // Add any manual expenses that aren't in auto-generated list
    const manualOnlyExpenses = Object.values(manualEdits).filter(
      (manualExpense) =>
        !autoGeneratedExpenses.find((auto) => auto.id === manualExpense.id)
    );

    const finalExpenses = [...mergedExpenses, ...manualOnlyExpenses];

    updateSharedClaimStateRef.current({
      ...claimStateRef.current,
      expenses: finalExpenses,
    });
  }, [
    selectedOptions.departure_city,
    selectedOptions.destination_city,
    selectedOptions.airport,
    staff,
    manualEdits, // Include manualEdits in dependencies
    calculate, // Include calculate in dependencies
    // Add claimState values that should trigger recalculation
    claimState.start_date,
    claimState.end_date,
    claimState.departure_city_id,
    claimState.destination_city_id,
    claimState.airport_id,
    claimState.resident_type,
    claimState.distance,
    claimState.mode,
    claimState.route,
    // Remove updateSharedClaimState from dependencies to prevent infinite loop
  ]);

  useEffect(() => {
    const shouldRun = !!(
      selectedOptions.departure_city && selectedOptions.destination_city
    );
    if (!shouldRun) return;

    getDistanceRef
      .current(
        String(selectedOptions.departure_city?.label) ?? "",
        String(selectedOptions.destination_city?.label) ?? ""
      )
      .then((res) => {
        const computedDistance = res ?? 0;
        const travelMode = computedDistance > 300 ? "flight" : "road";

        updateSharedClaimStateRef.current({
          ...claimStateRef.current,
          distance: computedDistance,
          mode: travelMode,
        });
      });
  }, [
    selectedOptions.departure_city,
    selectedOptions.destination_city,
    // Remove updateSharedClaimState from dependencies to prevent infinite loop
  ]);

  // Share the manual edit functions with child components
  useEffect(() => {
    const manualEditData = {
      claimState: {
        ...claimStateRef.current,
        manualEditFunctions: {
          updateManualEdits,
          removeManualEdit,
          addManualExpense,
          removeManualExpense,
        },
      },
      expenses: claimStateRef.current.expenses,
    };

    // Update generatedData (existing functionality)
    if (updateGlobalStateRef.current) {
      updateGlobalStateRef.current(manualEditData, "expense");
    }

    // Update template context
    const expenseContent = templateState.contents.find(
      (content) => content.type === "expense"
    );
    if (expenseContent) {
      actions.updateContent(expenseContent.id, manualEditData, "expense");
    }
  }, [
    updateManualEdits,
    removeManualEdit,
    addManualExpense,
    removeManualExpense,
    // Remove template context dependencies to prevent infinite loops
  ]);

  return (
    <div className="document__generator__container">
      <div className="row">
        <div className="col-md-12 mb-5">
          <h5>Claim Details</h5>

          <div className="claim__item__details flex start column">
            <small>Distance: {claimState.distance ?? 0} km</small>
            <small>Mode of Transport: {claimState.mode ?? "Flight"}</small>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <TextInput
            label="Event start Date"
            name="start_date"
            value={claimState.start_date}
            onChange={(e) => {
              updateSharedClaimStateRef.current((prev) => ({
                ...prev,
                start_date: e.target.value,
              }));
            }}
            type="date"
          />
        </div>
        <div className="col-md-6 mb-3">
          <TextInput
            label="Event end Date"
            name="end_date"
            value={claimState.end_date}
            onChange={(e) => {
              updateSharedClaimStateRef.current((prev) => ({
                ...prev,
                end_date: e.target.value,
              }));
            }}
            type="date"
          />
        </div>

        <div className="col-md-12 mb-3">
          <MultiSelect
            label="Takeoff City"
            options={formatOptions(cities, "id", "name")}
            value={selectedOptions.departure_city}
            onChange={handleSelectionChange("departure_city")}
            placeholder="Takeoff City"
          />
        </div>
        <div className="col-md-12 mb-3">
          <MultiSelect
            label="Destination City"
            options={formatOptions(cities, "id", "name")}
            value={selectedOptions.destination_city}
            onChange={handleSelectionChange("destination_city")}
            placeholder="Destination City"
            isDisabled={!selectedOptions.departure_city}
          />
        </div>
        <div className="col-md-7 mb-3">
          <MultiSelect
            label="Airport"
            options={formatOptions(
              cities.filter((city) => city.has_airport),
              "id",
              "name"
            )}
            value={selectedOptions.airport}
            onChange={handleSelectionChange("airport")}
            placeholder="Airport"
          />
        </div>
        <div className="col-md-5 mb-3">
          <MultiSelect
            label="Sponsor"
            options={formatOptions(departments, "id", "abv")}
            value={selectedOptions.sponsoring_department}
            onChange={handleSelectionChange("sponsoring_department")}
            placeholder="Department"
          />
        </div>
        <div className="col-md-12 mb-3">
          <Select
            label="Resident Type"
            labelKey="label"
            valueKey="value"
            value={claimState.resident_type}
            name="resident_type"
            options={[
              { label: "Resident", value: "resident" },
              { label: "Non-Resident", value: "non-resident" },
            ]}
            onChange={(e) => {
              updateSharedClaimStateRef.current((prev) => ({
                ...prev,
                resident_type: e.target.value as "resident" | "non-resident",
              }));
            }}
            defaultValue=""
            size="xl"
          />
        </div>
        <div className="col-md-12 mb-3">
          <Box
            label={claimState.route === "return" ? "Return" : "One Way"}
            isChecked={claimState.route === "return"}
            onChange={(e) => {
              const isChecked = e.target.checked;
              const newRoute = isChecked ? "return" : "one-way";

              updateSharedClaimStateRef.current((prev) => ({
                ...prev,
                route: newRoute,
              }));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ClaimDocumentGenerator;
