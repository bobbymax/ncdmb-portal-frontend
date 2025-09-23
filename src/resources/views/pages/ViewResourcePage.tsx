import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useForm } from "app/Hooks/useForm";
import { useResourceActions } from "app/Hooks/useResourceActions";
import {
  BaseRepository,
  JsonResponse,
  TabOptionProps,
  ViewsProps,
} from "app/Repositories/BaseRepository";
import { PageProps } from "bootstrap";
import { toast } from "react-toastify";
import Button from "../components/forms/Button";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";

export interface TabAction {
  action: TabOptionProps;
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
  onPerformAction?: (id: number, data: T) => void;
  dependencies: Record<string, unknown>;
  tab: TabOptionProps;
}

const Tab = React.memo(({ action, toggleTab, isActive = false }: TabAction) => {
  const { variant, label, icon, title } = action;

  return (
    <li
      className={`tab-navigation-item ${variant} ${isActive ? "active" : ""}`}
      onClick={() => toggleTab(label)}
    >
      <i className={icon} />
      <p>{title}</p>
    </li>
  );
});

const renderDocumentDetail = <T, D>(
  props: DocumentControlStateProps<T, D> & { component: string; idx: number }
): JSX.Element => {
  const { component, idx, ...controlProps } = props;
  const sanitizedComponent =
    component.replace(/[^a-zA-Z0-9]/g, "") || "FallbackComponent";

  try {
    const DocumentControlComponent = lazy(
      () => import(`../crud/tabs/${sanitizedComponent}`)
    );

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DocumentControlComponent key={sanitizedComponent} {...controlProps} />
      </Suspense>
    );
  } catch (error) {
    // Error loading component
    return <div>Error loading component: {sanitizedComponent}</div>;
  }
};

const ViewResourcePage = ({ Repository, view }: PageProps<BaseRepository>) => {
  const { raw, redirectTo, back } = useResourceActions(Repository, view, {
    shouldFetch: false,
    hasParam: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("summary");

  const { state, dependencies, fill, loading } = useForm(Repository, view, {
    onFormSubmit: (response) => {
      toast.success(response.message);
      redirectTo(view.index_path ?? "/");
    },
    handleValidationErrors: setErrors,
  });

  const actionBttns = useMemo(() => view.tabs ?? [], [view.tabs]);
  const activeActionComponent = useMemo(
    () => actionBttns.find((tab) => tab.label === activeTab),
    [actionBttns, activeTab]
  );

  const handleTabToggle = useCallback(
    (value: string) => {
      if (value !== activeTab) setActiveTab(value);
    },
    [activeTab]
  );

  useEffect(() => {
    if (view.mode === "update" && raw) fill(raw);
  }, [view.mode, raw, fill]);

  if (loading) {
    return <div className="loading-indicator">Loading resources...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12 mb-3">
          <div className="view-page-header">
            <h1 className="view-title">{view.title}</h1>
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
            {/* Tabs and Main Content */}
            <div className="col-md-9 mb-3">
              <div className="custom-card document-activities">
                <nav className="tab-navigation mb-4">
                  <ul>
                    {actionBttns.map((action) => (
                      <Tab
                        key={action.label}
                        action={action}
                        toggleTab={handleTabToggle}
                        isActive={activeTab === action.label}
                      />
                    ))}
                  </ul>
                </nav>
                <div className="tab__body__content">
                  {activeActionComponent &&
                    renderDocumentDetail({
                      tab: activeActionComponent,
                      Repo: Repository,
                      data: state,
                      view,
                      loading,
                      onPerformAction: () => {},
                      dependencies: dependencies as Record<string, unknown>,
                      component: activeActionComponent.component,
                      idx: actionBttns.indexOf(activeActionComponent),
                    })}
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="col-md-3 mb-3">
              <div className="custom-card document-sidebar">
                <div className="small__title mb-3">Tracking</div>
                <div className="progress__tracking__container">
                  {/* {trackers.map((progress) => (
                    <div
                      className={`tracker__item ${
                        !currentTracker ||
                        (currentTracker &&
                          progress.order > currentTracker?.order)
                          ? "saturated"
                          : ""
                      }`}
                      key={progress.id}
                    >
                      {progress.id === currentTracker?.id ? (
                        <div className="heartbeat-container">
                          <div className="heartbeat" />
                        </div>
                      ) : (
                        <div className="tracker__circle__container">
                          <div className="tracker__circle" />
                        </div>
                      )}
                      <div className="tracking__details">
                        <small>
                          <span className="progress__type">
                            {progress.stage?.stage_category?.name}
                          </span>
                          {progress.id === currentTracker?.id && (
                            <span className="current__stage">current</span>
                          )}
                        </small>
                        <div className="tracker__header">
                          <img
                            src={`https://portal.test/${progress.stage?.stage_category?.icon_path}`}
                            alt="Logo Process"
                          />
                          <h3>{progress.stage?.name}</h3>
                        </div>
                      </div>
                    </div>
                  ))} */}
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
