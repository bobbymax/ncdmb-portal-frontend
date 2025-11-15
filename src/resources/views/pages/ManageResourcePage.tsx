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

      // console.log(errors);
      setIsDisabled(success);
      handleValidationErrors(errors);

      // console.log(errors);
    };

    isValidated();
  }, [state]);

  useEffect(() => {
    if (view.mode === "update" && raw) {
      fill(raw);
    }
  }, [view.mode, raw]);

  // console.log(state);

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
        {/* Validation Errors Display */}
        {errors && errors.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-12">
              <div
                style={{
                  padding: "16px 20px",
                  backgroundColor: "#fef2f2",
                  borderRadius: "12px",
                  border: "2px solid #fecaca",
                  boxShadow: "0 4px 6px rgba(220, 38, 38, 0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
                    }}
                  >
                    <i
                      className="ri-error-warning-fill"
                      style={{ color: "white", fontSize: "20px" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: "0 0 12px",
                        color: "#dc2626",
                        fontWeight: 600,
                        fontSize: "15px",
                        letterSpacing: "0.3px",
                      }}
                    >
                      Please fix the following errors before submitting:
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "20px",
                        listStyle: "none",
                      }}
                    >
                      {errors.map((error, index) => (
                        <li
                          key={index}
                          style={{
                            color: "#991b1b",
                            fontSize: "14px",
                            marginBottom: "8px",
                            lineHeight: "1.6",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              color: "#dc2626",
                              fontSize: "12px",
                              marginTop: "4px",
                              flexShrink: 0,
                            }}
                          >
                            •
                          </span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
