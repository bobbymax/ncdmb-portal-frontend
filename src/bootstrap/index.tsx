import Dashboard from "../resources/views/Dashboard";
import { Dispatch, lazy, SetStateAction, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Guest from "resources/templates/Guest";
import Login from "../resources/views/auth/Login";
import { AuthGuard } from "../app/Guards/AuthGuard";
import repositories from "./repositories";
import IndexPage from "resources/views/pages/IndexPage";
import {
  BaseRepository,
  BaseResponse,
  JsonResponse,
  ViewsProps,
  PaginationMeta,
} from "app/Repositories/BaseRepository";
import ResourceRawPage from "resources/views/pages/ResourceRawPage";
import ManageResourcePage from "resources/views/pages/ManageResourcePage";
import { ActionMeta } from "react-select";
import CardPage from "resources/views/pages/CardPage";
import ViewResourcePage from "resources/views/pages/ViewResourcePage";
// import FileDocket from "resources/views/pages/FileDocket";
import Builder from "resources/views/pages/Builder";
import PageLoader from "resources/views/components/loaders/PageLoader";
import { TemplateResponseData } from "@/app/Repositories/Template/data";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { BlockDataType } from "@/app/Repositories/Block/data";
import GenerateDocument from "resources/views/pages/GenerateDocument";
import BuildTemplate from "resources/views/pages/BuildTemplate";
import PerformanceDashboard from "resources/views/PerformanceDashboard";
import LandingPage from "resources/views/LandingPage";

export interface ActionBttnProps {
  variant: string;
  name: string;
  label: string;
  icon: string;
  component: string;
}

export interface CardPageComponentProps<T = JsonResponse, D = BaseRepository> {
  collection: T[];
  Repository: D;
  onManageRawData: (raw: T, label: string, url?: string) => void;
  View: ViewsProps;
  pagination?: PaginationMeta | null;
  loadMore?: () => void;
  loadingMore?: boolean;
  refresh?: () => void;
  // columns:
}

export interface ViewPageComponentProps<T = JsonResponse, D = BaseRepository> {
  data: T;
  Repository: D;
  View: ViewsProps;
  dependencies: object;
  onDocumentUpdate: (state: T, action: string) => void;
  loading: boolean;
}

export interface FileDocketComponentProps<
  D = JsonResponse,
  T = BaseRepository
> {
  data: D;
  Repository: T;
  View: ViewsProps;
  dependencies: object;
  onDocumentUpdate: (state: T, action: string) => void;
  loading: boolean;
  analysis?: Record<string, unknown>;
}

export interface FormPageComponentProps<T = JsonResponse> {
  state: T;
  setState?: Dispatch<SetStateAction<T>>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleReactSelect: (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>,
    setStateCallback: (value: unknown) => void
  ) => void;
  error: string | null;
  validationErrors?: string[];
  loading: boolean;
  dependencies: object;
  mode: string;
}

export interface BuilderComponentProps<
  T extends BaseResponse,
  D extends BaseRepository
> {
  repo: D;
  resource?: T | null;
  state: T;
  setState?: Dispatch<SetStateAction<T>>;
  generatedData: unknown;
  updateGlobalState: (
    generatorData: unknown,
    identifier: BlockDataType
  ) => void;
  dependencies: object;
}

export interface DocumentGeneratorComponentProps<
  D extends BaseRepository,
  T extends BaseResponse
> {
  repo: D;
  collection: T[];
  state: DocumentResponseData;
  setState: Dispatch<SetStateAction<DocumentResponseData>>;
  plug: (data: T) => void;
  service: string;
  category: DocumentCategoryResponseData | null;
  template: TemplateResponseData | null;
  updateGlobalState: (
    generatorData: unknown,
    identifier: BlockDataType
  ) => void;
}

export interface PageProps<T extends BaseRepository> {
  Repository: T;
  view: ViewsProps;
  Component: React.ComponentType<FormPageComponentProps>;
  CardPageComponent: React.ComponentType<CardPageComponentProps>;
  ViewPageComponent: React.ComponentType<ViewPageComponentProps>;
  FileDocketComponent: React.ComponentType<FileDocketComponentProps>;
  BuilderComponent: React.ComponentType<
    BuilderComponentProps<JsonResponse, BaseRepository>
  >;
  DocumentGeneratorComponent: React.ComponentType<
    DocumentGeneratorComponentProps<BaseRepository, BaseResponse>
  >;
}

const renderRoute = <T extends BaseRepository>(
  repo: T,
  view: ViewsProps,
  j: number
): JSX.Element => {
  const Component = lazy(
    () => import(`../resources/views/crud/${view.component}`)
  );

  const componentProps: PageProps<T> = {
    Repository: repo,
    view,
    Component,
    CardPageComponent: Component,
    ViewPageComponent: Component,
    FileDocketComponent: Component,
    BuilderComponent: Component,
    DocumentGeneratorComponent: Component,
  };

  return (
    <Route
      key={`${view.title}-${j}`}
      path={view.frontend_path}
      element={
        <AuthGuard>
          {view.type === "index" ? (
            <IndexPage {...componentProps} />
          ) : view.type === "form" ? (
            <ManageResourcePage {...componentProps} />
          ) : view.type === "card" ? (
            <CardPage {...componentProps} />
          ) : view.type === "page" ? (
            <ViewResourcePage {...componentProps} />
          ) : view.type === "builder" || view.type === "configuration" ? (
            <Builder {...componentProps} />
          ) : view.type === "generator" ? (
            <GenerateDocument {...componentProps} />
          ) : view.type === "docket" ? (
            // <FileDocket {...componentProps} />
            <div>FileDocket</div>
          ) : view.type === "configurator" ? (
            <BuildTemplate {...componentProps} />
          ) : (
            <ResourceRawPage {...componentProps} />
          )}
        </AuthGuard>
      }
    />
  );
};

const Main = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {repositories.map((repo) =>
          repo.views.map((view, j) => {
            return renderRoute(repo, view, j);
          })
        )}

        <Route element={<LandingPage />} path="/" />

        <Route
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
          path="/insights"
        />
        <Route
          element={
            <AuthGuard>
              <PerformanceDashboard />
            </AuthGuard>
          }
          path="/performance"
        />
        <Route
          element={
            <Guest>
              <Login />
            </Guest>
          }
          path="/auth/login"
        />
      </Routes>
    </Suspense>
  );
};

export default Main;
