import React, { useMemo, useState } from "react";
import { BaseRepository, JsonResponse } from "@repositories/BaseRepository";
import { useAsync } from "@hooks/useAsync";
import { ServerResponse } from "@services/RepositoryService";
import { Validator } from "@support/Validator";
import { toast } from "react-toastify";
import { DefaultErrorHandler } from "@handlers/DefaultErrorHandler";

// Define constants for action types to avoid hardcoding strings
const ACTION_STORE = "store";
const ACTION_UPDATE = "update";
const ACTION_DESTROY = "destroy";

type ActionType =
  | typeof ACTION_STORE
  | typeof ACTION_UPDATE
  | typeof ACTION_DESTROY;

interface UseFormProps {
  onFormSubmit: (data: ServerResponse, action: ActionType) => void;
  handleValidationErrors?: (errors: string[]) => void;
}

export const useForm = <T extends BaseRepository>(
  Repository: new () => T,
  { onFormSubmit, handleValidationErrors }: UseFormProps
) => {
  const repo = useMemo(() => new Repository(), [Repository]);
  const [state, setState] = useState<JsonResponse>(() => ({
    ...repo.getState(),
  }));
  const { loading, error, execute } = useAsync();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = (
    data: Record<string, any>
  ): { success: boolean; errors: string[] } => {
    if (Object.keys(repo.rules).length > 0 && repo.fillables.length > 0) {
      const validator = new Validator(repo.fillables, repo.rules, data);
      validator.validate();

      if (validator.fails()) {
        return { success: false, errors: validator.getErrors() };
      }
    }

    return { success: true, errors: [] };
  };

  // Extract the form submission logic for reuse (DRY principle)
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    action: ActionType,
    submitFn: () => Promise<ServerResponse>
  ) => {
    e.preventDefault();

    const data = repo.formatDataOnSubmit(state);
    const { success, errors } = validate(data);

    if (success) {
      try {
        const response: ServerResponse = await execute(submitFn());

        if (response) {
          setState({ ...repo.getState() }); // Reset the state after successful submission
          onFormSubmit(response, action); // Callback with response and action type
          toast.success(`Record was ${action}d successfully!`);
        }
      } catch (er) {
        const returnedError = er instanceof DefaultErrorHandler ? er : "Oops!!";
        console.error("Submission failed:", returnedError); // Add more detailed error handling if necessary
        toast.error("An error occurred during submission.");
      }
    } else if (handleValidationErrors) {
      handleValidationErrors(errors); // Handle validation errors via a callback
      toast.error("Validation failed. Please correct the errors.");
    }
  };

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e, ACTION_STORE, () =>
      repo.store(repo.formatDataOnSubmit(state))
    );
  };

  const update = async (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e, ACTION_UPDATE, () =>
      repo.update(state.id, repo.formatDataOnSubmit(state))
    );
  };

  const destroy = async () => {
    try {
      const response: ServerResponse = await execute(repo.destroy(state.id));

      setState(repo.getState());
      onFormSubmit(response, "destroy");
      toast.success("Record deleted successfully!");
    } catch (er) {
      console.error(er);
      toast.error("Failed to delete the record.");
    }
  };

  const fill = (data: JsonResponse) => {
    setState(repo.fromJson(data));
  };

  return {
    state,
    handleChange,
    create,
    update,
    destroy,
    fill,
    loading,
    error,
  };
};
