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
} from "app/Repositories/BaseRepository";
import ResourceRawPage from "resources/views/pages/ResourceRawPage";
import ManageResourcePage from "resources/views/pages/ManageResourcePage";
import { AuthProvider } from "app/Context/AuthContext";
import { ActionMeta } from "react-select";
import CardPage from "resources/views/pages/CardPage";
import ViewResourcePage from "resources/views/pages/ViewResourcePage";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import FileDocket from "resources/views/pages/FileDocket";
import { FileTemplateResponseData } from "app/Repositories/FileTemplate/data";
import Builder from "resources/views/pages/Builder";
import PageLoader from "resources/views/components/loaders/PageLoader";
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
  T extends JsonResponse,
  D extends BaseRepository
> {
  repo: D;
  // components: TemplateItem[];
  // orientation: "portrait" | "landscape";
  resource?: T | null;
  state: T;
  setState?: Dispatch<SetStateAction<T>>;
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
          ) : view.type === "builder" ? (
            <Builder {...componentProps} />
          ) : view.type === "docket" ? (
            <FileDocket {...componentProps} />
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

        <Route
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
          path="/:id"
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
