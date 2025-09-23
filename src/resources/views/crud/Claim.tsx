/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Trip from "./modals/Trip";
import Button from "../components/forms/Button";
import { useModal } from "app/Context/ModalContext";
import { AllowanceResponseData } from "app/Repositories/Allowance/data";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatCurrency, formatOptions } from "app/Support/Helpers";
import { DepartmentResponseData } from "app/Repositories/Department/data";
import { CityResponseData } from "app/Repositories/City/data";
import { useLocation, useParams } from "react-router-dom";
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
import _ from "lodash";
import { UploadResponseData } from "app/Repositories/Document/data";
import filePath from "../../assets/images/file.webp";
import { toast } from "react-toastify";
import Textarea from "../components/forms/Textarea";
import { useStateContext } from "app/Context/ContentContext";
import imageIcon from "../../assets/images/image-icon.png";
import pdfIcon from "../../assets/images/pdf-icon.webp";
import Dropzone from "../components/forms/Dropzone";
import moment from "moment";
import { AuthPageResponseData } from "app/Repositories/Page/data";

interface DependencyProps {
  allowances: AllowanceResponseData[];
  departments: DepartmentResponseData[];
  cities: CityResponseData[];
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
    loadExpensesOnUpdate,
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
  const { pages } = useStateContext();
  const { pathname } = useLocation();

  const departments = useMemo(() => {
    const resources = dependencies as DependencyProps;
    return formatOptions(resources?.departments ?? [], "id", "abv");
  }, [dependencies]);
  const tripCategories = useMemo(() => {
    const resources = dependencies as DependencyProps;
    return resources?.tripCategories ?? [];
  }, [dependencies]);

  const [uploads, setUploads] = useState<File[]>([]);
  const [category, setCategory] = useState<
    DocumentCategoryResponseData | undefined
  >();
  const [requiredDocs, setRequiredDocs] = useState<
    DocumentRequirementResponseData[]
  >([]);

  const [selectedDepartment, setSelectedDepartment] =
    useState<DataOptionsProps | null>(null);

  const [period, setPeriod] = useState<{ value: string }[]>([]);

  const handleDepartmentChange = useCallback(
    (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
      const value = newValue as DataOptionsProps;
      setSelectedDepartment(value);
      if (setState) {
        setState((prev) => ({
          ...prev,
          sponsoring_department_id: value.value,
        }));
      }
    },
    [setState]
  );

  const handleDoc = (type: string) => {
    const docType = type.split("/");
    return docType[0];
  };

