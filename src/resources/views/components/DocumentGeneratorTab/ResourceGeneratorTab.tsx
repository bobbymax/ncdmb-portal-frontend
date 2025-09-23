import React, { useState, useEffect, useMemo } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { toFolderName, repo, response } from "bootstrap/repositories";

interface ResourceGeneratorTabProps {
  category: DocumentCategoryResponseData | null;
}

const ResourceGeneratorTab: React.FC<ResourceGeneratorTabProps> = ({
  category,
}) => {
  const { state, actions } = usePaperBoard();
  const [ResourceCardComponent, setResourceCardComponent] =
    useState<React.ComponentType<any> | null>(null);
  const [resourceData, setResourceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate the component name based on category service
  const componentName = useMemo(() => {
    if (!category?.service) return null;

    // Convert service name to folder name (e.g., "claim" -> "Claim", "document_category" -> "DocumentCategory")
    const folderName = toFolderName(category.service);

    // Concatenate with "ResourceCard"
    return `${folderName}ResourceCard`;
  }, [category?.service]);

  // Dynamically load the resource card component
  useEffect(() => {
    if (!componentName) return;

    const loadComponent = async () => {
      try {
        setIsLoading(true);

        // Dynamic import of the resource card component
        const module = await import(`../ResourceCards/${componentName}`);
        const Component = module.default;

        if (Component) {
          setResourceCardComponent(() => Component);
        } else {
          // Component not found or has no default export
        }
      } catch (error) {
        // Failed to load resource card component
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [componentName]);

  // Load resource data when component changes
  useEffect(() => {
    if (!category?.service) return;

    const loadResourceData = async () => {
      try {
        // Get the response data structure for this service
        const responseData = await response(category.service);
        if (responseData) {
          setResourceData(responseData);
        }
      } catch (error) {
        // Failed to load response data for service
      }
    };

    loadResourceData();
  }, [category?.service]);

  // Get the repository instance for this service
  const repository = useMemo(() => {
    if (!category?.service) return null;
    return repo(category.service);
  }, [category?.service]);

  if (isLoading) {
    return (
      <div className="resource__generator__tab">
        <div className="resource__loading">
          <i className="ri-loader-4-line"></i>
          <span>Loading resource card...</span>
        </div>
      </div>
    );
  }

  if (!category?.service) {
    return (
      <div className="resource__generator__tab">
        <div className="resource__no__service">
          <i className="ri-error-warning-line"></i>
          <span>No service configured for this category</span>
        </div>
      </div>
    );
  }

  if (!ResourceCardComponent) {
    return (
      <div className="resource__generator__tab">
        <div className="resource__component__not__found">
          <i className="ri-file-damage-line"></i>
          <span>Resource card component not found: {componentName}</span>
          <small>
            Please ensure the component exists in ResourceCards folder
          </small>
        </div>
      </div>
    );
  }

  // Render the dynamic resource card with injected props
  return (
    <div className="resource__generator__tab">
      <ResourceCardComponent
        category={category}
        repository={repository}
        responseData={resourceData}
        globalState={state}
        actions={actions}
      />
    </div>
  );
};

export default ResourceGeneratorTab;
