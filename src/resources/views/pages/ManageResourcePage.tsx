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
  view,
  Component,
}: PageProps<BaseRepository>) => {
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

  const {
    state,
    setState,
    validate,
    handleChange,
    handleReactSelect,
    create,
    update,
    destroy,
    dependencies,
    fill,
    loading,
    error,
  } = useForm(Repository, view, {
    onFormSubmit,
    handleValidationErrors,
  });

  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const isValidated = () => {
      const { success, errors } = validate(state);
      setIsDisabled(success);
      handleValidationErrors(errors);
    };

    isValidated();
  }, [state]);

  useEffect(() => {
    if (view.mode === "update" && raw) {
      fill(raw);
    }
  }, [view.mode, raw]);

  return (
    <div className="container-fluid">
      <div className="custom-card file__card">
        <div className="custom-card-header flex align between mb-5">
          <h1
            style={{
              fontWeight: 500,
              letterSpacing: 0.7,
              textTransform: "uppercase",
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
            size="sm"
          />
        </div>
        <form
          onSubmit={view.mode === "update" ? update : create}
          encType="multipart/form-data"
        >
          <div className="row">
            <Component
              state={state}
              setState={setState}
              handleChange={handleChange}
              handleReactSelect={handleReactSelect}
              loading={loading}
              error={error}
              validationErrors={errors}
              dependencies={dependencies}
              mode={view.mode}
            />
            <div className="col-md-12">
              <div className="flex align gap-md">
                <Button
                  type="submit"
                  label={view?.action}
                  icon="ri-function-add-fill"
                  isDisabled={!isDisabled || loading}
                  variant="success"
                  size="xl"
                />
                {view.mode === "update" && (
                  <Button
                    label="Destory"
                    icon="ri-delete-bin-5-line"
                    handleClick={() => destroy()}
                    isDisabled={loading}
                    variant="danger"
                    size="xl"
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
