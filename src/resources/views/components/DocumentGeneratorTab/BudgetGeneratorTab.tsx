import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { FundResponseData } from "app/Repositories/Fund/data";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { usePaperBoardResources } from "app/Hooks/usePaperBoardResources";
import MultiSelect, { DataOptionsProps } from "../forms/MultiSelect";
import { ActionMeta } from "react-select";
import { formatOptions } from "app/Support/Helpers";

interface BudgetGeneratorTabProps {
  category: DocumentCategoryResponseData | null;
}

const BudgetGeneratorTab: React.FC<BudgetGeneratorTabProps> = ({
  category,
}) => {
  const { state, actions } = usePaperBoard();

  // Use PaperBoard resources instead of individual API calls
  const { funds, isLoading: fundsLoading } = usePaperBoardResources();
  const fundsError = null; // Error handling is done centrally

  const [selectedOptions, setSelectedOptions] = useState<{
    fund: DataOptionsProps | null;
  }>({
    fund: state.fund, // Initialize with global state
  });

  const [selectedFundData, setSelectedFundData] =
    useState<FundResponseData | null>(null);

  // Memoized fund options to prevent unnecessary re-renders
  const fundOptions = useMemo(() => {
    return funds.map((fund) => ({
      value: fund.id,
      label: fund.name || `Fund ${fund.id}`,
    }));
  }, [funds]);

  // Optimized selection handler
  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) => (newValue: unknown) => {
      const updatedValue = newValue as DataOptionsProps;
      setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));

      // Update the global state with the selected fund
      if (key === "fund" && updatedValue) {
        const selectedFund = funds.find(
          (fund) => fund.id === updatedValue.value
        );
        if (selectedFund) {
          setSelectedFundData(selectedFund);
          actions.setDocumentState({
            ...state.documentState,
            fund: selectedFund,
          } as any);

          actions.setFund(updatedValue);
        }
      }
    },
    [funds, actions, state.documentState]
  );

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isDisabled: boolean = false,
    grid: number = 6,
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
        aria-label={`Select ${label.toLowerCase()}`}
        aria-describedby={`${value}-${label.toLowerCase()}-description`}
      />
      {description && (
        <div
          id={`${value}-${label.toLowerCase()}-description`}
          className="sr-only"
        >
          {description}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (state.fund && state.resources.funds.length > 0) {
      const matchingFund = state.resources.funds.find(
        (fund) => fund.id === state.fund?.value
      );
      if (matchingFund) {
        setSelectedFundData(matchingFund);
        setSelectedOptions((prev) => ({ ...prev, fund: state.fund }));
      }
    }
  }, [state.fund, state.resources.funds]);

  return (
    <div className="budget__generator__tab">
      <div className="budget__header">
        <h3>Budget Overview</h3>
        <div className="budget__summary">
          <span className="budget__label">Total Budget:</span>
          <span className="budget__amount">
            ₦
            {selectedFundData?.total_approved_amount
              ? Number(selectedFundData.total_approved_amount).toLocaleString()
              : "0"}
          </span>
        </div>
      </div>
      <div className="budget__form">
        {fundsLoading ? (
          <div className="budget__loading">
            <i className="ri-loader-4-line animate-spin"></i>
            <span>Loading funds...</span>
          </div>
        ) : fundsError ? (
          <div className="budget__error">
            <i className="ri-error-warning-line"></i>
            <span>Failed to load funds</span>
          </div>
        ) : (
          renderMultiSelect(
            "Budget Head",
            fundOptions,
            selectedOptions.fund,
            handleSelectionChange("fund"),
            "Budget Head",
            fundsLoading,
            12
          )
        )}
      </div>

      <div className="budget__analysis__display">
        {selectedFundData ? (
          <div className="budget__analysis__card">
            <div className="analysis__header">
              <h4>Budget Analysis</h4>
              <div className="fund__type__badge">
                <i className="ri-price-tag-3-line"></i>
                <span>{selectedFundData.type}</span>
              </div>
            </div>

            <div className="analysis__grid">
              <div className="analysis__item">
                <div className="item__icon">
                  <i className="ri-bank-line"></i>
                </div>
                <div className="item__content">
                  <span className="item__label">Approved Amount</span>
                  <span className="item__value approved">
                    ₦
                    {Number(
                      selectedFundData.total_approved_amount
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="analysis__item">
                <div className="item__icon">
                  <i className="ri-hand-coin-line"></i>
                </div>
                <div className="item__content">
                  <span className="item__label">Committed Amount</span>
                  <span className="item__value committed">
                    ₦
                    {(
                      selectedFundData.total_commited_amount || 0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="analysis__item">
                <div className="item__icon">
                  <i className="ri-calculator-line"></i>
                </div>
                <div className="item__content">
                  <span className="item__label">Actual Amount</span>
                  <span className="item__value actual">
                    ₦
                    {(
                      selectedFundData.total_actual_amount || 0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="analysis__item">
                <div className="item__icon">
                  <i className="ri-wallet-3-line"></i>
                </div>
                <div className="item__content">
                  <span className="item__label">Available Balance</span>
                  <span className="item__value available">
                    ₦
                    {(
                      Number(selectedFundData.total_approved_amount) -
                      (selectedFundData.total_commited_amount || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="analysis__details">
              <div className="detail__row">
                <div className="detail__item">
                  <span className="detail__label">Budget Year:</span>
                  <span className="detail__value">
                    {selectedFundData.budget_year}
                  </span>
                </div>
                <div className="detail__item">
                  <span className="detail__label">Budget Code:</span>
                  <span className="detail__value">
                    {selectedFundData.budget_code || "N/A"}
                  </span>
                </div>
                <div className="detail__item">
                  <span className="detail__label">Sub Budget Head:</span>
                  <span className="detail__value">
                    {selectedFundData.sub_budget_head || "N/A"}
                  </span>
                </div>
              </div>

              <div className="detail__row">
                <div className="detail__item">
                  <span className="detail__label">Department:</span>
                  <span className="detail__value">
                    {selectedFundData.owner || "N/A"}
                  </span>
                </div>
                <div className="detail__item">
                  <span className="detail__label">Logistics:</span>
                  <span className="detail__value">
                    {selectedFundData.is_logistics ? "Yes" : "No"}
                  </span>
                </div>
                <div className="detail__item">
                  <span className="detail__label">Status:</span>
                  <span
                    className={`detail__value status__${
                      selectedFundData.is_exhausted ? "exhausted" : "active"
                    }`}
                  >
                    {selectedFundData.is_exhausted ? "Exhausted" : "Active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="budget__progress">
              <div className="progress__header">
                <span>Budget Utilization</span>
                <span className="utilization__percentage">
                  {Math.round(
                    ((selectedFundData.total_commited_amount || 0) /
                      Number(selectedFundData.total_approved_amount)) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="progress__bar">
                <div
                  className="progress__fill"
                  style={{
                    width: `${Math.min(
                      ((selectedFundData.total_commited_amount || 0) /
                        Number(selectedFundData.total_approved_amount)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="budget__empty__state">
            <i className="ri-pie-chart-line"></i>
            <span>Select a Budget Head to view analysis</span>
            <small>
              Choose a fund from the dropdown above to see detailed budget
              information
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetGeneratorTab;
