/* eslint-disable react-hooks/exhaustive-deps */
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { FormPageComponentProps } from "bootstrap";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import Trip from "./modals/Trip";
import Button from "../components/forms/Button";
import { useModal } from "app/Context/ModalContext";
import { AllowanceResponseData } from "app/Repositories/Allowance/data";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatCurrency, formatOptions } from "app/Support/Helpers";
import { DepartmentResponseData } from "app/Repositories/Department/data";
import TextInput from "../components/forms/TextInput";
import { CityResponseData } from "app/Repositories/City/data";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { useParams } from "react-router-dom";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { ActionMeta } from "react-select";
import { DocumentCategoryResponseData } from "app/Repositories/DocumentCategory/data";
import { DocumentRequirementResponseData } from "app/Repositories/DocumentRequirement/data";
import { TripCategoryResponseData } from "app/Repositories/TripCategory/data";
import { TripResponseData } from "app/Repositories/Trip/data";
import emptyWallet from "../../assets/images/empty-wallet.png";
import { useClaimComponents } from "app/Hooks/useClaimComponents";
import ExpenseModal from "./modals/ExpenseModal";
import { ExpenseResponseData } from "app/Repositories/Expense/data";
import Alert from "app/Support/Alert";

interface DependencyProps {
  allowances: AllowanceResponseData[];
  departments: DepartmentResponseData[];
  cities: CityResponseData[];
  documentTypes: DocumentTypeResponseData[];
  workflows: WorkflowResponseData[];
  tripCategories: TripCategoryResponseData[];
}

