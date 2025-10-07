import { DocumentTypeResponseData } from "@/app/Repositories/DocumentType/data";
import { LedgerResponseData } from "@/app/Repositories/Ledger/data";
import {
  ProcessCardResponseData,
  ProcessCardRulesProps,
  CurrencyTypes,
  TransactionTypes,
  VisibilityTypes,
  BookType,
} from "app/Repositories/ProcessCard/data";
import { PermissionTypes } from "@/app/Repositories/ProgressTracker/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState, ChangeEvent } from "react";
import Select from "../components/forms/Select";
import { toTitleCase } from "bootstrap/repositories";
import { DataOptionsProps } from "../components/forms/MultiSelect";
import MultiSelect from "../components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import Checkbox from "../components/forms/Checkbox";
import { CarderResponseData } from "@/app/Repositories/Carder/data";
import { GroupResponseData } from "@/app/Repositories/Group/data";
import TextInput from "../components/forms/TextInput";
import Box from "../components/forms/Box";
import { formatOptions } from "@/app/Support/Helpers";

interface DependencyProps {
  documentTypes: DocumentTypeResponseData[];
  ledgers: LedgerResponseData[];
  services: string[];
  carders: CarderResponseData[];
  groups: GroupResponseData[];
  chartOfAccounts: any[]; // Will be typed properly
}

const ProcessCard: React.FC<
  FormPageComponentProps<ProcessCardResponseData>
