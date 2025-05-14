/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const [dependencies, setDependencies] = useState<object>({});
  const { loading, error, execute } = useAsync();
  const { setIsLoading } = useStateContext();

  // Handle changes for form inputs
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value, type } = e.target;

      setState((prevState) => ({
        ...prevState,
        [name]: type === "number" ? value : value,
      }));
    },
    []
  );

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

  // Validation logic
  const validate = useCallback(
    (
      data: Record<string, any> | FormData
    ): { success: boolean; errors: string[] } => {
      if (data instanceof FormData) {
        const requiredFields = repo.fillables.filter(
          (field) => !data.has(field)
        );

        // console.log(requiredFields);

        if (requiredFields.length > 0) {
          return {
            success: false,
            errors: requiredFields.map((field) => `${field} is required.`),
          };
        }

        return { success: true, errors: [] };
      }

      if (Object.keys(repo.rules).length > 0 && repo.fillables.length > 0) {
        const validator = new Validator(repo.fillables, repo.rules, data);
        validator.validate();

        if (validator.fails()) {
          return { success: false, errors: validator.getErrors() };
        }
      }

      return { success: true, errors: [] };
    },
    [repo.fillables, repo.rules]
  );

  // const updateNetworkStatus = (status: { type: string; message: string }) => {
  //   setNetworkStatus(status.message);
  // };

  // Submission handler with error handling
  const handleSubmit = useCallback(
    async (
      e: React.FormEvent<HTMLFormElement>,
      action: ActionType,
      submitFn: () => Promise<ServerResponse>
    ) => {
      e.preventDefault();

      // const data = repo.formatDataOnSubmit(state);
      const { success, errors } = validate(state);

      if (success) {
        try {
          setIsLoading(true);
          const response: ServerResponse = await execute(submitFn());

          if (response) {
            setState({ ...repo.getState() });
            onFormSubmit(response, action);
          }
        } catch (er) {
          if (er instanceof DefaultErrorHandler) {
            toast.error(er.message || "An error occurred during submission.");
          } else if (er instanceof Error) {
            toast.error(er.message);
          } else {
            toast.error("An unexpected error occurred.");
          }
        } finally {
          setIsLoading(false);
        }
      } else if (handleValidationErrors) {
        handleValidationErrors(errors);
        toast.error("Validation failed. Please correct the errors.");
      }
    },
    [
      state,
      repo,
      execute,
      setIsLoading,
      onFormSubmit,
      handleValidationErrors,
      validate,
    ]
  );

  // Create record
  const create = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      handleSubmit(e, ACTION_STORE, () =>
        repo.store(view.server_url, repo.formatDataOnSubmit(state))
      );
    },
    [state, repo, view.server_url, handleSubmit]
  );

  // Update record
  const update = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      handleSubmit(e, ACTION_UPDATE, () =>
        repo.update(view.server_url, state.id, repo.formatDataOnSubmit(state))
      );
    },
    [state, repo, view.server_url, handleSubmit]
  );

  // Destroy record
  const destroy = useCallback(() => {
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
          if (er instanceof Error) {
            toast.error(er.message);
          } else {
            toast.error("Failed to delete the record.");
          }
        }
      } else if (result.isDismissed) {
        toast.info("Deletion canceled.");
      }
    });
  }, [repo, view.server_url, state.id, execute, onFormSubmit]);

  // Fill form state with existing data
  const fill = useCallback(
    (data: JsonResponse) => {
      setState(repo.fromJson(data));
    },
    [repo]
  );

  // Fetch dependencies
  useEffect(() => {
    const getDependencies = async () => {
      try {
        const response = await Repository.dependencies();
        setDependencies(response);
      } catch (error) {
        console.error("Error fetching dependencies:", error);
      }
    };

    if (Repository.associatedResources.length > 0) {
      getDependencies();
    }
  }, [Repository]);

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
    dependencies,
    error,
    validate,
  };
};
