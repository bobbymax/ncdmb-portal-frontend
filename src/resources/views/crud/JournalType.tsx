import { JournalTypeResponseData } from "app/Repositories/JournalType/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import Textarea from "../components/forms/Textarea";
import { LedgerResponseData } from "app/Repositories/Ledger/data";
import { EntityResponseData } from "app/Repositories/Entity/data";

interface DependencyProps {
  ledgers: LedgerResponseData[];
  entities: EntityResponseData[];
}

const JournalType: React.FC<
  FormPageComponentProps<JournalTypeResponseData>
> = ({ state, handleChange, dependencies, loading }) => {
  const [ledgers, setLedgers] = useState<LedgerResponseData[]>([]);
  const [entities, setEntities] = useState<EntityResponseData[]>([]);
  useEffect(() => {
    if (dependencies) {
      const { ledgers = [], entities = [] } = dependencies as DependencyProps;
      setLedgers(ledgers);
      setEntities(entities);
    }
  }, [dependencies]);

  return (
    <>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Code"
          name="code"
          value={state.code}
          onChange={handleChange}
          placeholder="Enter Code"
          isDisabled={loading}
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Tax Rate"
          name="tax_rate"
          value={state.tax_rate}
          onChange={handleChange}
          placeholder="Enter Tax Rate"
          isDisabled={loading}
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="State"
          name="state"
          value={state.state}
          valueKey="value"
          labelKey="label"
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "fixed", label: "Fixed Deductions" },
            { value: "optional", label: "Optional Deductions" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Flag"
          name="flag"
          value={state.flag}
          valueKey="value"
          labelKey="label"
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "payable", label: "Payable" },
            { value: "retire", label: "Retirement" },
            { value: "ledger", label: "Ledger" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Entity"
          name="entity_id"
          value={state.entity_id}
          valueKey="id"
          labelKey="name"
          onChange={handleChange}
          defaultValue={0}
          defaultCheckDisabled
          options={entities}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Ledger"
          name="ledger_id"
          value={state.ledger_id}
          valueKey="id"
          labelKey="name"
          onChange={handleChange}
          defaultValue={0}
          defaultCheckDisabled
          options={ledgers}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Beneficiary Type"
          name="benefactor"
          value={state.benefactor}
          valueKey="value"
          labelKey="label"
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "beneficiary", label: "Beneficiary" },
            { value: "entity", label: "Entity" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Category"
          name="category"
          value={state.category}
          valueKey="value"
          labelKey="label"
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "staff", label: "Staff" },
            { value: "third-party", label: "Third Party" },
            { value: "default", label: "Default" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Deductable To"
          name="deductible"
          value={state.deductible}
          valueKey="value"
          labelKey="label"
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "total", label: "Grand Total Amount" },
            { value: "non-taxable", label: "None Taxable Amount" },
            { value: "taxable", label: "Taxable Amount" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Payment Type"
          name="type"
          value={state.type}
          valueKey="value"
          labelKey="label"
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "credit", label: "Credit Transactions" },
            { value: "debit", label: "Debit Transactions" },
            { value: "both", label: "Credit/Debit Transations" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Payment Context"
          name="context"
          value={state.context}
          valueKey="value"
          labelKey="label"
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "tax", label: "Tax" },
            { value: "stamp", label: "Stamp Duty" },
            { value: "commission", label: "Commission" },
            { value: "holding", label: "With Holding" },
            { value: "gross", label: "Gross Payment" },
            { value: "net", label: "Net Pay" },
            { value: "reimbursement", label: "Reimbursements" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Generate Entries"
          name="auto_generate_entries"
          value={state.auto_generate_entries}
          valueKey="value"
          labelKey="label"
          onChange={handleChange}
          defaultValue={999}
          defaultCheckDisabled
          options={[
            { value: 0, label: "No" },
            { value: 1, label: "Yes" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-12 mb-3">
        <Textarea
          label="Description"
          name="description"
          value={state.description}
          onChange={handleChange}
          rows={4}
          placeholder="Enter Description Here"
        />
      </div>
    </>
  );
};

export default JournalType;