  const onSubmit = (
    response: object | string,
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
          if (setState) {
            const prevArr = state.deletedExpenses ?? [];
            setState((prev) => ({
              ...prev,
              deletedExpenses: [expenseResponse, ...prevArr],
            }));
          }
        }
      });
    } else {
      const expenseResponse = response as ExpenseResponseData;
      updateExpenses(expenseResponse, mode);
    }

    closeModal();
  };

  const durationFormat = () => {
    if (state.start_date === "" || state.end_date === "") {
      return "The date period for this claim has not been set!";
    }

    const start = moment(state.start_date);
    const end = moment(state.end_date);

    return `${start.format("ll")} - ${end.format("ll")}`;
  };

  const onFileDelete = (file: UploadResponseData) => {
    Alert.flash(
      "Are you Sure?",
      "warning",
      "Confirm you want to delete this file from this folder?"
    ).then((result) => {
      if (result.isConfirmed) {
        if (setState) {
          const prevUploads = state.deletedUploads ?? [];
          setState((prev) => ({
            ...prev,
            uploads: prev.uploads?.filter((upload) => upload.id !== file.id),
            deletedUploads: [file, ...prevUploads],
          }));
        }

        toast.success("File has been deleted successfully!!");
      }
    });
  };

  const getPage = (name: string, pages: AuthPageResponseData[]) => {
    const pathArr = name.split("/");
    const path = `/${pathArr[1]}/${pathArr[2]}`;

    return pages.find((pg) => pg.path === path);
  };

  useEffect(() => {
    if (uploads.length > 0 && setState) {
      setState((prev) => ({
        ...prev,
        supporting_documents: _.uniqWith(uploads, _.isEqual),
      }));
    }
  }, [uploads, setState]);

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
    if (dependencies && pathname !== "" && pages.length > 0) {
      // Find Current Page
      const page = getPage(pathname, pages);

      if (!page) {
        // Page must be found
      }

      const categories = page?.documentType?.categories;

      if (categories) {
        const { categoryId } = params;

        const catLabel = categoryId ?? "";
        const category =
          catLabel !== ""
            ? categories.find((cat) => cat.label === catLabel)
            : undefined;

        setCategory(category);

        if (setState) {
          setState({
            ...state,
            document_category_id: category?.id ?? 0,
            document_type_id: page.document_type_id,
            workflow_id: page.workflow_id,
          });
        }
      }
    }
  }, [dependencies, setState, params, pages, pathname]);

  useEffect(() => {
    if (
      mode === "update" &&
      state.sponsoring_department_id > 0 &&
      departments.length > 0
    ) {
      loadExpensesOnUpdate(state.expenses);

      const dept = departments.find(
        (department) =>
          Number(department.value) === Number(state.sponsoring_department_id)
      );

      if (dept) {
        setSelectedDepartment(dept);
      }
    }
  }, [mode, state.sponsoring_department_id, state.expenses, departments]);

  return (
    <>
      <div className="col-md-4 mb-4">
        <p className="claim-description">
          Documents to be checked at this stage are:{" "}
          <b>{requiredDocs.map((doc) => doc.name).join(", ")}</b>
        </p>
      </div>
      <div className="col-md-12 mb-5">
        <div className="flex align gap-md">
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
            variant="success"
            size="sm"
            icon="ri-wallet-line"
          />
        </div>
      </div>

      <div className="col-md-4 mb-4">
        <div className="row">
          <div className="col-md-12 mb-3">
            <Textarea
              label="Purpose for this Claim"
              value={state.title}
              name="title"
              onChange={handleChange}
              placeholder="Enter purpose for this claim"
              rows={3}
            />
          </div>

          <div className="col-md-12 mb-3">
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

          <div className="col-md-12 mb-4">
            <Dropzone
              label="Upload Supporting Documents"
              files={uploads}
              setFiles={setUploads}
            />
          </div>

          <div className="col-md-12 mb-4">
            <div className="payment-component-parts">
              <p className="mb-2">Trip Duration:</p>
              <span
                style={{
                  textTransform: "uppercase",
                  fontSize: 12,
                  letterSpacing: 1.5,
                  fontWeight: 600,
                  color: state.start_date === "" ? "red" : "#555",
                }}
              >
                {durationFormat()}
              </span>
            </div>
            <div className="payment-component-parts">
              <p>Total Amount Spent:</p>
              <h2>{formatCurrency(totalMoneySpent)}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-4 mb-4">
        <h4 className="mb-2 claim-expenses-title">Expense Analysis</h4>
        <div
          className={`expenditure__analysis ${
            expenses.length < 1 ? "is_empty" : ""
          }`}
        >
          <div className="expense__container">
            {expenses.length > 0 ? (
              expenses.map((expense, i) => (
                <div key={i} className="expense__item">
                  <div className="top--ly">
                    <i className={`expense-icon ri-wallet-line`} />
                    <div>
                      <p className="title">{expense.description}</p>
                      <small style={{ textAlign: "right" }}>
                        Duration:{" "}
                        {getDuration(expense.start_date, expense.end_date)}
                      </small>
                    </div>
                  </div>
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

      {/* Supporting Documents Section */}
      <div className="col-md-4 mb-4">
        <h4 className="mb-2 claim-expenses-title">Supporting Documents</h4>
        <div
          className={`expenditure__analysis files_uploaded ${
            state.supporting_documents.length < 1 ? "is_empty" : ""
          } mb-4`}
        >
          {state.supporting_documents.length > 0 ? (
            state.supporting_documents.map((document, index) => (
              <div key={index} className="exp__analysis__item">
                <img
                  src={
                    handleDoc(document.type) === "image" ? imageIcon : pdfIcon
                  }
                  alt="uploaded files"
                />
                <p>{document.name}</p>
              </div>
            ))
          ) : (
            <p>No file or files have been uploaded yet</p>
          )}
        </div>

        {mode === "update" && (
          <div className="col-md-8 mb-4">
            <h4 className="claim-expenses-title">Uploaded Documents</h4>
            <div className="uploaded__documents">
              {state.uploads?.map((upload, i) => (
                <div key={i} className="uploaded__document__item">
                  <div className="uploaded__document__item__icon">
                    <img src={filePath} alt="file icon" />
                  </div>
                  <div
                    className="icon__close"
                    onClick={() => onFileDelete(upload)}
                  >
                    <i className="ri-close-line" />
                  </div>
                  <p>{upload.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Claim;