const Claim: React.FC<FormPageComponentProps<ClaimResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
  loading,
  mode,
}) => {
  const { openModal, closeModal } = useModal();
  const {
    generateTrip,
    updateExpenses,
    getDuration,
    allowances,
    remunerations,
    cities,
    expenses,
    tripRepo,
    expenseRepo,
    earliestDate,
    latestDate,
    totalMoneySpent,
  } = useClaimComponents();
  const params = useParams();
  const [departments, setDepartments] = useState<DataOptionsProps[]>([]);
  const [category, setCategory] = useState<
    DocumentCategoryResponseData | undefined
  >();
  const [stage, setStage] = useState<WorkflowStageResponseData | undefined>();
  const [requiredDocs, setRequiredDocs] = useState<
    DocumentRequirementResponseData[]
  >([]);
  const [tripCategories, setTripCategories] = useState<
    TripCategoryResponseData[]
  >([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DataOptionsProps | null>(null);

  const [period, setPeriod] = useState<{ value: string }[]>([]);

  const handleDepartmentChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    const value = newValue as DataOptionsProps;
    setSelectedDepartment(value);
  };

  const handleDoc = (type: string) => {
    const docType = type.split("/");

    return docType[0];
  };

  const handleFileUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);

        console.log(files);

        if (setState) {
          setState((prev) => ({
            ...prev,
            supporting_documents: files,
          }));
        }
      } else {
        console.log("no files have been uploaded");
      }
    },
    [setState]
  );

  let classIcon: string;
  const handleIcon = (
    type: "flight-takeoff" | "flight-land" | "road" | "per-diem" | "wallet"
  ) => {
    if (type === "flight-takeoff") {
      classIcon = "ri-flight-takeoff-line";
    } else if (type === "flight-land") {
      classIcon = "ri-flight-land-line";
    } else if (type === "per-diem") {
      classIcon = "ri-hotel-bed-line";
    } else if (type === "road") {
      classIcon = "ri-roadster-line";
    } else {
      classIcon = "ri-wallet-line";
    }

    return classIcon;
  };

  const onSubmit = (
    response: object,
    mode: "store" | "update" | "destroy" | "generate"
  ) => {
    if (mode === "generate") {
      const tripResponse = response as TripResponseData;
      generateTrip(tripResponse);
    } else if (mode === "destroy") {
      Alert.flash(
        "Are you Sure?",
        "warning",
        "You will not be able to reverse this!!"
      ).then(async (result) => {
        if (result.isConfirmed) {
          const expenseResponse = response as ExpenseResponseData;
          updateExpenses(expenseResponse, mode);
        }
      });
    } else {
      const expenseResponse = response as ExpenseResponseData;
      updateExpenses(expenseResponse, mode);
    }

    closeModal();
  };

  useEffect(() => {
    const duration: { value: string }[] = [
      { value: earliestDate },
      { value: latestDate },
    ];

    setPeriod(duration);

    if (setState) {
      setState((prev) => ({
        ...prev,
        start_date: earliestDate,
        end_date: latestDate,
        expenses,
        total_amount_spent: totalMoneySpent,
      }));
    }
  }, [earliestDate, latestDate, setState, expenses, totalMoneySpent]);

  useEffect(() => {
    if (dependencies) {
      const {
        departments = [],
        workflows = [],
        documentTypes = [],
        tripCategories = [],
      } = dependencies as DependencyProps;

      setTripCategories(tripCategories);
      const docType: DocumentTypeResponseData | undefined =
        documentTypes && documentTypes.find((doc) => doc.label === "claim");

      if (docType && setState && params) {
        const { categoryId } = params;

        const catId = categoryId ? parseInt(categoryId) : 0;
        const category =
          catId > 0
            ? docType.categories.find((cat) => cat.id === catId)
            : undefined;

        setCategory(category);

        const workflow = workflows.find(
          (flow) => flow.document_type_id === docType.id
        );

        const firstStage = workflow?.stages?.find((stage) => stage.order === 1);
        setStage(firstStage);
        setRequiredDocs((firstStage && firstStage.documentsRequired) ?? []);

        setState({
          ...state,
          document_category_id: category?.id ?? 0,
          document_type_id: docType.id,
          workflow_id: workflow?.id,
        });
      }
      setDepartments(formatOptions(departments, "id", "abv"));
    }
  }, [dependencies, setState, params]);

  // console.log(totalMoneySpent);

  return (
    <>
      <div className="col-md-4 mb-4">
        <p className="claim-description">
          This is the expense analysis document that handles all expense claims.
          The following documents are required to ensure a smooth transition on
          this document: <b>{requiredDocs.map((doc) => doc.name).join(", ")}</b>
        </p>
      </div>
      <div className="col-md-12 mb-5">
        <div className="flex align gap-md">
          {category && category?.label === "trips" && (
            <Button
              label="Add Trip"
              handleClick={() =>
                openModal(
                  Trip,
                  "trip",
                  {
                    title: "Add Trip",
                    isUpdating: false,
                    onSubmit,
                    dependencies: [allowances, cities, tripCategories],
                  },
                  tripRepo.getState()
                )
              }
              variant="dark"
              size="sm"
              icon="ri-route-line"
            />
          )}
          <Button
            label="Add Expense"
            handleClick={() =>
              openModal(
                ExpenseModal,
                "expense",
                {
                  title: "Add Expense",
                  isUpdating: false,
                  onSubmit,
                  dependencies: [allowances, remunerations, period],
                },
                expenseRepo.getState()
              )
            }
            variant="danger"
            size="sm"
            icon="ri-wallet-line"
          />
        </div>
      </div>

      <div className="col-md-12">
        <div className="row">
          <div className="col-md-3 mb-3">
            <MultiSelect
              label="Sponsoring Department"
              options={departments}
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              placeholder="Sponsor"
              isSearchable
              isDisabled={loading}
            />
          </div>
          <div className="col-md-9 mb-3">
            <TextInput
              label="Purpose for this Claim"
              value={state.title}
              name="title"
              onChange={handleChange}
              placeholder="Enter purpose for this claim"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInput
              label="Start Date"
              type="date"
              value={state.start_date}
              name="start_date"
              onChange={handleChange}
              isDisabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInput
              label="End Date"
              type="date"
              value={state.end_date}
              name="end_date"
              onChange={handleChange}
              isDisabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInput
              label="Upload Supporting Documents"
              type="file"
              name="supporting_documents"
              value={state.filename}
              onChange={handleFileUpload}
              isDisabled={loading}
              accept=".jpeg,.jpg,.pdf,.png"
              isMulti
            />
          </div>
        </div>
      </div>

      <div className="col-md-4 mb-4">
        <h4 className="mb-2 claim-expenses-title">Expense Analysis</h4>
        <div className="expenditure__analysis">
          <div className="expense__container">
            {expenses.length > 0 ? (
              expenses.map((expense, i) => (
                <div key={i} className="expense__item">
                  <i
                    className={`expense-icon ${handleIcon(
                      expense?.type ?? "flight-takeoff"
                    )}`}
                  />
                  <p className="title">{expense.description}</p>
                  <small>
                    Duration:{" "}
                    {getDuration(expense.start_date, expense.end_date)}
                  </small>
                  <h3>{formatCurrency(expense.total_amount_spent)}</h3>
                  <div className="flex align end gap-sm">
                    <Button
                      size="xs"
                      label="Manage"
                      icon="ri-settings-line"
                      handleClick={() =>
                        openModal(
                          ExpenseModal,
                          "expense",
                          {
                            title: "Manager Expense",
                            isUpdating: true,
                            onSubmit,
                            data: expense,
                            dependencies: [allowances, remunerations, period],
                          },
                          tripRepo.getState()
                        )
                      }
                      variant="dark"
                    />
                    <Button
                      size="xs"
                      label="Remove"
                      icon="ri-close-line"
                      handleClick={() => onSubmit(expense, "destroy")}
                      variant="danger"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="wallet">
                <img
                  className="empty-wallet"
                  alt="empty wallet"
                  src={emptyWallet}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-md-4 mb-4">
        <h4 className="mb-2 claim-expenses-title">Supporting Documents</h4>
        <div className="expenditure__analysis files_uploaded">
          {state.supporting_documents.length > 0 ? (
            state.supporting_documents.map((document, index) => (
              <div key={index} className="exp__analysis__item">
                <i
                  className={`${
                    handleDoc(document.type) === "image"
                      ? "ri-file-image-line"
                      : "ri-file-pdf-2-line"
                  }`}
                />
                <p>{document.name}</p>
              </div>
            ))
          ) : (
            <p>No file or files have been uploaded yet</p>
          )}
        </div>
      </div>
      <div className="col-md-4 mb-4">
        <h4 className="mb-2 claim-expenses-title">Claim Payment Status</h4>
        <div className="payment-component-parts">
          <p>Total Amount Spent:</p>
          <h2>{formatCurrency(totalMoneySpent)}</h2>
        </div>
      </div>
    </>
  );
};

export default Claim;
