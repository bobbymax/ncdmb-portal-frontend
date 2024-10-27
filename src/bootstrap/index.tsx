import Users from "../resources/views/Users";
import Dashboard from "../resources/views/Dashboard";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Guest from "resources/templates/Guest";
import Login from "../resources/views/auth/Login";
import { AuthGuard } from "../app/Guards/AuthGuard";

const Main = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
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
            <AuthGuard>
              <Users />
            </AuthGuard>
          }
          path="/users"
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
