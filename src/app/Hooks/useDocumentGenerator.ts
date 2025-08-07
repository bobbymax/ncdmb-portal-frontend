import React, { useEffect, useMemo, useState } from "react";
import { ContentAreaProps } from "./useBuilder";
import { ConfigState } from "app/Hooks/useTemplateHeader";
import {
  TemplateProcessProps,
  TemplateResponseData,
} from "../Repositories/Template/data";
import { DocumentCategoryResponseData } from "../Repositories/DocumentCategory/data";
import { repo } from "bootstrap/repositories";
import _ from "lodash";

const useDocumentGenerator = (params: unknown) => {
  const categoryRepo = useMemo(() => repo("documentcategory"), []);
  const [category, setCategory] = useState<DocumentCategoryResponseData | null>(
    null
  );
  const [template, setTemplate] = useState<TemplateResponseData | null>(null);
  const [configState, setConfigState] = useState<ConfigState>({
    from: { key: "from", state: {} as TemplateProcessProps },
    to: { key: "to", state: {} as TemplateProcessProps },
    through: { key: "through", state: {} as TemplateProcessProps },
    cc: { key: "cc", state: [] },
    approvers: { key: "approvers", state: [] },
  });

  const contents: ContentAreaProps[] = useMemo(
    () => template?.body ?? [],
    [template]
  );

  const [editedContents, setEditedContents] = useState<ContentAreaProps[]>([]);

  const updateEditedContents = (updatedContent: ContentAreaProps) => {
    setEditedContents((prev) => {
      return prev.map((block) => {
        if (block.id === updatedContent.id) {
          return updatedContent;
        }
        return block;
      });
    });
  };

  const updateEditedContentsOrder = (reorderedContents: ContentAreaProps[]) => {
    setEditedContents(reorderedContents);
  };

  const removeEditedContent = (blockId: string) => {
    setEditedContents((prev) => {
      const filteredContents = prev.filter((content) => content.id !== blockId);
      // Update the order of remaining contents
      return filteredContents.map((content, index) => ({
        ...content,
        order: index + 1,
      }));
    });
  };

  useEffect(() => {
    if (params && _.has(params, "id")) {
      const id = Number(params.id);

      const fetchCategory = async () => {
        const response = await categoryRepo.show("documentCategories", id);

        if (response && _.has(response, "data")) {
          const category = response.data as DocumentCategoryResponseData;
          setCategory(category);
          setTemplate(category.template ?? null);
        }
      };

      fetchCategory();
    }
  }, [params]);

  useEffect(() => {
    if (template) {
      // Only initialize configState from template if it hasn't been set yet
      setConfigState((prev) => {
        // Check if configState has already been initialized with template data
        const hasTemplateData =
          prev.from?.state?.stage?.value ||
          prev.to?.state?.stage?.value ||
          prev.through?.state?.stage?.value;

        if (hasTemplateData) {
          // Already initialized, don't overwrite user changes
          return prev;
        }

        // First time loading template, initialize with template config
        return {
          ...prev,
          ...template.config?.process,
        };
      });

      // Only initialize editedContents if it hasn't been set yet
      setEditedContents((prev) => {
        // Check if editedContents has already been initialized
        if (prev.length > 0) {
          // Already initialized, don't overwrite user changes
          return prev;
        }

        // First time loading template, initialize with template contents
        return template.body ?? [];
      });
    }
  }, [template]);

  // console.log("Contents", contents);

  return {
    category,
    template,
    configState,
    setConfigState,
    contents,
    editedContents,
    updateEditedContents,
    updateEditedContentsOrder,
    removeEditedContent,
  };
};

export default useDocumentGenerator;
