import { useEffect, useMemo, useState } from "react";
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
import {
  DocumentRequirementProps,
  ResourceProps,
} from "../Context/PaperBoardContext";
import { useAuth } from "../Context/AuthContext";

const useDocumentGenerator = (params: unknown) => {
  const { staff } = useAuth();
  const categoryRepo = useMemo(() => repo("documentcategory"), []);
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
  const [resources, setResources] = useState<ResourceProps | null>(null);

  const contents: ContentBlock[] = useMemo(
    () => category?.content ?? [],
    [category]
  );

  const [editedContents, setEditedContents] = useState<ContentBlock[]>([]);

  const updateEditedContents = (updatedContent: ContentBlock) => {
    setEditedContents((prev) => {
      return prev.map((block) => {
        if (block.id === updatedContent.id) {
          return updatedContent;
        }
        return block;
      });
    });
  };

  const updateEditedContentsOrder = (reorderedContents: ContentBlock[]) => {
    setEditedContents(reorderedContents);
  };

  const removeEditedContent = (blockId: string) => {
    setEditedContents((prev) => {
      const filteredContents = prev.filter((content) => content.id !== blockId);

      return filteredContents.map((content, index) => ({
        ...content,
        order: index + 1,
      }));
    });
  };

  useEffect(() => {
    const fetchResources = async () => {
      const response = await categoryRepo.dependencies();

      if (response) {
        const resources = response as unknown as ResourceProps;
        setResources(resources);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    if (params && _.has(params, "id")) {
      const id = Number(params.id);

      const fetchCategory = async () => {
        const response = await categoryRepo.show("documentCategories", id);

        if (response && _.has(response, "data")) {
          const category = response.data as DocumentCategoryResponseData;

          if (category.template) {
            setTemplate(category.template);
          }

          if (category.config) {
            setConfigState(category.config as ProcessFlowConfigProps);
          }

          // Initialize blocks from category.blocks
          if (category.blocks && Array.isArray(category.blocks)) {
            setBlocks(category.blocks);
          }

          // Initialize workflow from category.workflow
          if (category.workflow) {
            setWorkflow(category.workflow);
          }

          // Initialize trackers from category.workflow?.trackers
          if (
            category.workflow?.trackers &&
            Array.isArray(category.workflow.trackers)
          ) {
            setTrackers(category.workflow.trackers);
          }

          // Initialize body from category.content
          if (category.content && Array.isArray(category.content)) {
            setBody(category.content);
          }

          if (category.content) {
            setEditedContents((prev) => {
              if (prev.length > 0) {
                return prev;
              }
              return category.content ?? [];
            });
          }

          if (category.meta_data) {
            setMetaData(category.meta_data);
          }

          if (category.requirements) {
            setRequirements(
              category.requirements.map((requirement) => ({
                ...requirement,
                is_required: requirement.priority === "high",
                is_present: false,
              }))
            );
          }

          setCategory(category);
        }
      };

      fetchCategory();
    }
  }, [params]);

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
    resources,
    loggedInUser: staff,
    requirements,
  };
};

export default useDocumentGenerator;
