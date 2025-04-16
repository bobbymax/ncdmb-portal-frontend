import { ChartOfAccountResponseData } from "app/Repositories/ChartOfAccount/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useMemo, useState } from "react";
import TextInput from "../components/forms/TextInput";
import { repo } from "bootstrap/repositories";
import { DataOptionsProps } from "../components/forms/MultiSelect";
import Select from "../components/forms/Select";

const ChartOfAccount: React.FC<
  FormPageComponentProps<ChartOfAccountResponseData>
> = ({ state, handleChange, loading }) => {
  const chartOfAccountRepo = useMemo(() => repo("chart_of_account"), []);
  const [accounts, setAccounts] = useState<DataOptionsProps[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const response = await chartOfAccountRepo.collection("chartOfAccounts");
      const formatted: DataOptionsProps[] = [{ value: 0, label: "None" }];

      if (response?.code === 200) {
        const accounts: ChartOfAccountResponseData[] =
          response.data as ChartOfAccountResponseData[];

        accounts
          .filter((account) => account.status === "C")
          .map((account) =>
            formatted.push({
              value: account.id,
              label: `${account.account_code} - ${account.name}`,
            })
          );
      }

      setAccounts(formatted);
    };

    fetchAccounts();
  }, [chartOfAccountRepo]);

  return (
    <>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Account Code"
          name="account_code"
          value={state.account_code}
          onChange={handleChange}
          placeholder="Enter Account Code"
          isDisabled={loading}
        />
      </div>
      <div className="col-md-8 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Account Name"
          isDisabled={loading}
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Type"
          value={state.type}
          name="type"
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "asset", label: "Asset" },
            { value: "liability", label: "Liability" },
            { value: "equity", label: "Equity" },
            { value: "revenue", label: "Revenue" },
            { value: "expense", label: "Expense" },
          ]}
          isDisabled={loading}
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Level"
          value={state.level}
          name="level"
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "category", label: "Category" },
            { value: "group", label: "Group" },
            { value: "ledger", label: "Ledger" },
          ]}
          isDisabled={loading}
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Status"
          value={state.status}
          name="status"
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "C", label: "C" },
            { value: "O", label: "O" },
          ]}
          isDisabled={loading}
        />
      </div>
      <div className="col-md-6 mb-3">
        <Select
          label="Parent"
          value={state.parent_id as number}
          name="parent_id"
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          defaultValue={9999}
          defaultCheckDisabled
          options={accounts}
          isDisabled={loading}
        />
      </div>
      <div className="col-md-6 mb-3">
        <Select
          label="Postable"
          value={state.is_postable}
          name="is_postable"
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          defaultValue={999}
          defaultCheckDisabled
          options={[
            { value: 0, label: "No" },
            { value: 1, label: "Yes" },
          ]}
          isDisabled={loading}
        />
      </div>
    </>
  );
};

export default ChartOfAccount;
