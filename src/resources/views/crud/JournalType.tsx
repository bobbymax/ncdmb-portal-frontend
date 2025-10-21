import { JournalTypeResponseData } from "app/Repositories/JournalType/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import Textarea from "../components/forms/Textarea";
import Checkbox from "../components/forms/Checkbox";
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

  // Custom handler for all checkboxes (nested and non-nested)
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    // Check if it's a nested property (contains a dot)
    if (name.includes(".")) {
      const [parentKey, childKey] = name.split(".");

      // Create a synthetic event with the nested structure
      const syntheticEvent = {
        target: {
          name: parentKey,
          value: {
            ...state.posting_rules,
            [childKey]: checked,
          },
        },
      } as any;

      handleChange(syntheticEvent);
    } else {
      // For non-nested properties, create event with boolean value
      const syntheticEvent = {
        target: {
          name: name,
          value: checked,
        },
      } as any;

      handleChange(syntheticEvent);
    }
  };

  return (
    <>
      {/* Basic Information Group */}
      <div className="col-12 mb-4">
        <div
          className="card"
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            className="card-header"
            style={{
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              padding: "16px 20px",
            }}
          >
            <h6
              className="mb-0"
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i
                className="ri-information-line"
                style={{ color: "#3b82f6" }}
              ></i>
              Basic Information
            </h6>
          </div>
          <div className="card-body" style={{ padding: "20px" }}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <TextInput
                  label="Name"
                  name="name"
                  value={state.name}
                  onChange={handleChange}
                  placeholder="Enter Name"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <TextInput
                  label="Code"
                  name="code"
                  value={state.code}
                  onChange={handleChange}
                  placeholder="Enter Code"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
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
                  size="lg"
                />
              </div>
              <div className="col-md-6 mb-3">
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
                  size="lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Configuration Group */}
      <div className="col-12 mb-4">
        <div
          className="card"
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            className="card-header"
            style={{
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              padding: "16px 20px",
            }}
          >
            <h6
              className="mb-0"
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="ri-percent-line" style={{ color: "#10b981" }}></i>
              Rate Configuration
            </h6>
          </div>
          <div className="card-body" style={{ padding: "20px" }}>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextInput
                  label="Rate"
                  name="rate"
                  value={state.rate}
                  onChange={handleChange}
                  placeholder="Enter Rate"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-3 mb-3">
                <Select
                  label="Rate Type"
                  name="rate_type"
                  value={state.rate_type}
                  valueKey="value"
                  labelKey="label"
                  onChange={handleChange}
                  defaultValue=""
                  defaultCheckDisabled
                  options={[
                    { value: "percentage", label: "Percentage" },
                    { value: "fixed", label: "Fixed Amount" },
                  ]}
                  size="lg"
                />
              </div>
              <div className="col-md-3 mb-3">
                <Select
                  label="Kind"
                  name="kind"
                  value={state.kind}
                  valueKey="value"
                  labelKey="label"
                  onChange={handleChange}
                  defaultValue=""
                  defaultCheckDisabled
                  options={[
                    { value: "add", label: "Addition" },
                    { value: "deduct", label: "Deduction" },
                    { value: "info", label: "Information Only" },
                  ]}
                  size="lg"
                />
              </div>
              <div className="col-md-3 mb-3">
                <Select
                  label="Base Selector"
                  name="base_selector"
                  value={state.base_selector}
                  valueKey="value"
                  labelKey="label"
                  onChange={handleChange}
                  defaultValue=""
                  defaultCheckDisabled
                  options={[
                    { value: "GROSS", label: "Gross Amount" },
                    { value: "TAXABLE", label: "Taxable Amount" },
                    { value: "NON-TAXABLE", label: "Non-Taxable Amount" },
                    { value: "CUSTOM", label: "Custom Amount" },
                  ]}
                  size="lg"
                />
              </div>
              <div className="col-md-4 mb-3">
                <TextInput
                  label="Fixed Amount"
                  name="fixed_amount"
                  value={state.fixed_amount}
                  onChange={handleChange}
                  placeholder="Enter Fixed Amount"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-4 mb-3">
                <TextInput
                  label="Precedence"
                  name="precedence"
                  value={state.precedence}
                  onChange={handleChange}
                  placeholder="Enter Precedence Order"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-4 mb-3">
                <Select
                  label="Rounding"
                  name="rounding"
                  value={state.rounding}
                  valueKey="value"
                  labelKey="label"
                  onChange={handleChange}
                  defaultValue=""
                  defaultCheckDisabled
                  options={[
                    { value: "half_up", label: "Half Up" },
                    { value: "bankers", label: "Bankers Rounding" },
                  ]}
                  size="lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Associations & Posting Rules Group */}
      <div className="col-12 mb-4">
        <div
          className="card"
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            className="card-header"
            style={{
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              padding: "16px 20px",
            }}
          >
            <h6
              className="mb-0"
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="ri-links-line" style={{ color: "#8b5cf6" }}></i>
              Associations & Posting Rules
            </h6>
          </div>
          <div className="card-body" style={{ padding: "20px" }}>
            <div className="row">
              <div className="col-md-6 mb-3">
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
                  size="lg"
                />
              </div>
              <div className="col-md-6 mb-3">
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
                  size="lg"
                />
              </div>
              <div className="col-12">
                <div
                  style={{
                    backgroundColor: "#fefce8",
                    border: "1px solid #fef08a",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <h6
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "#854d0e",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="ri-settings-3-line"></i>
                    Posting Rules
                  </h6>
                  <div className="row">
                    <div className="col-md-3 mb-2">
                      <Checkbox
                        label="Create Contra Entries"
                        name="posting_rules.create_contra_entries"
                        checked={!!state.posting_rules?.create_contra_entries}
                        onChange={handleCheckboxChange}
                        isDisabled={loading}
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <Checkbox
                        label="Retirement"
                        name="posting_rules.retirement"
                        checked={!!state.posting_rules?.retirement}
                        onChange={handleCheckboxChange}
                        isDisabled={loading}
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <Checkbox
                        label="Resolve On Retirement"
                        name="posting_rules.resolve_on_retirement"
                        checked={!!state.posting_rules?.resolve_on_retirement}
                        onChange={handleCheckboxChange}
                        isDisabled={loading}
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <Checkbox
                        label="Deductible From Taxable"
                        name="deductible_from_taxable"
                        checked={!!state.deductible_from_taxable}
                        onChange={handleCheckboxChange}
                        isDisabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div
                  style={{
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "8px",
                    padding: "16px",
                  }}
                >
                  <h6
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "#1e40af",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="ri-shield-check-line"></i>
                    Tax Configuration
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      <Checkbox
                        label="Is VAT"
                        name="is_vat"
                        checked={!!state.is_vat}
                        onChange={handleCheckboxChange}
                        isDisabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Group */}
      <div className="col-12 mb-4">
        <div
          className="card"
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            className="card-header"
            style={{
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              padding: "16px 20px",
            }}
          >
            <h6
              className="mb-0"
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="ri-file-text-line" style={{ color: "#f59e0b" }}></i>
              Additional Information
            </h6>
          </div>
          <div className="card-body" style={{ padding: "20px" }}>
            <div className="row">
              <div className="col-12">
                <Textarea
                  label="Description"
                  name="description"
                  value={state.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter Description Here"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JournalType;
