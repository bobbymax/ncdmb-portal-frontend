import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BaseRepository, BaseResponse } from "app/Repositories/BaseRepository";
import { extractModelName, toServiceName } from "bootstrap/repositories";
import { useAuth } from "app/Context/AuthContext";
import ResourceErrorBoundary from "resources/views/components/handlers/ResourceErrorBoundary";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { ResourceEditorResponseData } from "app/Repositories/ResourceEditor/data";
import { DocumentResponseData } from "app/Repositories/Document/data";

const useEditableComponent = <D extends BaseRepository, T extends BaseResponse>(
  repo: D,
  resource: T,
  service: string = "",
  processor: (data: DocumentResponseData) => void,
  actions: DocumentActionResponseData[],
  tracker: ProgressTrackerResponseData,
  dependencies?: unknown
) => {
  const { staff } = useAuth();

  const [state, setState] = useState(() => repo.getState());
  const [editor, setEditor] = useState<ResourceEditorResponseData | null>(null);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;

      setState((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const modelName = useMemo(() => {
    return extractModelName(service);
  }, [service]);

  const ResourceEditor = useMemo(() => {
    try {
      return lazy(() => import(`resources/views/editors/${modelName}Editor`));
    } catch (e) {
      console.warn(`Editor not found for model: ${modelName}`);
      return null;
    }
  }, [modelName]);

  useEffect(() => {
    if (tracker) {
      const service_name = toServiceName(extractModelName(service));
      const fetchEditor = async () => {
        try {
          const response = await repo.show(
            `fetch/${service_name}/editor`,
            tracker.id
          );

          if (response) {
            const person = response.data as ResourceEditorResponseData;
            setEditor(person);
          }
        } catch (error) {
          console.log(error);
        }
      };

      fetchEditor();
    }
  }, [tracker]);

  return useMemo(() => {
    if (!resource || !staff || !tracker || !ResourceEditor) return null;

    const modelService = modelName.toLowerCase();

    return (
      <Suspense fallback={<div>Loading Editor...</div>}>
        <ResourceErrorBoundary
          fallback={<div>Editor not found for &quot;{modelName}`&quot;`</div>}
        >
          <ResourceEditor
            repo={repo}
            resource={resource}
            state={state}
            setState={setState}
            service={modelService}
            staff={staff}
            processor={processor}
            handleChange={handleChange}
            actions={actions}
            dependencies={dependencies}
            editable={
              staff.groups.some((group) => group.id === tracker.group_id) &&
              tracker.permission !== "r"
            }
            editor={editor}
          />
        </ResourceErrorBoundary>
      </Suspense>
    );
  }, [
    repo,
    resource,
    staff,
    state,
    processor,
    handleChange,
    dependencies,
    modelName,
    editor,
    ResourceEditor,
  ]);
};

export default useEditableComponent;
