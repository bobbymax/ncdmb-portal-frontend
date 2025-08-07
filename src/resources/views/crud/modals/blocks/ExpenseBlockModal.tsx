import { BlockModalProps, useModal } from "app/Context/ModalContext";
import { ExpenseResponseData } from "@/app/Repositories/Expense/data";
import React, {
  FormEvent,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import useClaimCalculator from "app/Hooks/useClaimCalculator";
import { ClaimResponseData } from "@/app/Repositories/Claim/data";
import Select from "resources/views/components/forms/Select";
import { useStateContext } from "app/Context/ContentContext";
import { formatOptions, generateUniqueString } from "app/Support/Helpers";
import TextInput from "resources/views/components/forms/TextInput";
import Textarea from "resources/views/components/forms/Textarea";
import Button from "resources/views/components/forms/Button";
import moment from "moment";
import { AllowanceResponseData } from "@/app/Repositories/Allowance/data";
import { useAuth } from "app/Context/AuthContext";

type ExpenseBlockModalDependencies = {
  partials: any[];
  extras: {
    claimState: ClaimResponseData;
  };
};

interface FormErrors {
  allowance_id?: string;
  start_date?: string;
  end_date?: string;
  total_amount_spent?: string;
  description?: string;
}

const ExpenseBlockModal: React.FC<BlockModalProps<"expense">> = ({
  type,
  blockState,
  data,
  isUpdating,
  addBlockComponent,
  dependencies,
}) => {
  const { staff } = useAuth();
  const { getModalState, updateModalState } = useModal();
  const { calculate, cities, allowances, countWeekdays } = useClaimCalculator();
  const { isLoading } = useStateContext();
  const state: ExpenseResponseData = getModalState(type);
  const [claimState, setClaimState] = useState<ClaimResponseData>(
    {} as ClaimResponseData
  );
  const [allowance, setAllowance] = useState<AllowanceResponseData | null>(
    null
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use refs to track previous values and avoid infinite loops
  const prevValuesRef = useRef({
    start_date: state.start_date,
    end_date: state.end_date,
    allowance_id: state.allowance_id,
    no_of_days: state.no_of_days,
    unit_price: state.unit_price,
  });

  // Validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!state.allowance_id) {
      newErrors.allowance_id = "Allowance is required";
    }

    if (!state.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!state.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (!state.description?.trim()) {
      newErrors.description = "Description is required";
    }

    // Date range validation
    if (state.start_date && state.end_date) {
      const startDate = moment(state.start_date);
      const endDate = moment(state.end_date);

      if (endDate.isBefore(startDate)) {
        newErrors.end_date = "End date cannot be before start date";
      }

      //   if (startDate.isBefore(moment(), "day")) {
      //     newErrors.start_date = "Start date cannot be in the past";
      //   }
    }

    // Amount validation
    if (state.total_amount_spent <= 0) {
      newErrors.total_amount_spent = "Total amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    state.allowance_id,
    state.start_date,
    state.end_date,
    state.description,
    state.total_amount_spent,
  ]);

  // Handle form submission with validation
  const handleFormSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // Clear previous errors
      setErrors({});

      // Validate form
      if (!validateForm()) {
        return;
      }

      const response = isUpdating
        ? state
        : {
            ...state,
            identifier: generateUniqueString(32),
          };

      addBlockComponent(response, isUpdating ? "update" : "store");
    } catch (error) {
      console.error("Error submitting expense:", error);
      setErrors({
        description: "An error occurred while submitting the expense",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [state, isUpdating, validateForm, addBlockComponent]);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;

      // Clear error for this field when user starts typing
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }

      updateModalState(type, { [name]: value });
    },
    [errors, updateModalState, type]
  );

  // Consolidated useEffect for all calculations and state updates
  useEffect(() => {
    try {
      // Handle allowance lookup
      const currentAllowance = allowances.find(
        (allowance) => allowance.id === Number(state.allowance_id)
      );
      setAllowance(currentAllowance ?? null);

      // Handle date and amount calculations
      if (staff && state.start_date && state.end_date && currentAllowance) {
        const startDate = moment(state.start_date);
        const endDate = moment(state.end_date);
        const noOfDays = endDate.diff(startDate, "days");

        // Only update if values actually changed to prevent infinite loops
        const shouldUpdateDays =
          state.start_date !== prevValuesRef.current.start_date ||
          state.end_date !== prevValuesRef.current.end_date ||
          currentAllowance.id !== prevValuesRef.current.allowance_id;

        if (shouldUpdateDays) {
          const remuneration = staff.remunerations.find(
            (remuneration) =>
              Number(remuneration.allowance_id) === Number(currentAllowance.id)
          );

          const spentAmount =
            currentAllowance.payment_basis === "km"
              ? Number(remuneration?.amount ?? 0) * (claimState.distance ?? 0)
              : currentAllowance.payment_basis !== "fixed"
              ? Number(remuneration?.amount ?? 0) * Number(state.no_of_days)
              : Number(remuneration?.amount ?? 0);

          const calculatedDays =
            currentAllowance.label === "intracity"
              ? countWeekdays(
                  startDate.format("YYYY-MM-DD"),
                  endDate.format("YYYY-MM-DD")
                )
              : noOfDays;

          updateModalState(type, {
            no_of_days: calculatedDays,
            unit_price: remuneration?.amount ?? 0,
            total_amount_spent: spentAmount ?? 0,
          });

          // Update refs
          prevValuesRef.current.start_date = state.start_date;
          prevValuesRef.current.end_date = state.end_date;
          prevValuesRef.current.allowance_id = currentAllowance.id;
        }
      }

      // Handle amount calculations for computable allowances
      if (
        state.no_of_days > 0 &&
        currentAllowance?.payment_route === "computable" &&
        (state.no_of_days !== prevValuesRef.current.no_of_days ||
          state.unit_price !== prevValuesRef.current.unit_price)
      ) {
        const calculatedAmount =
          Number(state.no_of_days) * Number(state.unit_price);

        updateModalState(type, {
          total_amount_spent: calculatedAmount,
        });

        // Update refs
        prevValuesRef.current.no_of_days = state.no_of_days;
        prevValuesRef.current.unit_price = state.unit_price;
      }
    } catch (error) {
      console.error("Error in expense calculations:", error);
      setErrors({
        description: "An error occurred while calculating expense details",
      });
    }
  }, [
    state.allowance_id,
    allowances,
    state.start_date,
    state.end_date,
    state.no_of_days,
    state.unit_price,
    countWeekdays,
    updateModalState,
    type,
  ]);

  // Handle data initialization
  useEffect(() => {
    if (data) {
      try {
        const expense = data as ExpenseResponseData;
        updateModalState(type, {
          ...state,
          ...expense,
        });
      } catch (error) {
        console.error("Error initializing expense data:", error);
        setErrors({
          description: "An error occurred while loading expense data",
        });
      }
    }
  }, [data, type, updateModalState]);

  // Handle dependencies
  useEffect(() => {
    if (dependencies) {
      try {
        const { extras } = dependencies as ExpenseBlockModalDependencies;
        setClaimState(extras.claimState);
      } catch (error) {
        console.error("Error setting claim state:", error);
      }
    }
  }, [dependencies]);

  // Helper function to determine if Total Amount Spent should be disabled
  const shouldDisableTotalAmount = useCallback((): boolean => {
    // Always disable if loading or submitting
    if (isLoading || isSubmitting) {
      return true;
    }

    // If no allowance is selected, disable
    if (!allowance) {
      return true;
    }

    // Disable for road transport with distance (calculated automatically)
    if (claimState?.mode === "road" && (claimState?.distance ?? 0) > 0) {
      return true;
    }

    // Disable for computable allowances (calculated automatically)
    if (allowance.payment_route === "computable") {
      return true;
    }

    // Disable for fixed payment basis (except flight-fare which can be edited)
    if (
      allowance.payment_basis === "fixed" &&
      allowance.label !== "flight-fare"
    ) {
      return true;
    }

    // Enable for "other-expenses" allowance (manual entry)
    if (allowance.label === "other-expenses") {
      return false;
    }

    // Enable for flight-fare (can be edited even if fixed)
    if (allowance.label === "flight-fare") {
      return false;
    }

    // For other allowances, disable if they have automatic calculations
    if (
      allowance.payment_basis === "km" ||
      allowance.payment_basis === "days" ||
      allowance.payment_basis === "nights"
    ) {
      return true;
    }

    // Default: allow manual entry for other cases
    return false;
  }, [
    isLoading,
    isSubmitting,
    allowance,
    claimState?.mode,
    claimState?.distance,
  ]);

  // Helper function to get the reason why Total Amount is disabled
  const getTotalAmountDisabledReason = useCallback((): string => {
    if (isLoading) return "Loading...";
    if (isSubmitting) return "Submitting...";
    if (!allowance) return "Select an allowance first";
    if (claimState?.mode === "road" && (claimState?.distance ?? 0) > 0)
      return "Calculated automatically for road transport";
    if (allowance.payment_route === "computable")
      return "Calculated automatically";
    if (
      allowance.payment_basis === "fixed" &&
      allowance.label !== "flight-fare"
    )
      return "Fixed amount";
    if (allowance.payment_basis === "km") return "Calculated by distance";
    if (
      allowance.payment_basis === "days" ||
      allowance.payment_basis === "nights"
    )
      return "Calculated by days";
    return "";
  }, [
    isLoading,
    isSubmitting,
    allowance,
    claimState?.mode,
    claimState?.distance,
  ]);

  return (
    <>
      <div className="row">
        {/* Error display */}
        {Object.keys(errors).length > 0 && (
          <div className="col-md-12 mb-3">
            <div className="alert alert-danger">
              <ul className="mb-0">
                {Object.values(errors).map(
                  (error, index) => error && <li key={index}>{error}</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <div className="col-md-6 mb-3">
          <Select
            label="Category"
            name="parent_id"
            value={state.parent_id}
            onChange={handleInputChange}
            options={allowances.filter(
              (allowance) =>
                allowance.category === "parent" && allowance.is_active === 1
            )}
            defaultValue={0}
            defaultCheckDisabled
            isDisabled={isLoading || isSubmitting}
            valueKey="id"
            labelKey="name"
            size="xl"
          />
        </div>
        <div className="col-md-6 mb-3">
          <Select
            label="Allowance"
            name="allowance_id"
            value={state.allowance_id}
            onChange={handleInputChange}
            options={formatOptions(
              allowances.filter(
                (allowance) => allowance.parent_id === Number(state.parent_id)
              ),
              "id",
              "name"
            )}
            defaultValue={0}
            defaultCheckDisabled
            isDisabled={isLoading || isSubmitting || state.parent_id === 0}
            valueKey="value"
            labelKey="label"
            size="xl"
          />
          {errors.allowance_id && (
            <small className="text-danger">{errors.allowance_id}</small>
          )}
        </div>
        <div className="col-md-4 mb-3">
          <TextInput
            label="Start Date"
            type="date"
            name="start_date"
            value={state.start_date}
            onChange={handleInputChange}
            min={claimState.start_date}
            isDisabled={isLoading || isSubmitting}
          />
          {errors.start_date && (
            <small className="text-danger">{errors.start_date}</small>
          )}
        </div>
        <div className="col-md-4 mb-3">
          <TextInput
            label="End Date"
            type="date"
            name="end_date"
            value={state.end_date}
            onChange={handleInputChange}
            min={state.start_date || claimState.end_date}
            isDisabled={isLoading || isSubmitting}
          />
          {errors.end_date && (
            <small className="text-danger">{errors.end_date}</small>
          )}
        </div>
        <div className="col-md-4 mb-3">
          <TextInput
            label="Number of Days"
            type="number"
            name="no_of_days"
            value={state.no_of_days}
            onChange={handleInputChange}
            isDisabled
          />
        </div>
        <div className={`col-md-${claimState?.distance ?? 0 > 0 ? 4 : 6} mb-3`}>
          <TextInput
            label="Unit Price"
            name="unit_price"
            value={state.unit_price}
            onChange={handleInputChange}
            isDisabled
            placeholder="Enter Unit Price"
          />
        </div>
        <div className={`col-md-${claimState?.distance ?? 0 > 0 ? 4 : 6} mb-3`}>
          <TextInput
            label="Total Amount Spent"
            name="total_amount_spent"
            value={state.total_amount_spent}
            onChange={handleInputChange}
            isDisabled={shouldDisableTotalAmount()}
            placeholder="Total Amount Spent"
          />
          {shouldDisableTotalAmount() && (
            <small className="text-muted">
              {getTotalAmountDisabledReason()}
            </small>
          )}
          {errors.total_amount_spent && (
            <small className="text-danger">{errors.total_amount_spent}</small>
          )}
        </div>
        {claimState.distance && (
          <div className="col-md-4 mb-3">
            <TextInput
              label="Total Distance Covered"
              name="total_distance_covered"
              value={claimState.distance}
              onChange={handleInputChange}
              isDisabled={
                isLoading || isSubmitting || (claimState?.distance ?? 0) > 0
              }
              placeholder="Total Distance Covered"
            />
          </div>
        )}
        <div className="col-md-12 mb-3">
          <Textarea
            label="Description"
            name="description"
            value={state.description}
            onChange={handleInputChange}
            isDisabled={isLoading || isSubmitting}
            placeholder="Description"
            rows={5}
          />
          {errors.description && (
            <small className="text-danger">{errors.description}</small>
          )}
        </div>
        <div className="col-md-12">
          <Button
            label={`${isUpdating ? "Update" : "Add"} Expense`}
            icon="ri-file-add-line"
            handleClick={handleFormSubmit}
            variant={isUpdating ? "dark" : "success"}
            size="sm"
            isDisabled={isSubmitting}
          />
          {isSubmitting && (
            <small className="text-muted ml-2">Processing...</small>
          )}
        </div>
      </div>
    </>
  );
};

export default ExpenseBlockModal;
