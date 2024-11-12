/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { ActionType, useForm } from "app/Hooks/useForm";
import { useResourceActions } from "app/Hooks/useResourceActions";
import { BaseRepository, JsonResponse } from "app/Repositories/BaseRepository";
import { ServerResponse } from "app/Services/RepositoryService";
import { PageProps } from "bootstrap";
import { useEffect, useState } from "react";
import Button from "../components/forms/Button";
import { toast } from "react-toastify";

const ManageResourcePage = ({
  Repository,
  RepositoryInstance,
  view,
  Component,
}: PageProps<BaseRepository>) => {
  const { raw, redirectTo } = useResourceActions(Repository, {
    url: view.server_url,
    shouldFetch: false,
    hasParam: true,
  });

  const onFormSubmit = (response: ServerResponse, action: ActionType) => {
    // console.log(response);
    toast.success(response.message);
    redirectTo(view.index_path ?? "/");
  };

  const handleValidationErrors = (errors: string[]) => {};

  const {
    state,
    setState,
    validate,
    handleChange,
    create,
    update,
    destroy,
    fill,
    loading,
    error,
  } = useForm(Repository, view, {
    onFormSubmit,
    handleValidationErrors,
  });
  const [dependencies, setDependencies] = useState({});
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    const isValidated = () => {
      const { success } = validate(state);
      setIsDisabled(success);
      // console.log(errors);
    };

    isValidated();
  }, [state]);

  useEffect(() => {
    if (RepositoryInstance.associatedResources.length > 0) {
      const getDependencies = async () => {
        const response = await RepositoryInstance.dependencies();
        setDependencies(response);
      };

      getDependencies();
    }
  }, [RepositoryInstance.associatedResources]);

  useEffect(() => {
    if (view.mode === "update" && raw) {
      fill(raw);
    }
  }, [view.mode, raw]);

  return (
    <div className="container">
      <div className="custom-card">
        <div className="custom-card-header mb-4">
          <h4
            style={{
              textTransform: "uppercase",
              fontWeight: 800,
              letterSpacing: 1.5,
            }}
          >
            {view.title}
          </h4>
        </div>
        <form onSubmit={view.mode === "update" ? update : create}>
          <div className="row">
            <Component
              state={state}
              setState={setState}
              handleChange={handleChange}
              loading={loading}
              error={error}
              dependencies={dependencies}
              mode={view.mode}
            />
            <div className="col-md-12">
              <div className="flex align gap-md">
                <Button
                  type="submit"
                  label={view?.action}
                  icon="ri-function-add-fill"
                  isDisabled={!isDisabled}
                />
                {view.mode === "update" && (
                  <Button
                    label="Destory"
                    icon="ri-delete-bin-5-line"
                    handleClick={() => destroy()}
                    variant="danger"
                  />
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageResourcePage;
