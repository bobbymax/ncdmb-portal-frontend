/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { ActionType, useForm } from "app/Hooks/useForm";
import { useResourceActions } from "app/Hooks/useResourceActions";
import {
  BaseRepository,
  JsonResponse,
  ViewsProps,
} from "app/Repositories/BaseRepository";
import { ActionBttnProps, PageProps } from "bootstrap";
import { ServerResponse } from "app/Services/RepositoryService";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "../components/forms/Button";
import { Raw } from "app/Support/DataTable";

interface TabAction {
  action: ActionBttnProps;
  toggleTab: (value: string) => void;
  isActive: boolean;
}

export interface DocumentControlStateProps<
  T = JsonResponse,
  D = BaseRepository
> {
  Repo: D;
  data: T;
  loading: boolean;
  view: ViewsProps;
  onPeformAction?: (id: number, data: T) => void;
  dependencies: object;
}

const Tab = ({ action, toggleTab, isActive = false }: TabAction) => {
  // Watch this method for any form of misbehaving (Suspicious)
  // I decided to extract the values from the object in assumption
  // That the ${action} object must strictly contains the deconstructed keys
  // the fallback will be to add ${action.} to the keys and it will return to normal

  const { variant, label, icon, name } = action;

  return (
    <li
      className={`tab-navigation-item ${variant} ${isActive ? "active" : ""}`}
      onClick={() => toggleTab(label)}
    >
      <i className={icon} />
      <p>{name}</p>
    </li>
  );
};

const renderDocumentDetail = <T, D>(
  Repo: D,
  data: T,
  view: ViewsProps,
  loading: boolean,
  performAction: (id: number, data: T) => void,
  dependencies: object,
  suffix: string,
  idx: number
): JSX.Element => {
  const detail = view.documentControl?.find((control) =>
    control.includes(suffix)
  );

  const DocumentControlComponent = lazy(
    () => import(`../crud/control/details/${detail ?? "FallbackComponent"}`)
  );

  const controlProps: DocumentControlStateProps<T, D> = {
    Repo,
    data,
    view,
    loading,
    onPeformAction: performAction,
    dependencies,
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentControlComponent key={idx} {...controlProps} />
    </Suspense>
  );
};

const ViewResourcePage = ({ Repository, view }: PageProps<BaseRepository>) => {
  const { raw, redirectTo, back } = useResourceActions(Repository, view, {
    shouldFetch: false,
    hasParam: true,
  });

  const onFormSubmit = (response: ServerResponse, action: ActionType) => {
    toast.success(response.message);
    redirectTo(view.index_path ?? "/");
  };

  const handleValidationErrors = (errors: string[]) => {
    setErrors(errors);
  };

  const { state, dependencies, fill, loading } = useForm(Repository, view, {
    onFormSubmit,
    handleValidationErrors,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [actionComponent, setActionComponent] = useState<
    ActionBttnProps | undefined
  >();

  const actionBttns: ActionBttnProps[] = [
    {
      variant: "info",
      name: "Details",
      label: "details",
      icon: "ri-list-view",
      component: "Details",
    },
    {
      variant: "dark",
      name: "Tracking",
      label: "tracking",
      icon: "ri-phone-find-line",
      component: "Tracking",
    },
    {
      variant: "success",
      name: "Updates",
      label: "updates",
      icon: "ri-loop-right-line",
      component: "Updates",
    },
    {
      variant: "danger",
      name: "Recall",
      label: "recall",
      icon: "ri-git-pull-request-line",
      component: "Recall",
    },
    {
      variant: "warning",
      name: "Sing Document",
      label: "sign",
      icon: "ri-sketching",
      component: "SignDocument",
    },
    {
      variant: "secondary",
      name: "Print",
      label: "print",
      icon: "ri-printer-line",
      component: "Print",
    },
  ];

  const handleTabToggle = (value: string) => {
    setActiveTab((prev) => (prev !== value ? value : "details"));
  };

  const handlePerformAction = (id: number, raw: JsonResponse) => {
    console.log("Performing action with data:", raw);
  };

  const handleDocumentUpdate = (raw: Raw, action: string) => {
    switch (action) {
      case "store":
        toast.info("Document stored.");
        break;
      default:
        console.log("Unhandled action:", action);
        break;
    }
  };

  // Effects
  useEffect(() => {
    if (view.mode === "update" && raw) fill(raw);
  }, [view.mode, raw, fill]);

  useEffect(() => {
    setActionComponent(
      actionBttns.find((action) => action.label === activeTab)
    );
  }, [activeTab]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12 mb-3">
          <div className="view-page-header">
            <h1
              style={{
                fontWeight: 500,
                letterSpacing: 0.7,
                color: "#4c934c",
              }}
            >
              {view.title}
            </h1>
            <Button
              label="Go Back"
              variant="danger"
              rounded
              handleClick={back}
              icon="ri-arrow-left-line"
              isDisabled={loading}
            />
          </div>
        </div>
        <div className="col-md-12 mb-3">
          <div className="row">
            <div className="col-md-9">
              <div className="custom-card document-activities">
                <nav className="tab-navigation mb-4">
                  <ul>
                    {actionBttns.map((action, i) => (
                      <Tab
                        key={i}
                        action={action}
                        toggleTab={handleTabToggle}
                        isActive={activeTab === action.label}
                      />
                    ))}
                  </ul>
                </nav>

                <div className="tab__body__content">
                  {actionComponent &&
                    renderDocumentDetail(
                      Repository,
                      state,
                      view,
                      loading,
                      handlePerformAction,
                      dependencies,
                      actionComponent.component,
                      actionBttns.indexOf(actionComponent)
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewResourcePage;
