import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActionComponentProps } from "../../modals/DocumentUpdateModal";
import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";
import { useAuth } from "app/Context/AuthContext";
import { repo } from "bootstrap/repositories";
import { FundResponseData } from "app/Repositories/Fund/data";
import { formatOptions } from "app/Support/Helpers";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import useRepo from "app/Hooks/useRepo";
import Select from "resources/views/components/forms/Select";
import { ActionMeta } from "react-select";
import { useStateContext } from "app/Context/ContentContext";
import ExpenditureRepository from "app/Repositories/Expenditure/ExpenditureRepository";

type DependencyProps = {
  funds: FundResponseData[];
};

const ExpenditureActionComponent: React.FC<
  ActionComponentProps<ExpenditureResponseData, ExpenditureRepository>
> = ({ data, action, service, getModalState, currentDraft, Repo }) => {
  const { isLoading } = useStateContext();
  const state: ExpenditureResponseData = getModalState(service);

  console.log(currentDraft);

  const { staff } = useAuth();
  const { dependencies } = useRepo(repo("expenditure"));
  const [funds, setFunds] = useState<DataOptionsProps[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<{
    fund: DataOptionsProps | null;
  }>({
    fund: null,
  });

  // console.log(identifier);

  /**
   *
   * I have access to the action performed
   * I have access to the resource data (column_name: data)
   * I have access to the state {identifier}
   * I have access to the current draft
   * I have access to the dependencies from the modal
   * i have access to the global modal state {getModalState, updateModalState}
   * through the updateDocumentState
   *
   */
  // console.log(funds);

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;
        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
      },
    []
  );

  useEffect(() => {
    if (dependencies) {
      const { funds } = dependencies as DependencyProps;

      setFunds(formatOptions(funds, "id", "name"));
    }
  }, [dependencies]);

  return (
    <form>
      <div className="row">
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
            onChange={(e) => console.log(e)}
            size="sm"
          />
        </div>
        <div className="col-md-9 mb-2"></div>

        <div className="col-md-8 mb-2">
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
      </div>
    </form>
  );
};

export default ExpenditureActionComponent;
