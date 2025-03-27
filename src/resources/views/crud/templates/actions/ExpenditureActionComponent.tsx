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
  Repo,
  handleInputChange,
  handleFormSubmit,
  document,
}) => {
  const { isLoading } = useStateContext();
  const state: ExpenditureResponseData = getModalState(service);
  const { fetchCommitments } = useRepo(Repo);

  const { staff } = useAuth();
  const { dependencies: expoDependencies } = useRepo(repo("expenditure"));
  const [funds, setFunds] = useState<FundResponseData[]>([]);
  const [rate, setRate] = useState<string>("");
  const [currentCommittment, setCurrentCommittment] = useState<number>(0);
  const [totalApprovedAmount, setTotalApprovedAmount] = useState<number>(0);
  const [newBalance, setNewBalance] = useState<number>(0);
  const [cannotRaise, setCannotRaise] = useState<boolean>(false);

  const [selectedOptions, setSelectedOptions] = useState<{
    fund: DataOptionsProps | null;
  }>({
    fund: null,
  });

  const committments = async (fundId: number) => {
    const response = await fetchCommitments(fundId);
    if (response) {
      setCurrentCommittment(Number(response));
    }
  };

  const handleDifference = (
    approvedAmount: number,
    resourceAmount: number,
    currentCommittment: number
  ) => {
    const difference = approvedAmount - (resourceAmount + currentCommittment);

    setNewBalance(difference);
    setCannotRaise(difference < 1);
  };

  useEffect(() => {
    if (document) {
      updateModalState(service, {
        ...state,
        purpose: `PYMT for ${document.title}`,
        document_draft_id: currentDraft.id,
        department_id: staff?.department_id ?? 0,
        user_id: staff?.id ?? 0,
        amount: currentDraft?.amount,
        type: extractModelName(
          currentDraft.document_draftable_type
        ).toLowerCase(),
        currency: "NGN",
        budget_year: 2024,
        expenditureable_id: document.documentable_id,
        expenditureable_type: document.documentable_type,
      });
    }
  }, [document]);

  useEffect(() => {
    if (currentDraft) {
      handleDifference(
        totalApprovedAmount,
        Number(currentDraft.amount),
        currentCommittment
      );
    }
  }, [totalApprovedAmount, currentDraft, currentCommittment]);

  useEffect(() => {
    if (selectedOptions.fund) {
      committments(selectedOptions.fund.value);

      const fund = funds.find((fnd) => fnd.id === selectedOptions.fund?.value);
      setTotalApprovedAmount(Number(fund?.total_approved_amount));
    }
  }, [selectedOptions.fund]);

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
      setFunds(funds);
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
            options={formatOptions(funds, "id", "name")}
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
            <div className="col-md-3 mb-3">
              <small className="storm-form-label mb-2">Beneficiary:</small>
              <h3>{document?.owner?.name}</h3>
            </div>
            <div className="col-md-3 mb-3">
              <small className="storm-form-label mb-2">Department:</small>
              <h3>{document?.owner?.department}</h3>
            </div>
            <div className="col-md-3 mb-3">
              <small className="storm-form-label mb-2">Approved Amount:</small>
              <h3>{`${state.currency} ${formatNumber(
                currentDraft.amount
              )}`}</h3>
            </div>
            <div className="col-md-3 mb-3">
              <small className="storm-form-label mb-2">
                Current Committment:
              </small>
              <h3>{`${state.currency} ${formatNumber(
                currentCommittment.toString()
              )}`}</h3>
            </div>
          </div>
        </div>

        <div className="flex align gap-lg">
          <Button
            type="submit"
            variant="dark"
            label="Commit Expenditure"
            size="sm"
            icon="ri-paypal-line"
            isDisabled={!state.fund_id || state.fund_id < 1 || !document}
          />
          <p>
            {cannotRaise
              ? "You cannot run a fund to overdraft, please try another!"
              : `A balance of ${formatNumber(
                  newBalance.toString()
                )} would be left after drawing this amount!`}
          </p>
        </div>
      </div>
    </form>
  );
};

export default ExpenditureActionComponent;
