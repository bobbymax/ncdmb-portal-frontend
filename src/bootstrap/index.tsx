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
import ExternalIndexPage from "resources/views/pages/ExternalIndexPage";

export interface FormPageComponentProps {
  state: JsonResponse;
  setState?: Dispatch<SetStateAction<JsonResponse>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  error: string | null;
  loading: boolean;
  dependencies: object;
  mode: string;
}

export interface PageProps<T extends BaseRepository> {
  Repository: new (url: string) => T;
  RepositoryInstance: T;
  view: ViewsProps;
  Component: React.ComponentType<FormPageComponentProps>;
}

const renderRoute = <T extends BaseRepository>(
  repo: { name: new (url: string) => T; instance: T },
  view: ViewsProps,
  j: number
): JSX.Element => {
  const Component = lazy(
    () => import(`../resources/views/crud/${view.component}`)
  );

  const componentProps: PageProps<T> = {
    Repository: repo.name,
    RepositoryInstance: repo.instance,
    view,
    Component,
  };

  return (
    <Route
      key={`${repo.name}-${j}`}
      path={view.frontend_path}
      element={
        <AuthGuard>
          {view.type === "index" ? (
            <IndexPage {...componentProps} />
          ) : view.type === "form-page" ? (
            <ManageResourcePage {...componentProps} />
          ) : view.type === "external" ? (
            <ExternalIndexPage {...componentProps} />
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
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        {repositories.map((repo) =>
          repo.instance.views.map((view, j) => {
            return renderRoute(repo, view, j);
          })
        )}

        <Route
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
          path="/"
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
