import {
  BaseRepository,
  JsonResponse,
  ViewsProps,
} from "app/Repositories/BaseRepository";
import { toast } from "react-toastify";
import { ActionType, useForm } from "./useForm";
import { useState } from "react";
import { ServerResponse } from "app/Services/RepositoryService";

export const useModalForm = <T extends BaseRepository, D = JsonResponse>(
  Repo: T,
  View: ViewsProps,
  data: D
) => {
  //   const repo = useMemo(() => Repo, [Repo]);
  const onFormSubmit = (response: ServerResponse, action: ActionType) => {
    toast.success(response.message);
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
    fill,
    loading,
    error,
  } = useForm(Repo, View, {
    onFormSubmit,
    handleValidationErrors,
  });

  const [errors, setErrors] = useState<string[]>([]);

  return {
    state,
    setState,
    handleChange,
    handleReactSelect,
    fill,
    loading,
    error,
    errors,
    validate,
    data,
  };
};
