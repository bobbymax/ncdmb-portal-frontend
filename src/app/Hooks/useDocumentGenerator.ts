import { useEffect, useMemo, useState, useCallback } from "react";
import _ from "lodash";
import { TemplateResponseData } from "../Repositories/Template/data";
import {
  CategoryProgressTrackerProps,
  DocumentCategoryResponseData,
  DocumentMetaDataProps,
} from "../Repositories/DocumentCategory/data";
import { repo } from "bootstrap/repositories";
import {
  ProcessFlowConfigProps,
  ProcessFlowType,
} from "@/resources/views/crud/DocumentWorkflow";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { BlockResponseData } from "../Repositories/Block/data";
import { DocumentRequirementProps } from "../Context/PaperBoardContext";
import { useAuth } from "../Context/AuthContext";
import { DocumentResponseData } from "../Repositories/Document/data";
import { useRequestManager } from "app/Context/RequestManagerContext";
import { useResourceContext } from "../Context/ResourceContext";
import { DepartmentResponseData } from "../Repositories/Department/data";

const useDocumentGenerator = (params: unknown) => {
  const { staff } = useAuth();
  const categoryRepo = useMemo(() => repo("documentcategory"), []);
  const { addRequest } = useRequestManager();
  const { getResource, loadResources } = useResourceContext();
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
            // console.log(existingDocData.config);
            setConfigState(existingDocData.config as ProcessFlowConfigProps);
          } else if (
            categoryData?.signatories &&
            categoryData?.signatories?.length > 0
          ) {
            // Store signatories temporarily to transform after resources load
            const signatories = categoryData.signatories;
            // const selected = categoryData?.meta_data?.actions;

            // console.log(signatories);

            // Fetch departments, users, and groups directly to avoid React state timing issues
            const departmentRepo = repo("department");
            const [departmentsResponse, usersResponse, groupsResponse] =
              await Promise.all([
                addRequest(() => departmentRepo.collection("departments")),
                addRequest(() => repo("user").collection("users")),
                addRequest(() => repo("group").collection("groups")),
              ]);

            const departments = (departmentsResponse?.data ||
              []) as DepartmentResponseData[];

            // Transform signatories to ProcessFlowConfigProps
            const transformedConfig: ProcessFlowConfigProps = {
              from: null,
              through: null,
              to: null,
            };

            // Group signatories by flow_type and take the first one for each type
            const flowTypes: ProcessFlowType[] = ["from", "through", "to"];

            flowTypes.forEach((flowType) => {
              const signatory = signatories.find(
                (sig) => sig.flow_type === flowType
              );

              if (signatory) {
                // Determine department_id (same for all flow types)
                const departmentId =
                  signatory.department_id < 1
                    ? staff?.department_id ?? 0
                    : signatory.department_id;

                // Determine user_id based on flow_type and category scope
                let userId: number;

                if (flowType === "from") {
                  // For "from": check category scope
                  if (categoryData.scope === "personal") {
                    // Personal scope: use logged-in user's ID
                    userId =
                      !signatory.user_id || signatory.user_id < 1
                        ? staff?.id ?? 0
                        : signatory.user_id;
                  } else if (categoryData.scope === "official") {
                    // Official scope: use department's signatory_staff_id
                    const department = departments.find(
                      (dept) => dept.id === departmentId
                    );
                    userId = department?.signatory_staff_id ?? 0;
                  } else {
                    // Fallback: default to logged-in user
                    userId = staff?.id ?? 0;
                  }
                } else {
                  // For "through" and "to": always use department's signatory_staff_id
                  const department = departments.find(
                    (dept) => dept.id === departmentId
                  );
                  userId = department?.signatory_staff_id ?? 0;
                }

                // Transform to CategoryProgressTrackerProps
                const tracker: CategoryProgressTrackerProps = {
                  flow_type: signatory.flow_type,
                  identifier: signatory.identifier,
                  workflow_stage_id: signatory.workflow_stage_id,
                  group_id: signatory.group_id,
                  department_id: departmentId,
                  carder_id: staff?.carder?.id ?? 0,
                  user_id: userId,
                  order: signatory.order,
                  permission: "rw" as const,
                  signatory_type: signatory.type,
                  should_be_signed: signatory.should_sign ? "yes" : "no",
                  actions: signatory?.actions ?? [],
                };

                transformedConfig[flowType as keyof ProcessFlowConfigProps] =
                  tracker;
              }
            });

            setConfigState(transformedConfig);
          }

          if (categoryData.blocks && Array.isArray(categoryData.blocks)) {
            setBlocks(categoryData.blocks);
          }

          // Prioritize existing document's workflow over category workflow
          if (existingDocData?.workflow) {
            setWorkflow(existingDocData.workflow);
          } else if (categoryData.workflow) {
            setWorkflow(categoryData.workflow);
          }

          // Transform signatories to trackers if available, otherwise fallback to workflow trackers
          if (
            categoryData?.signatories &&
            categoryData.signatories.length > 0
          ) {
            // Transform SignatoryResponseData[] to CategoryProgressTrackerProps[]
            const transformedTrackers: CategoryProgressTrackerProps[] =
              categoryData.signatories.map((signatory) => ({
                flow_type: signatory.flow_type,
                identifier: signatory.identifier,
                workflow_stage_id: signatory.workflow_stage_id,
                group_id: signatory.group_id,
                department_id: signatory.department_id,
                carder_id: signatory.carder_id,
                user_id: signatory.user_id,
                order: signatory.order,
                permission: "rw" as const,
                signatory_type: signatory.type,
                should_be_signed: signatory.should_sign ? "yes" : "no",
                actions: signatory.actions || [],
              }));

            setTrackers(transformedTrackers);
          } else if (
            categoryData.workflow?.trackers &&
            Array.isArray(categoryData.workflow.trackers)
          ) {
            // Fallback to workflow trackers if no signatories
            setTrackers(categoryData.workflow.trackers);
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
