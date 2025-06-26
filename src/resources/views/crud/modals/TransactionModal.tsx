import { TransactionResponseData } from "app/Repositories/Transaction/data";
import { ModalLoopProps, useModal } from "app/Context/ModalContext";
import TransactionRepository from "app/Repositories/Transaction/TransactionRepository";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { formatAmountNoCurrency, formatOptions } from "app/Support/Helpers";
import { ChartOfAccountResponseData } from "app/Repositories/ChartOfAccount/data";
import { EntityResponseData } from "app/Repositories/Entity/data";
import { LedgerResponseData } from "app/Repositories/Ledger/data";
import { UserResponseData } from "app/Repositories/User/data";
import TextInput from "resources/views/components/forms/TextInput";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { useStateContext } from "app/Context/ContentContext";
import Button from "resources/views/components/forms/Button";
import { ProcessedDataProps } from "app/Context/FileProcessorProvider";

type TransactionDependencyProps = {
  chartOfAccounts: ChartOfAccountResponseData[];
  entities: EntityResponseData[];
  ledgers: LedgerResponseData[];
  users: UserResponseData[];
};

const TransactionModal: React.FC<
  ModalLoopProps<TransactionRepository, TransactionResponseData>
> = ({ data, handleSubmit, repo, dependencies, extras }) => {
  const { isLoading } = useStateContext();
  const {
    chartOfAccounts = [],
    entities = [],
    ledgers = [],
    users = [],
  } = dependencies as TransactionDependencyProps;

  const [chartOfAccount, setChartOfAccount] = useState<DataOptionsProps | null>(
    null
  );

  const {
    getModalState,
    updateModalState,
    handleInputChange,
    currentIdentifier,
  } = useModal();

  const state: TransactionResponseData = getModalState(currentIdentifier);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    const response: ProcessedDataProps<TransactionResponseData> = {
      raw: state,
      status: "cleared",
      actionPerformed: "add",
    };

    handleSubmit(response);
  };

  const handleAccountCodeSelection = (newValue: unknown) => {
    const result = newValue as DataOptionsProps;
    setChartOfAccount(result);
    updateModalState(currentIdentifier, { chart_of_account_id: result.value });
  };

  useEffect(() => {
    if (data) {
      updateModalState(currentIdentifier, data);

      if (data.chart_of_account_id > 0 && chartOfAccounts) {
        const account = chartOfAccounts.find(
          (acc) => acc.id === data.chart_of_account_id
        );

        setChartOfAccount({
          value: account?.id,
          label: account?.name ?? "",
        });
      }
    }
  }, [data]);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="row">
        <div className="col-md-12 mb-3">
          <MultiSelect
            label="Account Code"
            options={formatOptions(chartOfAccounts, "id", "name")}
            value={chartOfAccount}
            onChange={handleAccountCodeSelection}
            placeholder="Account"
            isSearchable
            isDisabled={isLoading}
          />
        </div>
        <div className="col-md-4 mb-3">
          <TextInput
            label="Journal Name"
            value={state.narration}
            isDisabled
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-4 mb-3">
          <TextInput
            label="Transaction Amount"
            value={formatAmountNoCurrency(state.amount)}
            isDisabled
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-4 mb-3">
          <TextInput
            label="Payment Type"
            value={state.type?.toUpperCase()}
            isDisabled
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-12 mb-3">
          <Button
            label="Update Transaction"
            type="submit"
            size="sm"
            variant="success"
            icon="ri-link"
          />
        </div>
      </div>
    </form>
  );
};

export default TransactionModal;
