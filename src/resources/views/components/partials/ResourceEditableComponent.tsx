import React, { Dispatch, SetStateAction, useMemo } from "react";
import { BaseRepository, BaseResponse } from "app/Repositories/BaseRepository";
import {
  extractModelName,
  repo,
  toServiceName,
  toTitleCase,
} from "bootstrap/repositories";
import useEditableComponent from "app/Hooks/utilities/useEditableComponent";
import { AuthUserResponseData } from "app/Context/AuthContext";
import useRepo from "app/Hooks/useRepo";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { ResourceEditorResponseData } from "app/Repositories/ResourceEditor/data";
import { DocumentResponseData } from "app/Repositories/Document/data";

export interface EditableResourceProps<T extends BaseResponse> {
  resource: T;
  response: (data: DocumentResponseData) => void;
  service: string;
  title: string;
  actions: DocumentActionResponseData[];
  currentTracker: ProgressTrackerResponseData;
}

export interface ResourceEditorProps<
  D extends BaseRepository,
  T extends BaseResponse
> {
  repo: D;
  resource: T;
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  editor: ResourceEditorResponseData | null;
  service: string;
  staff: AuthUserResponseData;
  actions: DocumentActionResponseData[];
  dependencies: unknown;
  processor: (data: unknown) => void;
  editable: boolean;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

function ResourceEditableComponent<T extends BaseResponse>({
  resource,
  response,
  service,
  title,
  actions,
  currentTracker,
}: EditableResourceProps<T>): JSX.Element {
  const resourceRepo = useMemo(
    () => repo(toServiceName(extractModelName(service))),
    [service]
  );

  const resourceName = toTitleCase(extractModelName(service));
  const { dependencies } = useRepo(resourceRepo);

  const resourceEditor: JSX.Element | null = useEditableComponent(
    resourceRepo,
    resource,
    service,
    response,
    actions,
    currentTracker,
    dependencies
  );

  return (
    <>
      <div className="editor__title__header">
        <span>{`${resourceName} ${title}`}:</span>
      </div>
      <div className="resource__content__area">{resourceEditor}</div>
    </>
  );
}

export default ResourceEditableComponent;
