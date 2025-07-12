import { BaseResponse, JsonResponse } from "app/Repositories/BaseRepository";
import React, { useCallback, useState } from "react";
import { ActionMeta } from "react-select";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";

const useFormOnChangeEvents = <S>(initialState?: S) => {
  const [state, setState] = useState<S>(() => initialState ?? ({} as S));

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

  const handleMultiSelectChange = useCallback(
    (
        key: keyof S,
        handleStateChange: (
          updatedValue: DataOptionsProps | DataOptionsProps[],
          key: keyof S
        ) => void
      ) =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        if (Array.isArray(newValue)) {
          handleStateChange(newValue as DataOptionsProps[], key);
        } else if (typeof newValue === "object" && newValue !== null) {
          handleStateChange(newValue as DataOptionsProps, key);
        }
      },
    []
  );

  return { handleChange, handleMultiSelectChange, state, setState };
};

export default useFormOnChangeEvents;
