import usePageComponents from "app/Hooks/usePageComponents";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { PaymentResponseData } from "app/Repositories/Payment/data";
import { FormPageComponentProps } from "bootstrap";
import { repo } from "bootstrap/repositories";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { formatCurrency, formatOptions } from "app/Support/Helpers";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { PaymentBatchResponseData } from "app/Repositories/PaymentBatch/data";
import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";
import { toast } from "react-toastify";
import Button from "../components/forms/Button";
import { ChartOfAccountResponseData } from "app/Repositories/ChartOfAccount/data";
import Textarea from "../components/forms/Textarea";
import TextInput from "../components/forms/TextInput";

type DependencyProps = {
  chartOfAccounts: ChartOfAccountResponseData[];
};

const Payment: React.FC<FormPageComponentProps<PaymentResponseData>> = ({
  state,
  setState,
  handleChange,
  handleReactSelect,
  dependencies,
  loading,
}) => {
  const page = usePageComponents();
  const documentDraftRepo = useMemo(() => repo("document_draft"), []);
  const [collection, setCollection] = useState<DocumentResponseData[]>([]);
  const [activeDocument, setActiveDocument] =
    useState<DocumentResponseData | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{
    document: DataOptionsProps | null;
    document_category: DataOptionsProps | null;
    chart_of_account: DataOptionsProps | null;
  }>({
    document: null,
    document_category: null,
    chart_of_account: null,
  });
  const [batch, setBatch] = useState<PaymentBatchResponseData | null>(null);
  const [expenditures, setExpenditures] = useState<ExpenditureResponseData[]>(
    []
  );
  const [accountCodes, setAccountCodes] = useState<
    ChartOfAccountResponseData[]
  >([]);

  const handleSelectionChange = useCallback(
    (key: "document" | "document_category" | "chart_of_account") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;
        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));

        if (setState && key !== "document") {
          setState({
            ...state,
            [`${key}_id`]: updatedValue?.value ?? 0,
          });
        }
      },
    [setState]
  );
  useEffect(() => {
    if (activeDocument) {
      const details = activeDocument?.documentable as unknown;

      setBatch(details as PaymentBatchResponseData);
    }
  }, [activeDocument]);

  useEffect(() => {
    if (selectedOptions.document) {
      setActiveDocument(
        collection.find(
          (document) => document.id === selectedOptions.document?.value
        ) ?? null
      );
    }
  }, [selectedOptions.document]);

  useEffect(() => {
    if (batch && page && page.categories && state.document_category_id > 0) {
      const category = page.categories.find(
        (cat) => cat.id === state.document_category_id
      );

      if (category?.type === batch.type) {
        setExpenditures(batch.expenditures);
      } else {
        toast.error("The category and batch type should match");
        setExpenditures([]);
      }
    }
  }, [batch, state.document_category_id, page]);

  useEffect(() => {
    const records = async () => {
      const response = await documentDraftRepo.collection(
        `resolvers/budget-clearing/processing/authorising_staff_id/linked`
      );

      if (response) {
        setCollection(response.data as DocumentResponseData[]);
      }
    };

    records();
  }, []);

  useEffect(() => {
    if (dependencies) {
      const { chartOfAccounts = [] } = dependencies as DependencyProps;
      setAccountCodes(chartOfAccounts);
    }
  }, [dependencies]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    grid: number = 4
  ) => (
    <div className={`col-md-${grid} mb-3`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={loading}
      />
    </div>
  );

  return (
    <>
      <div className="col-md-9 mb-3">
        <div className="row">
          {renderMultiSelect(
            "Categories",
            formatOptions(page?.categories ?? [], "id", "name"),
            selectedOptions.document_category,
            handleSelectionChange("document_category"),
            "Category",
            3
          )}
          {renderMultiSelect(
            "Documents",
            formatOptions(collection, "id", "ref"),
            selectedOptions.document,
            handleSelectionChange("document"),
            "Document",
            3
          )}
          {renderMultiSelect(
            "Account Code",
            formatOptions(accountCodes, "id", "account_code"),
            selectedOptions.chart_of_account,
            handleSelectionChange("chart_of_account"),
            "Account Code",
            3
          )}
          <div className="col-md-3 mb-3">
            <TextInput
              label="Period"
              value={state.period}
              name="period"
              onChange={handleChange}
              type="month"
              isDisabled={loading}
            />
          </div>
          <div className="col-md-12 mb-3">
            <div className="expenditure__board flex align gap-xl">
              {expenditures.map((exp, i) => (
                <div className="custom-card file__card exp__items" key={i}>
                  <small className="beneficiary">
                    {batch?.type === "staff"
                      ? exp?.expenditureable?.owner?.name
                      : exp?.expenditureable?.vendor?.name}
                  </small>

                  <p>{formatCurrency(Number(exp.amount))}</p>
                  <small className="mb-4">{exp.purpose}</small>

                  <Button
                    label="Prepare"
                    size="xs"
                    handleClick={() => {}}
                    variant="info"
                    icon="ri-receipt-fill"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Left Side */}
          <div className="col-md-4 mb-3 mt-3">
            <div className="form__item mb-4">
              <Textarea
                label="Narration"
                value={state.narration}
                name="narration"
                onChange={handleChange}
                rows={4}
                isDisabled={loading}
                placeholder="Enter Payment Narration Here!!"
              />
            </div>
            <div className="form__item mb-4">
              <TextInput
                label="Amount to be Committed"
                value={state.total_amount_payable}
                onChange={handleChange}
                name="total_amount_payable"
                isDisabled={loading}
                placeholder="0"
              />
            </div>
            <div className="form__item mb-4">
              <TextInput
                label="Beneficiary"
                value={""}
                onChange={handleChange}
                name="beneficiary"
                isDisabled={loading}
                placeholder="Enter Beneficiary Name"
              />
            </div>
          </div>
          {/* End Left Side */}
          {/* Middle */}
          <div className="col-md-4 mb-3 mt-3">
            <div className="form__item mb-4">
              <TextInput
                label="Debit/Credit"
                value={"staff"}
                onChange={handleChange}
                name="transaction_type"
                isDisabled={loading}
                uppercase
              />
            </div>
            <div className="form__item mb-4">
              <TextInput
                label="Transaction Date"
                type="date"
                value={""}
                onChange={handleChange}
                name="transaction_date"
                isDisabled={loading}
              />
            </div>
          </div>
          {/* End Middle */}
          {/* Right Side */}
          <div className="col-md-4 mb-3"></div>
          {/* End Right Side */}
        </div>
      </div>
      <div className="col-md-3 mb-3"></div>
    </>
  );
};

export default Payment;
