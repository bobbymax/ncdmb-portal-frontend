import { ActionType, useForm } from "app/Hooks/useForm";
import { useResourceActions } from "app/Hooks/useResourceActions";
import { BaseRepository } from "app/Repositories/BaseRepository";
import { ServerResponse } from "app/Services/RepositoryService";
import { PageProps } from "bootstrap";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ResourceRawPage = ({
  Repository,
  view,
  Component,
}: PageProps<BaseRepository>) => {
  // Pull in the same resources as ManageResourcePage
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

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (view.mode === "update" && raw) {
      fill(raw);
    }
  }, [view.mode, raw, fill]);

  // Empty canvas - build your custom implementation here
  // You have access to all the same resources as ManageResourcePage:
  // - state, setState
  // - raw data
  // - loading, error
  // - create, update, destroy methods
  // - dependencies
  // - navigation (back, redirectTo)
  // - validate, handleChange, handleReactSelect
  
  return (
    <div className="container-fluid">
      {/* Your custom implementation goes here */}
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
    </div>
  );
};

export default ResourceRawPage;
