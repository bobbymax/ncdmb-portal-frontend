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
  JsonResponse,
  ViewsProps,
} from "app/Repositories/BaseRepository";
import ResourceRawPage from "resources/views/pages/ResourceRawPage";
import ManageResourcePage from "resources/views/pages/ManageResourcePage";
import { AuthProvider } from "app/Context/AuthContext";
import { ActionMeta } from "react-select";
import CardPage from "resources/views/pages/CardPage";

export interface CardPageComponentPropos<T = JsonResponse, D = BaseRepository> {
  collection: T[];
  Repository: D;
  onManageRawData: (raw: T, label: string, url?: string) => void;
  View: ViewsProps;
  // columns:
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

export interface PageProps<T extends BaseRepository> {
  Repository: T;
  view: ViewsProps;
  Component: React.ComponentType<FormPageComponentProps>;
  CardPageComponent: React.ComponentType<CardPageComponentPropos>;
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
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
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
    </AuthProvider>
  );
};

export default Main;
