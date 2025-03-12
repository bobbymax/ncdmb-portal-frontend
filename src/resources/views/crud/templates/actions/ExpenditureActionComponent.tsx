import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActionComponentProps } from "../../modals/DocumentUpdateModal";
import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";
import { useAuth } from "app/Context/AuthContext";
import { extractModelName, repo } from "bootstrap/repositories";
import { FundResponseData } from "app/Repositories/Fund/data";
import { formatNumber, formatOptions } from "app/Support/Helpers";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import useRepo from "app/Hooks/useRepo";
import Select from "resources/views/components/forms/Select";
import { ActionMeta } from "react-select";
import { useStateContext } from "app/Context/ContentContext";
import ExpenditureRepository from "app/Repositories/Expenditure/ExpenditureRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import TextInput from "resources/views/components/forms/TextInput";
import Button from "resources/views/components/forms/Button";

type DependencyProps = {
  funds: FundResponseData[];
};

const ExpenditureActionComponent: React.FC<
  ActionComponentProps<ExpenditureResponseData, ExpenditureRepository>
> = ({
  data,
  action,
  service,
  getModalState,
  currentDraft,
  updateModalState,
  dependencies,
  Repo,
  handleInputChange,
  handleFormSubmit,
}) => {
  const { isLoading } = useStateContext();
  const state: ExpenditureResponseData = getModalState(service);
  const { fetch } = useRepo(Repo);

  const { staff } = useAuth();
  const { dependencies: expoDependencies } = useRepo(repo("expenditure"));
  const [funds, setFunds] = useState<DataOptionsProps[]>([]);
  const [file, setFile] = useState<DocumentResponseData | null>(null);
  const [rate, setRate] = useState<string>("");

  const [selectedOptions, setSelectedOptions] = useState<{
    fund: DataOptionsProps | null;
  }>({
    fund: null,
  });

  const fetchDocument = async () => {
    const response = await fetch(currentDraft?.document_id);
    if (response) {
      setFile(response as DocumentResponseData);
    }
  };

  useEffect(() => {
    updateModalState(service, {
      ...state,
      document_draft_id: currentDraft.id,
      department_id: staff?.department_id ?? 0,
      user_id: staff?.id ?? 0,
      amount: currentDraft?.amount,
      type: extractModelName(
        currentDraft.document_draftable_type
      ).toLowerCase(),
      currency: "NGN",
      budget_year: 2024,
      expenditureable_id: currentDraft.document_draftable_id,
      expenditureable_type: currentDraft.document_draftable_type,
    });

    fetchDocument();
  }, []);

  useEffect(() => {
    if (file) {
      updateModalState(service, {
        ...state,
        purpose: `PYMT for ${file.title}`,
      });
    }
  }, [file]);

  /**
   *
   * I have access to the action performed
   * I have access to the resource data (column_name: data)
   * I have access to the state {identifier}
   * I have access to the current draft
   * I have access to the dependencies from the modal
   *
   */
  // console.log(funds);

  const handleOnBlur = () => {
    setRate(formatNumber(state.amount));
  };

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;
        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
        updateModalState(service, {
          ...state,
          [`${key}_id`]: updatedValue.value,
        });
      },
    [updateModalState]
  );

  useEffect(() => {
    if (expoDependencies) {
      const { funds = [] } = expoDependencies as DependencyProps;
      setFunds(formatOptions(funds, "id", "name"));
    }
  }, [expoDependencies]);

  // console.log(file, state);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="row">
        {state.type === "estacode" && (
          <>
            <div className="col-md-3 mb-2">
              <Select
                label="Currency"
                name="currency"
                value={state.currency}
                options={[
                  { label: "USD", value: "USD" },
                  { label: "EUR", value: "EUR" },
                  { label: "GBP", value: "GBP" },
                  { label: "NGN", value: "NGN" },
                ]}
                labelKey="label"
                valueKey="value"
                defaultCheckDisabled
                defaultValue=""
                onChange={handleInputChange}
                size="sm"
              />
            </div>
            <div className="col-md-3 mb-2">
              <TextInput
                label="CBN Exchange Rate"
                name="cbn_current_rate"
                value={rate}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, "");

                  if (/^\d*\.?\d*$/.test(rawValue)) {
                    updateModalState(service, { ...state, amount: rawValue });
                    setRate(formatNumber(rawValue));
                  }
                }}
                placeholder={`Today's Rate (USD)`}
                onBlur={handleOnBlur}
              />
            </div>
          </>
        )}

        <div className={`col-md-${state.type !== "estacode" ? 12 : 6} mb-2`}>
          <MultiSelect
            label="Funds"
            options={funds}
            value={selectedOptions.fund}
            onChange={handleSelectionChange("fund")}
            placeholder="Budget Fund"
            isSearchable
            isDisabled={isLoading}
          />
        </div>

        <div className="payment__details mb-4">
          <div className="row">
            <div className="col-md-12 mb-4">
              <small className="storm-form-label mb-2">Purpose</small>
              <h2>{state.purpose}</h2>
            </div>
            <div className="col-md-4 mb-3">
              <small className="storm-form-label mb-2">Beneficiary:</small>
              <h3>{file?.owner?.name}</h3>
            </div>
            <div className="col-md-4 mb-3">
              <small className="storm-form-label mb-2">Department:</small>
              <h3>{file?.owner?.department}</h3>
            </div>
            <div className="col-md-4 mb-3">
              <small className="storm-form-label mb-2">Approved Amount:</small>
              <h3>{`${state.currency} ${formatNumber(
                currentDraft.amount
              )}`}</h3>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="dark"
          label="Make Committment"
          size="sm"
          icon="ri-paypal-line"
          isDisabled={!state.fund_id || state.fund_id < 1}
        />
      </div>
    </form>
  );
};

export default ExpenditureActionComponent;
