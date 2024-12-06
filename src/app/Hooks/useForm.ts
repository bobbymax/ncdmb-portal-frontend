import React, { useMemo, useState } from "react";
import {
  BaseRepository,
  JsonResponse,
  ViewsProps,
} from "../Repositories/BaseRepository";
import { useAsync } from "../Hooks/useAsync";
import { ServerResponse } from "../Services/RepositoryService";
import { Validator } from "../Support/Validator";
import { toast } from "react-toastify";
import { DefaultErrorHandler } from "../Handlers/DefaultErrorHandler";
import Alert from "app/Support/Alert";
import { useStateContext } from "app/Context/ContentContext";
import { ActionMeta } from "react-select";

// Define constants for action types to avoid hardcoding strings
const ACTION_STORE = "store";
const ACTION_UPDATE = "update";
const ACTION_DESTROY = "destroy";

export type ActionType =
  | typeof ACTION_STORE
  | typeof ACTION_UPDATE
  | typeof ACTION_DESTROY;

interface UseFormProps {
  onFormSubmit: (data: ServerResponse, action: ActionType) => void;
  handleValidationErrors?: (errors: string[]) => void;
}

export const useForm = <T extends BaseRepository>(
  Repository: T,
  view: ViewsProps,
  { onFormSubmit, handleValidationErrors }: UseFormProps
) => {
  const repo = useMemo(() => Repository, [Repository]);
  const [state, setState] = useState<JsonResponse>(() => ({
    ...repo.getState(),
  }));
  const { loading, error, execute } = useAsync();
  const { setIsLoading } = useStateContext();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setState((prevState) => ({
      ...prevState,
      [name]: !isNaN(Number(value)) && value !== "" ? Number(value) : value,
    }));
  };

  const handleReactSelect = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>,
    setStateCallback: (value: unknown) => void
  ) => {
    if (Array.isArray(newValue)) {
      setStateCallback(newValue);
    } else if (typeof newValue === "object" && newValue !== null) {
      setStateCallback(newValue);
    }
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

  // const updateNetworkStatus = (status: { type: string; message: string }) => {
  //   setNetworkStatus(status.message);
  // };

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
        setIsLoading(true);
        const response: ServerResponse = await execute(submitFn());

        if (response) {
          setState({ ...repo.getState() });
          onFormSubmit(response, action);
        }
      } catch (er) {
        const returnedError = er instanceof DefaultErrorHandler ? er : "Oops!!";
        console.error("Submission failed:", returnedError); // Add more detailed error handling if necessary
        toast.error("An error occurred during submission.");
      } finally {
        setIsLoading(false);
      }
    } else if (handleValidationErrors) {
      handleValidationErrors(errors); // Handle validation errors via a callback
      toast.error("Validation failed. Please correct the errors.");
    }
  };

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e, ACTION_STORE, () =>
      repo.store(view.server_url, repo.formatDataOnSubmit(state))
    );
  };

  const update = async (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e, ACTION_UPDATE, () =>
      repo.update(view.server_url, state.id, repo.formatDataOnSubmit(state))
    );
  };

  const destroy = () => {
    Alert.flash(
      "Are you Sure?",
      "warning",
      "You will not be able to reverse this!!"
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response: ServerResponse = await execute(
            repo.destroy(view.server_url, state.id)
          );

          setState(repo.getState());
          onFormSubmit(response, "destroy");
          toast.success("Record deleted successfully!");
        } catch (er) {
          console.error(er);
          toast.error("Failed to delete the record.");
        }
      }
    });
  };

  const fill = (data: JsonResponse) => {
    setState(repo.fromJson(data));
  };

  return {
    state,
    setState,
    handleChange,
    handleReactSelect,
    create,
    update,
    destroy,
    fill,
    loading,
    error,
    validate,
  };
};
