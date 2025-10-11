import { useEffect, useMemo, useState, useCallback } from "react";
import _ from "lodash";
import { TemplateResponseData } from "../Repositories/Template/data";
import {
  CategoryProgressTrackerProps,
  DocumentCategoryResponseData,
  DocumentMetaDataProps,
} from "../Repositories/DocumentCategory/data";
import { repo } from "bootstrap/repositories";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { BlockResponseData } from "../Repositories/Block/data";
import { DocumentRequirementProps } from "../Context/PaperBoardContext";
import { useAuth } from "../Context/AuthContext";
import { DocumentResponseData } from "../Repositories/Document/data";
import { useRequestManager } from "app/Context/RequestManagerContext";

const useDocumentGenerator = (params: unknown) => {
  const { staff } = useAuth();
  const categoryRepo = useMemo(() => repo("documentcategory"), []);
  const { addRequest } = useRequestManager();
  const [existingDocument, setExistingDocument] =
    useState<DocumentResponseData | null>(null);
  const [category, setCategory] = useState<DocumentCategoryResponseData | null>(
    null
  );
  const [template, setTemplate] = useState<TemplateResponseData | null>(null);
  const [configState, setConfigState] = useState<ProcessFlowConfigProps>({
    from: null,
    to: null,
    through: null,
  });
  const [metaData, setMetaData] = useState<DocumentMetaDataProps | null>(null);
  const [requirements, setRequirements] = useState<DocumentRequirementProps[]>(
    []
  );

  const [trackers, setTrackers] = useState<CategoryProgressTrackerProps[]>([]);
  const [blocks, setBlocks] = useState<BlockResponseData[]>([]);
  const [workflow, setWorkflow] = useState<any>(null);
  const [body, setBody] = useState<ContentBlock[]>([]);
  const [isBuilding, setIsBuilding] = useState<boolean>(true);
  // Resources now managed by ResourceContext - no longer needed here

  const contents: ContentBlock[] = useMemo(
    () => category?.content ?? [],
    [category]
  );

  const [editedContents, setEditedContents] = useState<ContentBlock[]>([]);

  // Memoized callbacks to prevent re-renders
  const updateEditedContents = useCallback((updatedContent: ContentBlock) => {
    setEditedContents((prev) => {
      return prev.map((block) => {
        if (block.id === updatedContent.id) {
          return updatedContent;
        }
        return block;
      });
    });
  }, []);

  const updateEditedContentsOrder = useCallback(
    (reorderedContents: ContentBlock[]) => {
      setEditedContents(reorderedContents);
    },
    []
  );

  const removeEditedContent = useCallback((blockId: string) => {
    setEditedContents((prev) => {
      const filteredContents = prev.filter((content) => content.id !== blockId);

      return filteredContents.map((content, index) => ({
        ...content,
        order: index + 1,
      }));
    });
  }, []);

  // Resources fetching removed - now handled by ResourceContext

  // Extract stable values from params to prevent unnecessary re-renders
  const categoryId = useMemo(() => {
    return params && _.has(params, "id") ? Number(params.id) : null;
  }, [params]);

  const documentId = useMemo(() => {
    return params && _.has(params, "documentId")
      ? Number(params.documentId)
      : null;
  }, [params]);

  // Optimized category and document fetching
  useEffect(() => {
    if (!categoryId) return;

    const fetchData = async () => {
      try {
        // Fetch document if documentId exists
        let existingDocData: DocumentResponseData | null = null;
        if (documentId) {
          const documentResponse = await addRequest(() =>
            categoryRepo.show("documents", documentId)
          );
          if (documentResponse?.data) {
            existingDocData = documentResponse.data as DocumentResponseData;
            setExistingDocument(existingDocData);
          }
        }

        // Fetch category
        const categoryResponse = await addRequest(() =>
          categoryRepo.show("documentCategories", categoryId)
        );

        if (categoryResponse?.data) {
          const categoryData =
            categoryResponse.data as DocumentCategoryResponseData;

          // Batch all state updates to prevent multiple re-renders
          setCategory(categoryData);

          if (categoryData.template) {
            setTemplate(categoryData.template);
          }

          // Prioritize existing document's config over category config
          if (existingDocData?.config) {
            setConfigState(existingDocData.config as ProcessFlowConfigProps);
          } else if (categoryData.config) {
            setConfigState(categoryData.config as ProcessFlowConfigProps);
          }

          if (categoryData.blocks && Array.isArray(categoryData.blocks)) {
            setBlocks(categoryData.blocks);
          }

          // Prioritize existing document's workflow over category workflow
          if (existingDocData?.workflow) {
            setWorkflow(existingDocData.workflow);
            // Note: existing document workflow might not have trackers in the same format
            // Keep using category trackers as fallback for now
            if (
              categoryData.workflow?.trackers &&
              Array.isArray(categoryData.workflow.trackers)
            ) {
              setTrackers(categoryData.workflow.trackers);
            }
          } else if (categoryData.workflow) {
            setWorkflow(categoryData.workflow);

            if (
              categoryData.workflow.trackers &&
              Array.isArray(categoryData.workflow.trackers)
            ) {
              setTrackers(categoryData.workflow.trackers);
            }
          }

          if (categoryData.content && Array.isArray(categoryData.content)) {
            setBody(categoryData.content);
            setEditedContents(categoryData.content);
          }

          if (categoryData.meta_data) {
            setMetaData(categoryData.meta_data);
          }

          if (categoryData.requirements) {
            setRequirements(
              categoryData.requirements.map((requirement) => ({
                ...requirement,
                is_required: requirement.priority === "high",
                is_present: false,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching document data:", error);
      }
    };

    fetchData();
    // Only watch the memoized param values, not the params object reference
    // This prevents unnecessary re-fetches when params object changes but values stay same
  }, [categoryId, documentId, addRequest, categoryRepo]);

  return {
    category,
    template,
    configState,
    trackers,
    setTrackers,
    setConfigState,
    contents,
    editedContents,
    updateEditedContents,
    updateEditedContentsOrder,
    removeEditedContent,
    // New state properties
    blocks,
    workflow,
    body,
    isBuilding,
    setIsBuilding,
    metaData,
    // resources removed - now handled by ResourceContext
    loggedInUser: staff,
    requirements,
    existingDocument,
    setExistingDocument,
  };
};

export default useDocumentGenerator;
