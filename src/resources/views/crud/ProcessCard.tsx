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

            {/* Advanced Automation Section */}
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
                  <i className="ri-magic-line"></i> Advanced Automation (90%
                  Goal)
                </strong>
              </div>
            </div>

            <div className="col-md-3 mb-2">
              <Checkbox
                label="Auto-Attach to Payments"
                name="rules.auto_attach_to_payments"
                checked={state.rules?.auto_attach_to_payments ?? false}
                onChange={handleRuleCheckboxChange("auto_attach_to_payments")}
                helpText="Automatically attach to matching payments"
              />
            </div>

            <div className="col-md-3 mb-2">
              <Checkbox
                label="Auto-Execute on Create"
                name="rules.auto_execute_on_create"
                checked={state.rules?.auto_execute_on_create ?? false}
                onChange={handleRuleCheckboxChange("auto_execute_on_create")}
                helpText="Execute when payment is created"
              />
            </div>

            <div className="col-md-3 mb-2">
              <Checkbox
                label="Auto-Execute on Approval"
                name="rules.auto_execute_on_approval"
                checked={state.rules?.auto_execute_on_approval ?? false}
                onChange={handleRuleCheckboxChange("auto_execute_on_approval")}
                helpText="Execute when payment is approved"
              />
            </div>

            <div className="col-md-3 mb-2">
              <Checkbox
                label="Auto-Execute on Settlement"
                name="rules.auto_execute_on_settlement"
                checked={state.rules?.auto_execute_on_settlement ?? false}
                onChange={handleRuleCheckboxChange(
                  "auto_execute_on_settlement"
                )}
                helpText="Execute when payment is settled"
              />
            </div>

            {/* Matching Criteria Subsection */}
            <div className="col-md-12 mt-3 mb-2">
              <small
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--form-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <i className="ri-search-line"></i> Auto-Matching Criteria
              </small>
            </div>

            <div className="col-md-3 mb-2">
              <Checkbox
                label="Match by Service"
                name="rules.match_by_service"
                checked={state.rules?.match_by_service ?? false}
                onChange={handleRuleCheckboxChange("match_by_service")}
                helpText="Match payments by service name"
              />
            </div>

            <div className="col-md-3 mb-2">
              <Checkbox
                label="Match by Document Type"
                name="rules.match_by_document_type"
                checked={state.rules?.match_by_document_type ?? false}
                onChange={handleRuleCheckboxChange("match_by_document_type")}
                helpText="Match payments by document type"
              />
            </div>

            <div className="col-md-3 mb-2">
              <Checkbox
                label="Match by Ledger"
                name="rules.match_by_ledger"
                checked={state.rules?.match_by_ledger ?? false}
                onChange={handleRuleCheckboxChange("match_by_ledger")}
                helpText="Match payments by ledger"
              />
            </div>

            <div className="col-md-3 mb-2">
              <Checkbox
                label="Match by Amount Range"
                name="rules.match_by_amount_range"
                checked={state.rules?.match_by_amount_range ?? false}
                onChange={handleRuleCheckboxChange("match_by_amount_range")}
                helpText="Match payments by amount range"
              />
            </div>

            {state.rules?.match_by_amount_range && (
              <>
                <div className="col-md-6 mb-3">
                  <TextInput
                    label="Minimum Amount"
                    name="rules.min_amount"
                    type="number"
                    value={state.rules?.min_amount?.toString() || "0"}
                    onChange={(e) =>
                      handleRuleChange("min_amount", Number(e.target.value))
                    }
                    placeholder="0"
                    size="sm"
                    min={0}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <TextInput
                    label="Maximum Amount"
                    name="rules.max_amount"
                    type="number"
                    value={state.rules?.max_amount?.toString() || "0"}
                    onChange={(e) =>
                      handleRuleChange("max_amount", Number(e.target.value))
                    }
                    placeholder="0"
                    size="sm"
                    min={0}
                  />
                </div>
              </>
            )}

            {/* Error Handling Subsection */}
            <div className="col-md-12 mt-3 mb-2">
              <small
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--form-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <i className="ri-error-warning-line"></i> Error Handling
              </small>
            </div>

            <div className="col-md-3 mb-2">
              <Checkbox
                label="Auto-Retry on Failure"
                name="rules.auto_retry_on_failure"
                checked={state.rules?.auto_retry_on_failure ?? false}
                onChange={handleRuleCheckboxChange("auto_retry_on_failure")}
                helpText="Retry execution if it fails"
              />
            </div>

            <div className="col-md-3 mb-3">
              <TextInput
                label="Retry Attempts"
                name="rules.retry_attempts"
                type="number"
                value={state.rules?.retry_attempts?.toString() || "3"}
                onChange={(e) =>
                  handleRuleChange("retry_attempts", Number(e.target.value))
                }
                placeholder="3"
                size="sm"
                min={1}
                max={10}
                isDisabled={!state.rules?.auto_retry_on_failure}
              />
            </div>

            <div className="col-md-3 mb-2">
              <Checkbox
                label="Notify on Failure"
                name="rules.notify_on_failure"
                checked={state.rules?.notify_on_failure ?? false}
                onChange={handleRuleCheckboxChange("notify_on_failure")}
                helpText="Send notification on failure"
              />
            </div>

            <div className="col-md-3 mb-2">
              <Checkbox
                label="Escalate Repeated Failures"
                name="rules.escalate_on_repeated_failure"
                checked={state.rules?.escalate_on_repeated_failure ?? false}
                onChange={handleRuleCheckboxChange(
                  "escalate_on_repeated_failure"
                )}
                helpText="Escalate after multiple failures"
              />
            </div>

            {/* Batch & Schedule Subsection */}
            <div className="col-md-12 mt-3 mb-2">
              <small
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--form-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <i className="ri-calendar-schedule-line"></i> Batch & Scheduling
              </small>
            </div>

            <div className="col-md-6 mb-2">
              <Checkbox
                label="Auto-Process Batch"
                name="rules.auto_process_batch"
                checked={state.rules?.auto_process_batch ?? false}
                onChange={handleRuleCheckboxChange("auto_process_batch")}
                helpText="Process entire batch automatically"
              />
            </div>

            <div className="col-md-6 mb-3">
              <TextInput
                label="Batch Execution Time"
                name="rules.batch_execution_time"
                type="time"
                value={state.rules?.batch_execution_time || "23:00"}
                onChange={(e) =>
                  handleRuleChange("batch_execution_time", e.target.value)
                }
                placeholder="23:00"
                size="sm"
              />
            </div>

            <div className="col-md-6 mb-2">
              <Checkbox
                label="Auto-Close Period"
                name="rules.auto_close_period"
                checked={state.rules?.auto_close_period ?? false}
                onChange={handleRuleCheckboxChange("auto_close_period")}
                helpText="Automatically close accounting period"
              />
            </div>

            <div className="col-md-6 mb-3">
              <TextInput
                label="Period Close Day"
                name="rules.period_close_day"
                type="number"
                value={state.rules?.period_close_day?.toString() || "5"}
                onChange={(e) =>
                  handleRuleChange("period_close_day", Number(e.target.value))
                }
                placeholder="5"
                size="sm"
                min={1}
                max={28}
                isDisabled={!state.rules?.auto_close_period}
              />
            </div>

            {/* Stage-Aware Execution Section */}
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
                  <i className="ri-route-line"></i> Stage-Aware Execution
                  (ProgressTracker)
                </strong>
              </div>
            </div>

            <div className="col-md-12 mb-2">
              <small
                style={{
                  fontSize: "0.75rem",
                  color: "var(--form-text-muted)",
                  fontStyle: "italic",
                }}
              >
                Configure when this ProcessCard executes based on workflow stage
                order. Attached to ProgressTracker stages via{" "}
                <code>process_card_id</code>.
              </small>
            </div>

            <div className="col-md-4 mb-3">
              <TextInput
                label="Min Stage Order (don't execute before)"
                name="rules.min_stage_order"
                type="number"
                value={state.rules?.min_stage_order?.toString() || "1"}
                onChange={(e) =>
                  handleRuleChange("min_stage_order", Number(e.target.value))
                }
                placeholder="1"
                size="sm"
                min={1}
              />
            </div>

            <div className="col-md-4 mb-3">
              <TextInput
                label="Max Stage Order (don't execute after)"
                name="rules.max_stage_order"
                type="number"
                value={state.rules?.max_stage_order?.toString() || "99"}
                onChange={(e) =>
                  handleRuleChange("max_stage_order", Number(e.target.value))
                }
                placeholder="99"
                size="sm"
                min={1}
              />
            </div>

            <div className="col-md-4 mb-3">
              <Checkbox
                label="Execute at Final Stage Only"
                name="rules.execute_at_final_stage_only"
                checked={state.rules?.execute_at_final_stage_only ?? false}
                onChange={handleRuleCheckboxChange(
                  "execute_at_final_stage_only"
                )}
                helpText="Only execute at the last workflow stage"
              />
            </div>

            <div className="col-md-12 mb-3">
              <TextInput
                label="Execute at Specific Stages (comma-separated, empty=all)"
                name="rules.execute_at_stages"
                type="text"
                value={
                  Array.isArray(state.rules?.execute_at_stages)
                    ? state.rules.execute_at_stages.join(", ")
                    : ""
                }
                onChange={(e) => {
                  const stages = e.target.value
                    .split(",")
                    .map((s) => parseInt(s.trim()))
                    .filter((n) => !isNaN(n));
                  handleRuleChange("execute_at_stages", stages);
                }}
                placeholder="e.g., 1, 3, 5 (leave empty for all stages)"
                size="sm"
              />
            </div>

            <div className="col-md-6 mb-2">
              <Checkbox
                label="Requires Custom Inputs"
                name="rules.requires_custom_inputs"
                checked={state.rules?.requires_custom_inputs ?? false}
                onChange={handleRuleCheckboxChange("requires_custom_inputs")}
                helpText="Wait for user to provide custom inputs"
              />
            </div>

            {state.rules?.requires_custom_inputs && (
              <div className="col-md-6 mb-3">
                <TextInput
                  label="Required Input Fields (comma-separated)"
                  name="rules.custom_input_fields"
                  type="text"
                  value={
                    Array.isArray(state.rules?.custom_input_fields)
                      ? state.rules.custom_input_fields.join(", ")
                      : ""
                  }
                  onChange={(e) => {
                    const fields = e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0);
                    handleRuleChange("custom_input_fields", fields);
                  }}
                  placeholder="e.g., approval_amount, custom_note"
                  size="sm"
                />
              </div>
            )}

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
