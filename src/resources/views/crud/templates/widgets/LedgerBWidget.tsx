import React, { useCallback, useEffect, useMemo } from "react";
import { SidebarProps } from "../sidebars/AnalysisSidebar";
import { PaymentBatchResponseData } from "app/Repositories/PaymentBatch/data";
import MultiSelect from "resources/views/components/forms/MultiSelect";
import { formatCurrency, formatOptions } from "app/Support/Helpers";
import { useStateContext } from "app/Context/ContentContext";
import Box from "resources/views/components/forms/Box";
import Button from "resources/views/components/forms/Button";
import TextInput from "resources/views/components/forms/TextInput";
import usePaymentProcessor from "app/Hooks/usePaymentProcessor";
import Select from "resources/views/components/forms/Select";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import {
  ProcessedDataProps,
  useFileProcessor,
} from "app/Context/FileProcessorProvider";
import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";

const LedgerBWidget: React.FC<SidebarProps<PaymentBatchResponseData>> = ({
  tracker,
  resource,
  widget,
  document,
  hasAccessToOperate,
  actions,
  currentDraft,
  updateRaw,
}) => {
  const { isLoading } = useStateContext();
  const batch = useMemo(() => resource as PaymentBatchResponseData, [resource]);
  const {
    state,
    expenditures,
    ledgers,
    accountCodes,
    entities,
    selectedOptions,
    allSelected,
    updateProcessorState,
    handleSelectionChange,
    handleSelectAll,
    handleCheckbox,
  } = usePaymentProcessor(batch, currentDraft, tracker, document, updateRaw);

  const {
    resolveDataWithAction,
    documentProcessed,
    setDocumentProcessed,
    convertToProcessingDataProps,
  } = useFileProcessor();

  const next = (action: DocumentActionResponseData) => {
    if (!state.budget_year) return;
    const filteredExpenditures: ProcessedDataProps<ExpenditureResponseData>[] =
      convertToProcessingDataProps(expenditures, "cleared", "exact");
    resolveDataWithAction(action, state, filteredExpenditures);

    // processIncomingStateAndResources(state, filteredExpenditures, action);
  };

  const paymentAction = useMemo(() => {
    if (!actions) return null;
    if (!Array.isArray(actions)) return null;

    return actions.find((action) => {
      const isPaymentAction =
        action.is_payment === 1 &&
        action.is_resource === 1 &&
        action.has_update === 1 &&
        action.action_status === "passed";

      return isPaymentAction;
    });
  }, [actions]);

  useEffect(() => {
    if (documentProcessed && updateRaw) {
      updateRaw(documentProcessed);
      setDocumentProcessed(null);
    }
  }, [documentProcessed, updateRaw]);

  return (
    <>
      <div className="payment__voucher">
        <h4 className="voucher__title mb-5">{widget.title}</h4>

        <div className="row mt-4">
          <div className="col-md-6 mb-2">
            <TextInput
              label="Period"
              value={state.period}
              name="period"
              onChange={updateProcessorState}
              type="month"
              isDisabled={isLoading}
            />
          </div>
          <div className="col-md-6 mb-2">
            <Select
              size="sm"
              label="Budget Year"
              value={state.budget_year}
              name="budget_year"
              onChange={updateProcessorState}
              defaultValue={0}
              defaultCheckDisabled
              valueKey="value"
              labelKey="label"
              options={[
                { value: 2024, label: 2024 },
                { value: 2025, label: 2025 },
              ]}
            />
          </div>
          <div className="col-md-12 mb-2">
            <MultiSelect
              label="Ledger"
              options={formatOptions(ledgers, "id", "name")}
              value={selectedOptions.ledger}
              onChange={handleSelectionChange("ledger")}
              placeholder="Ledger"
              isSearchable
              isDisabled={isLoading}
            />
          </div>
          <div className="col-md-12 mb-3">
            <MultiSelect
              label="Account Code"
              options={formatOptions(accountCodes, "id", "name")}
              value={selectedOptions.account_code}
              onChange={handleSelectionChange("account_code")}
              placeholder="Account Code"
              isSearchable
              isDisabled={isLoading}
            />
          </div>
          <div className="col-md-6 mb-3">
            <MultiSelect
              label="Type"
              options={[
                { value: "debit", label: "DEBIT" },
                { value: "credit", label: "CREDIT" },
              ]}
              value={selectedOptions.transaction_type}
              onChange={handleSelectionChange("transaction_type")}
              placeholder="Type"
              isSearchable
              isDisabled={isLoading}
            />
          </div>
          <div className="col-md-6 mb-3">
            <MultiSelect
              label="Entity"
              options={formatOptions(entities, "id", "acronym")}
              value={selectedOptions.entity}
              onChange={handleSelectionChange("entity")}
              placeholder="Entity"
              isSearchable
              isDisabled={isLoading}
            />
          </div>
          <div className="col-md-12 mb-3">
            <Box
              label="Select All"
              value={allSelected}
              onChange={handleSelectAll}
              isChecked={
                allSelected === "yes" ||
                ((state.paymentIds ?? []).length > 0 &&
                  (state.paymentIds ?? []).length === expenditures.length)
              }
            />
          </div>
          <div className="col-md-12 mb-3">
            {expenditures.length > 0 ? (
              expenditures.map((exp, i) => (
                <div
                  key={i}
                  className="payment_exps flex align between gap-md mb-3"
                >
                  <Box
                    value={exp.id}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      handleCheckbox(isChecked, exp);
                    }}
                    type="checkbox"
                    isChecked={(state.paymentIds ?? []).includes(exp.id)}
                  />
                  <div className="detts flex column">
                    <small>
                      {batch.type === "staff"
                        ? exp.expenditureable?.owner?.name
                        : exp.expenditureable?.vendor?.name}
                    </small>
                    <span>{exp.purpose}</span>
                    <p>{formatCurrency(Number(exp.amount))}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No Expenditures</p>
            )}
          </div>

          {paymentAction && hasAccessToOperate && (
            <div className="col-md-12 mb-3 mt-3">
              <Button
                label={paymentAction.button_text}
                icon={paymentAction.icon}
                size="sm"
                variant={paymentAction.variant}
                handleClick={() => next(paymentAction)}
                isDisabled={
                  isLoading ||
                  (state.paymentIds ?? []).length < 1 ||
                  !selectedOptions.account_code ||
                  !selectedOptions.ledger ||
                  state.period === ""
                }
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LedgerBWidget;
