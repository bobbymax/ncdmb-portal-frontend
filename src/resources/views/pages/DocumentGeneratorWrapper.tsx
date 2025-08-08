import React, { useCallback } from "react";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { BaseResponse } from "@/app/Repositories/BaseRepository";
import TextInput from "resources/views/components/forms/TextInput";

interface DocumentGeneratorWrapperProps {
  Repository: BaseRepository;
  DocumentGeneratorComponent: React.ComponentType<any>;
}

const DocumentGeneratorWrapper: React.FC<DocumentGeneratorWrapperProps> = ({
  Repository,
  DocumentGeneratorComponent,
}) => {
  const { state, actions } = useTemplateBoard();

  const handleStateUpdate = useCallback(
    (updates: Partial<DocumentResponseData>) => {
      actions.updateDocumentState(updates);
    },
    [actions]
  );

  const handleResourceUpdate = useCallback(
    (resource: BaseResponse) => {
      actions.setResource(resource);
    },
    [actions]
  );

  const handleGlobalStateUpdate = useCallback(
    (data: unknown, identifier?: string) => {
      // Store generated data in context for use by other components
      if (identifier) {
        actions.updateContent("generated-data", data, identifier);
      }
    },
    [actions]
  );

  return (
    <div className="document__generator__wrapper">
      {/* Document Title Field */}
      <div className="document__title__section mb-4">
        <TextInput
          label="Document Title"
          name="title"
          value={state.documentState.title || ""}
          onChange={(e) => handleStateUpdate({ title: e.target.value })}
          placeholder="Enter Document Title"
        />
      </div>

      <DocumentGeneratorComponent
        repo={Repository}
        collection={[]}
        service={state.category?.service || ""}
        state={state.documentState}
        setState={handleStateUpdate}
        plug={handleResourceUpdate}
        category={state.category}
        template={state.template}
        updateGlobalState={handleGlobalStateUpdate}
      />
    </div>
  );
};

export default DocumentGeneratorWrapper;