> = ({
  state,
  handleChange,
  dependencies,
  handleReactSelect,
  setState,
  mode,
}) => {
  const [documentTypes, setDocumentTypes] = useState<
    DocumentTypeResponseData[]
  >([]);
  const [ledgers, setLedgers] = useState<LedgerResponseData[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] =
    useState<DataOptionsProps | null>(null);
  const [carders, setCarders] = useState<CarderResponseData[]>([]);
  const [groups, setGroups] = useState<GroupResponseData[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<any[]>([]);

  const handleServicesChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    handleReactSelect(newValue, actionMeta, (value) => {
      setSelectedServices(value as DataOptionsProps);
      if (setState) {
        setState((prev) => ({
          ...prev,
          service: (value as DataOptionsProps)?.value as string,
        }));
      }
    });
  };

  useEffect(() => {
    if (mode === "update") {
      const service = services.find((serv) => serv === state.service);

      if (service) {
        setSelectedServices((prev) => ({
          ...prev,
          value: service,
          label: toTitleCase(service),
        }));
      }
    }
  }, [mode, state.service, services]);

  useEffect(() => {
    if (dependencies) {
      const {
        documentTypes = [],
        ledgers = [],
        services = [],
        carders = [],
        groups = [],
        chartOfAccounts = [],
      } = dependencies as DependencyProps;
      setDocumentTypes(documentTypes);
      setLedgers(ledgers);
      setServices(services);
      setCarders(carders);
      setGroups(groups);
      setChartOfAccounts(chartOfAccounts);
    }
  }, [dependencies]);

  // Handle rules changes
  const handleRuleChange = (field: keyof ProcessCardRulesProps, value: any) => {
    if (setState) {
      setState((prev) => ({
        ...prev,
        rules: {
          ...prev.rules,
          [field]: value,
        },
      }));
    }
  };

  const handleRuleCheckboxChange =
    (field: keyof ProcessCardRulesProps) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      handleRuleChange(field, e.target.checked);
    };

  const handleRuleSelectChange =
    (field: keyof ProcessCardRulesProps) =>
    (e: ChangeEvent<HTMLSelectElement>) => {
      const value =
        field === "group_id" ||
        field === "approval_carder_id" ||
        field === "default_debit_account_id" ||
        field === "default_credit_account_id" ||
        field === "retain_history_days"
          ? Number(e.target.value)
          : e.target.value;
      handleRuleChange(field, value);
    };

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isMulti: boolean = false,
    isDisabled: boolean = false
  ) => (
    <div className="col-md-4 mb-3">
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={isDisabled}
        isMulti={isMulti}
      />
    </div>
  );

  // Currency options
  const currencyOptions: CurrencyTypes[] = ["NGN", "USD", "GBP", "YEN", "EUR"];
  const transactionOptions: TransactionTypes[] = ["debit", "credit"];
  const bookTypeOptions: BookType[] = ["ledger", "journal"];
  const permissionOptions: PermissionTypes[] = ["r", "rw", "rwx"];
  const visibilityOptions: VisibilityTypes[] = [
    "all",
    "owner",
    "tracker-users",
    "tracker-users-and-owner",
    "specific-users",
  ];

  const postingPriorityOptions = ["immediate", "batch", "scheduled"];
  const settlementStageOptions = [
    "on-approval",
    "on-payment",
    "on-posting",
    "manual",
  ];
  const reconciliationFrequencyOptions = [
    "daily",
    "weekly",
    "monthly",
    "quarterly",
  ];
  const auditTrailLevelOptions = ["basic", "detailed", "comprehensive"];

  console.log(state);

  return (
    <>
      {/* Basic Information */}
      <div className="col-md-4 mb-3">
        <Select
          label="Document Type"
          name="document_type_id"
          value={state.document_type_id}
          onChange={handleChange}
          options={documentTypes}
          valueKey="id"
          labelKey="name"
          defaultValue={0}
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Ledger"
          name="ledger_id"
          value={state.ledger_id}
          onChange={handleChange}
          options={ledgers}
          valueKey="id"
          labelKey="name"
          defaultValue={0}
          defaultCheckDisabled
          size="xl"
        />
      </div>
      {services.length > 0 &&
        renderMultiSelect(
          "Service",
          services.map((service) => ({
            value: service,
            label: toTitleCase(service),
          })),
          selectedServices,
          handleServicesChange,
          "Select Service"
        )}

      <div className="col-md-7 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Process Card Name"
        />
      </div>

      <div className="col-md-5 mb-3">
        <TextInput
          label="Component"
          name="component"
          value={state.component}
          onChange={handleChange}
          placeholder="Enter Process Card Component"
        />
      </div>

      {/* Rules Configuration Card */}
      <div className="col-md-12 mb-3">
        <div
          className="custom-card"
          style={{
            padding: "1.5rem",
            borderRadius: "12px",
            background: "var(--form-bg-primary)",
            border: "1.5px solid var(--form-border-light)",
            boxShadow: "var(--form-shadow-subtle)",
          }}
        >
          <div className="mb-3">
            <h6
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--form-text-primary)",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <i
                className="ri-settings-3-line"
                style={{ fontSize: "1.2rem" }}
              ></i>
              Rules Configuration
            </h6>
          </div>

          <div className="row">
            {/* Financial Configuration Section */}
            <div className="col-md-12 mb-3">
              <div
                style={{
                  borderBottom: "1px solid var(--form-border-light)",
                  paddingBottom: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <strong
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--form-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <i className="ri-money-dollar-circle-line"></i> Financial
                  Settings
                </strong>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <Select
                label="Currency"
                name="rules.currency"
                value={state.rules?.currency}
                onChange={handleRuleSelectChange("currency")}
                options={currencyOptions.map((c) => ({ value: c, label: c }))}
                valueKey="value"
                labelKey="label"
                defaultValue=""
                size="sm"
              />
            </div>

            <div className="col-md-4 mb-3">
              <Select
                label="Transaction Type"
                name="rules.transaction"
                value={state.rules?.transaction}
                onChange={handleRuleSelectChange("transaction")}
                options={transactionOptions.map((t) => ({
                  value: t,
                  label: toTitleCase(t),
                }))}
                valueKey="value"
                labelKey="label"
                defaultValue=""
                size="sm"
              />
            </div>

            <div className="col-md-4 mb-3 d-flex align-items-end">
              <Checkbox
                label="Generate Transactions"
                name="rules.generate_transactions"
                checked={state.rules?.generate_transactions ?? false}
                onChange={handleRuleCheckboxChange("generate_transactions")}
                helpText="Automatically create ledger transactions"
              />
            </div>

            <div className="col-md-6 mb-3">
              <Select
                label="Book Type"
                name="rules.book_type"
                value={state.rules?.book_type}
                onChange={handleRuleSelectChange("book_type")}
                options={bookTypeOptions.map((b) => ({
                  value: b,
                  label: toTitleCase(b),
                }))}
                valueKey="value"
                labelKey="label"
                defaultValue=""
                size="sm"
              />
            </div>

            <div className="col-md-6 mb-3 d-flex align-items-end">
              <Checkbox
                label="Post to Journal"
                name="rules.post_to_journal"
                checked={state.rules?.post_to_journal ?? false}
                onChange={handleRuleCheckboxChange("post_to_journal")}
                helpText="Post entries to the journal book"
              />
            </div>

            {/* Access & Permissions Section */}
            <div className="col-md-12 mb-3 mt-3">
              <div
                style={{
                  borderBottom: "1px solid var(--form-border-light)",
                  paddingBottom: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <strong
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--form-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <i className="ri-lock-line"></i> Access & Permissions
                </strong>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <Select
                label="Permission Level"
                name="rules.permission"
                value={state.rules?.permission}
                onChange={handleRuleSelectChange("permission")}
                options={permissionOptions.map((p) => ({
                  value: p,
                  label:
                    p === "r"
                      ? "Read"
                      : p === "rw"
                      ? "Read-Write"
                      : "Read-Write-Execute",
                }))}
                valueKey="value"
                labelKey="label"
                defaultValue=""
                size="sm"
              />
            </div>

            <div className="col-md-4 mb-3">
              <Select
                label="Visibility"
                name="rules.visibility"
                value={state.rules?.visibility}
                onChange={handleRuleSelectChange("visibility")}
                options={visibilityOptions.map((v) => ({
                  value: v,
                  label: toTitleCase(v.replace(/-/g, " ")),
                }))}
                valueKey="value"
                labelKey="label"
                defaultValue=""
                size="sm"
              />
            </div>

            <div className="col-md-4 mb-3">
              <Select
                label="Group Access"
                name="rules.group_id"
                value={state.rules?.group_id}
                onChange={handleRuleSelectChange("group_id")}
                options={groups}
                valueKey="id"
                labelKey="name"
                defaultValue={999}
                defaultText="Select Group"
                size="sm"
              />
            </div>

            <div className="col-md-12 mb-2">
              <Checkbox
                label="Can Query"
                name="rules.can_query"
                checked={state.rules?.can_query ?? false}
                onChange={handleRuleCheckboxChange("can_query")}
                helpText="Allow users to query or flag this process card"
              />
            </div>

            {/* Approval Settings Section */}
            <div className="col-md-12 mb-3 mt-3">
              <div
                style={{
                  borderBottom: "1px solid var(--form-border-light)",
                  paddingBottom: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <strong
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--form-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <i className="ri-checkbox-circle-line"></i> Approval Settings
                </strong>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <Select
                label="Approval Carder"
                name="rules.approval_carder_id"
                value={state.rules?.approval_carder_id}
                onChange={handleRuleSelectChange("approval_carder_id")}
                options={carders}
                valueKey="id"
                labelKey="name"
                defaultValue={999}
                defaultText="Select Approval Carder"
                size="sm"
              />
            </div>

            <div className="col-md-6 mb-2 d-flex align-items-end">
              <Checkbox
                label="Requires Approval"
                name="rules.requires_approval"
                checked={state.rules?.requires_approval ?? false}
                onChange={handleRuleCheckboxChange("requires_approval")}
                helpText="Process card must be approved before completion"
              />
            </div>

            {/* Settlement & Processing Section */}
            <div className="col-md-12 mb-3 mt-3">
              <div
                style={{
                  borderBottom: "1px solid var(--form-border-light)",
                  paddingBottom: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <strong
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--form-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <i className="ri-exchange-line"></i> Settlement & Processing
                </strong>
              </div>
            </div>

            <div className="col-md-4 mb-2">
              <Checkbox
                label="Auto Settle"
                name="rules.settle"
                checked={state.rules?.settle ?? false}
                onChange={handleRuleCheckboxChange("settle")}
                helpText="Automatically settle this process card"
              />
            </div>

            <div className="col-md-4 mb-2">
              <Checkbox
                label="Settle After Approval"
                name="rules.settle_after_approval"
                checked={state.rules?.settle_after_approval ?? false}
                onChange={handleRuleCheckboxChange("settle_after_approval")}
                helpText="Only settle after approval is granted"
                isDisabled={!state.rules?.requires_approval}
              />
            </div>

            <div className="col-md-4 mb-2">
              <Checkbox
                label="Auto Settle Fund"
                name="rules.auto_settle_fund"
                checked={state.rules?.auto_settle_fund ?? false}
                onChange={handleRuleCheckboxChange("auto_settle_fund")}
                helpText="Automatically update fund balances"
              />
            </div>

            <div className="col-md-6 mb-3">
              <Select
                label="Settlement Stage"
                name="rules.settlement_stage"
                value={state.rules?.settlement_stage}
                onChange={handleRuleSelectChange("settlement_stage")}
                options={settlementStageOptions.map((s) => ({
                  value: s,
                  label: toTitleCase(s.replace(/-/g, " ")),
                }))}
                valueKey="value"
                labelKey="label"
                defaultValue=""
                size="sm"
              />
            </div>

            <div className="col-md-6 mb-3 d-flex align-items-end">
              <Checkbox
                label="Reverse on Rejection"
                name="rules.reverse_on_rejection"
                checked={state.rules?.reverse_on_rejection ?? false}
                onChange={handleRuleCheckboxChange("reverse_on_rejection")}
                helpText="Auto-reverse transactions if rejected"
              />
            </div>

            {/* Double Entry & Posting Section */}
            <div className="col-md-12 mb-3 mt-3">
              <div
                style={{
                  borderBottom: "1px solid var(--form-border-light)",
                  paddingBottom: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <strong
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--form-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <i className="ri-book-open-line"></i> Double Entry & Posting
                </strong>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <Select
                label="Default Debit Account"
                name="rules.default_debit_account_id"
                value={state.rules?.default_debit_account_id}
                onChange={handleRuleSelectChange("default_debit_account_id")}
                options={chartOfAccounts}
                valueKey="id"
                labelKey="name"
                defaultValue={999}
                defaultText="Select Debit Account"
                size="sm"
              />
            </div>

            <div className="col-md-4 mb-3">
              <Select
                label="Default Credit Account"
                name="rules.default_credit_account_id"
                value={state.rules?.default_credit_account_id}
                onChange={handleRuleSelectChange("default_credit_account_id")}
                options={chartOfAccounts}
                valueKey="id"
                labelKey="name"
                defaultValue={999}
                defaultText="Select Credit Account"
                size="sm"
              />
            </div>

            <div className="col-md-4 mb-3">
              <Select
                label="Posting Priority"
                name="rules.posting_priority"
                value={state.rules?.posting_priority}
                onChange={handleRuleSelectChange("posting_priority")}
                options={postingPriorityOptions.map((p) => ({
                  value: p,
                  label: toTitleCase(p),
                }))}
                valueKey="value"
                labelKey="label"
                defaultValue=""
                size="sm"
              />
            </div>

            <div className="col-md-4 mb-2">
              <Checkbox
                label="Create Contra Entries"
                name="rules.create_contra_entries"
                checked={state.rules?.create_contra_entries ?? false}
                onChange={handleRuleCheckboxChange("create_contra_entries")}
                helpText="Auto-create opposite entries"
              />
            </div>

            <div className="col-md-4 mb-2">
              <Checkbox
                label="Update Trial Balance"
                name="rules.update_trial_balance"
                checked={state.rules?.update_trial_balance ?? false}
                onChange={handleRuleCheckboxChange("update_trial_balance")}
                helpText="Auto-update trial balance"
              />
            </div>

            <div className="col-md-4 mb-2">
              <Checkbox
                label="Require Dual Approval"
                name="rules.require_dual_approval"
                checked={state.rules?.require_dual_approval ?? false}
                onChange={handleRuleCheckboxChange("require_dual_approval")}
                helpText="Require 2 approvals for posting"
              />
            </div>

            {/* Reconciliation Section */}
            <div className="col-md-12 mb-3 mt-3">
              <div
                style={{
                  borderBottom: "1px solid var(--form-border-light)",
                  paddingBottom: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <strong
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--form-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <i className="ri-git-merge-line"></i> Reconciliation &
                  Validation
                </strong>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <Select
                label="Reconciliation Frequency"
                name="rules.reconciliation_frequency"
                value={state.rules?.reconciliation_frequency}
                onChange={handleRuleSelectChange("reconciliation_frequency")}
                options={reconciliationFrequencyOptions.map((f) => ({
                  value: f,
                  label: toTitleCase(f),
                }))}
                valueKey="value"
                labelKey="label"
                defaultValue=""
                size="sm"
              />
            </div>

            <div className="col-md-6 mb-3 d-flex align-items-end">
              <Checkbox
                label="Require Reconciliation"
                name="rules.require_reconciliation"
                checked={state.rules?.require_reconciliation ?? false}
                onChange={handleRuleCheckboxChange("require_reconciliation")}
                helpText="Require reconciliation before closing"
              />
            </div>

            {/* Audit & Compliance Section */}
            <div className="col-md-12 mb-3 mt-3">
              <div
                style={{
                  borderBottom: "1px solid var(--form-border-light)",
                  paddingBottom: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <strong
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--form-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <i className="ri-shield-check-line"></i> Audit & Compliance
                </strong>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <Select
                label="Audit Trail Level"
                name="rules.audit_trail_level"
                value={state.rules?.audit_trail_level}
                onChange={handleRuleSelectChange("audit_trail_level")}
                options={auditTrailLevelOptions.map((a) => ({
                  value: a,
                  label: toTitleCase(a),
                }))}
                valueKey="value"
                labelKey="label"
                defaultValue=""
                size="sm"
              />
            </div>

            <div className="col-md-6 mb-3">
              <TextInput
                label="Retain History (Days)"
                name="rules.retain_history_days"
                type="number"
                value={state.rules?.retain_history_days?.toString() || "365"}
                onChange={(e) =>
                  handleRuleChange(
                    "retain_history_days",
                    Number(e.target.value)
                  )
                }
                placeholder="365"
                size="sm"
                min={1}
              />
            </div>

            {/* AI Analysis Section */}
            <div className="col-md-12 mb-3 mt-3">
              <div
                style={{
                  borderBottom: "1px solid var(--form-border-light)",
                  paddingBottom: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <strong
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--form-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <i className="ri-brain-line"></i> AI Analysis
                </strong>
              </div>
            </div>

            <div className="col-md-12 mb-2">
              <Checkbox
                label="Enable AI Analysis"
                name="rules.ai_analysis"
                checked={state.rules?.ai_analysis ?? false}
                onChange={handleRuleCheckboxChange("ai_analysis")}
                helpText="Use AI to analyze and provide insights for this process card"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessCard;
