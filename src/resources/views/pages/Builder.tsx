import { ActionType, useForm } from "app/Hooks/useForm";
import { useResourceActions } from "app/Hooks/useResourceActions";
import { BaseRepository } from "app/Repositories/BaseRepository";
import { ServerResponse } from "app/Services/RepositoryService";
import { PageProps } from "bootstrap";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Builder = ({
  Repository,
  view,
  BuilderComponent,
}: PageProps<BaseRepository>) => {
  const { raw, redirectTo, back } = useResourceActions(Repository, view, {
    shouldFetch: false,
    hasParam: true,
  });
  const [generatedData, setGeneratedData] = useState<unknown>({});

  const onFormSubmit = (response: ServerResponse, action: ActionType) => {
    toast.success(response.message);
    redirectTo(view.index_path ?? "/");
  };

  const handleValidationErrors = (errors: string[]) => {
    setErrors(errors);
  };

  const { state, setState, dependencies, fill, loading, error } = useForm(
    Repository,
    view,
    {
      onFormSubmit,
      handleValidationErrors,
    }
  );

  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (view.mode === "update" && raw) {
      fill(raw);
    }
  }, [view.mode, raw]);

  return (
    <div className="row">
      <div className="col-md-12 mb-3">
        <h2>Template Builder</h2>
      </div>
      <div className="col-md-12 mb-3">
        <BuilderComponent
          repo={Repository}
          state={state}
          setState={setState}
          resource={raw}
          generatedData={generatedData}
          updateGlobalState={(generatorData, identifier) => {
            setGeneratedData(generatorData);
          }}
        />
      </div>
    </div>
  );
};

export default Builder;
