import useGeneratorResource from "app/Hooks/useGeneratorResource";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import DocumentCategoryRepository from "@/app/Repositories/DocumentCategory/DocumentCategoryRepository";
import {
  BuilderComponentProps,
  DocumentGeneratorComponentProps,
} from "@/bootstrap";
import React, { Dispatch, SetStateAction, useMemo } from "react";
import {
  BaseRepository,
  BaseResponse,
} from "@/app/Repositories/BaseRepository";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { BlockDataType } from "@/app/Repositories/Block/data";

export interface DocumentBuilderComponentProps<
  D extends BaseRepository,
  T extends BaseResponse
> {
  repo: D;
  service: string;
  collection: T[];
  state: DocumentResponseData;
  setState: Dispatch<SetStateAction<DocumentResponseData>>;
  plug: (data: T) => void;
  updateGlobalState: (
    generatorData: unknown,
    identifier: BlockDataType
  ) => void;
  category: DocumentCategoryResponseData;
}

const DocumentBuilder: React.FC<
  DocumentGeneratorComponentProps<DocumentCategoryRepository, BaseResponse>
> = ({
  repo,
  service,
  collection,
  plug,
  category,
  state,
  setState,
  updateGlobalState,
}) => {
  // Memoized lazy component loader based on service
  const LazyServiceComponent = useMemo(() => {
    if (!service) return null;

    // Convert service name to PascalCase for component naming
    const serviceName = service.charAt(0).toUpperCase() + service.slice(1);
    const componentName = `${serviceName}DocumentGenerator`;

    try {
      // Dynamic import based on service
      const Component = React.lazy(
        () =>
          import(`resources/views/crud/templates/generators/${componentName}`)
      );

      return Component;
    } catch (error) {
      console.error(`Failed to load component for service: ${service}`, error);
      return null;
    }
  }, [service]);

  if (!LazyServiceComponent) {
    return (
      <div className="alert alert-warning">
        No document generator found for service: {service}
      </div>
    );
  }

  return (
    <React.Suspense fallback={<div>Loading document generator...</div>}>
      <LazyServiceComponent
        repo={repo}
        service={service}
        collection={collection}
        plug={plug}
        category={category}
        state={state}
        setState={setState}
        updateGlobalState={updateGlobalState}
      />
    </React.Suspense>
  );
};

export default DocumentBuilder;
