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
import { DepartmentResponseData } from "../Repositories/Department/data";
import { SignatoryResponseData } from "../Repositories/Signatory/data";

const useDocumentGenerator = (params: unknown) => {
  const { staff } = useAuth();
  const categoryRepo = useMemo(() => repo("documentcategory"), []);
  const departmentRepo = useMemo(() => repo("department"), []);
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

  const buildConfigFromExisting = (
    existingConfig: ProcessFlowConfigProps | null | undefined
  ): ProcessFlowConfigProps | null => {
    if (!existingConfig) return null;

    return {
      from: existingConfig.from ?? null,
      through: existingConfig.through ?? null,
      to: existingConfig.to ?? null,
    };
  };

  const buildTrackersFromWorkflow = (
    workflowTrackers: CategoryProgressTrackerProps[] | undefined
  ): CategoryProgressTrackerProps[] => {
    if (!Array.isArray(workflowTrackers)) return [];

    return workflowTrackers.map((tracker) => ({
      ...tracker,
      permission: tracker.permission ?? "rw",
      should_be_signed: tracker.should_be_signed ?? "no",
    }));
  };

  const buildConfigAndTrackersFromSignatories = (
    signatories: SignatoryResponseData[] | undefined,
    categoryScope: DocumentCategoryResponseData["scope"],
    departments: DepartmentResponseData[],
    staffUser: typeof staff
  ): {
    config: ProcessFlowConfigProps | null;
    trackers: CategoryProgressTrackerProps[];
  } => {
    if (!Array.isArray(signatories) || signatories.length === 0) {
      return { config: null, trackers: [] };
    }

    const staffDepartmentId = staffUser?.department_id ?? 0;
    const staffUserId = staffUser?.id ?? 0;
    const staffCarderId = staffUser?.carder?.id ?? 0;

    const config: ProcessFlowConfigProps = {
      from: null,
      through: null,
      to: null,
    };

    const trackers: CategoryProgressTrackerProps[] = signatories.map(
      (signatory) => ({
        flow_type: signatory.flow_type,
        identifier: signatory.identifier,
        workflow_stage_id: signatory.workflow_stage_id,
        group_id: signatory.group_id,
        department_id: signatory.department_id,
        carder_id: signatory.carder_id,
        user_id: signatory.user_id,
        order: signatory.order,
        permission: "rw",
        signatory_type: signatory.type,
        should_be_signed: signatory.should_sign ? "yes" : "no",
        actions: signatory.actions ?? [],
      })
    );

    (["from", "through", "to"] as ProcessFlowType[]).forEach((flowType) => {
      const signatory = signatories.find((sig) => sig.flow_type === flowType);
      if (!signatory) return;

      const resolvedDepartmentId =
        signatory.department_id > 0
          ? signatory.department_id
          : staffDepartmentId;

      let userId = signatory.user_id;
      if (flowType === "from") {
        if (categoryScope === "personal") {
          userId =
            !signatory.user_id || signatory.user_id < 1
              ? staffUserId
              : signatory.user_id;
        } else if (categoryScope === "official") {
          const department = departments.find(
            (dept) => dept.id === resolvedDepartmentId
          );
          userId = department?.signatory_staff_id ?? staffUserId;
        } else {
          userId = staffUserId;
        }
      } else {
        const department = departments.find(
          (dept) => dept.id === resolvedDepartmentId
        );
        userId = department?.signatory_staff_id ?? staffUserId;
      }

      const tracker: CategoryProgressTrackerProps = {
        flow_type: signatory.flow_type,
        identifier: signatory.identifier,
        workflow_stage_id: signatory.workflow_stage_id,
        group_id: signatory.group_id,
        department_id: resolvedDepartmentId,
        carder_id: staffCarderId,
        user_id: userId,
        order: signatory.order,
        permission: "rw",
        signatory_type: signatory.type,
        should_be_signed: signatory.should_sign ? "yes" : "no",
        actions: signatory.actions ?? [],
      };

      config[flowType] = tracker;
    });

    return {
      config,
      trackers,
    };
  };

  type CategoryStateSetters = {
    setCategory: typeof setCategory;
    setTemplate: typeof setTemplate;
    setConfigState: typeof setConfigState;
    setTrackers: typeof setTrackers;
    setBlocks: typeof setBlocks;
    setWorkflow: typeof setWorkflow;
    setBody: typeof setBody;
    setEditedContents: typeof setEditedContents;
    setMetaData: typeof setMetaData;
    setRequirements: typeof setRequirements;
  };

  const applyCategoryData = (
    categoryData: DocumentCategoryResponseData,
    params: {
      existingDocument: DocumentResponseData | null;
      departments: DepartmentResponseData[];
      staffContext: typeof staff;
    },
    setters: CategoryStateSetters
  ) => {
    const {
      setCategory,
      setTemplate,
      setConfigState,
      setTrackers,
      setBlocks,
      setWorkflow,
      setBody,
      setEditedContents,
      setMetaData,
      setRequirements,
    } = setters;

    setCategory(categoryData);
    if (categoryData.template) {
      setTemplate(categoryData.template);
    }

    const existingConfig = buildConfigFromExisting(
      (params.existingDocument?.config ?? null) as ProcessFlowConfigProps | null
    );

    if (existingConfig) {
      setConfigState(existingConfig);
    }

    if (categoryData.blocks && Array.isArray(categoryData.blocks)) {
      setBlocks(categoryData.blocks);
    }

    if (params.existingDocument?.workflow) {
      setWorkflow(params.existingDocument.workflow);
    } else if (categoryData.workflow) {
      setWorkflow(categoryData.workflow);
    }

    const signatoryResult = buildConfigAndTrackersFromSignatories(
      categoryData.signatories,
      categoryData.scope,
      params.departments,
      params.staffContext
    );

    if (!existingConfig && signatoryResult.config) {
      setConfigState(signatoryResult.config);
    }

    let trackersToSet = signatoryResult.trackers;
    if (trackersToSet.length === 0) {
      trackersToSet = buildTrackersFromWorkflow(
        categoryData.workflow?.trackers
      );
    }
    setTrackers(trackersToSet);

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
  };

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

        const categoryResponse = await addRequest(() =>
          categoryRepo.show("documentCategories", categoryId)
        );

        const categoryData = categoryResponse?.data as
          | DocumentCategoryResponseData
          | undefined;

        if (!categoryData) return;

        const departmentsResponse = await addRequest(() =>
          departmentRepo.collection("departments")
        );

        const departments = (departmentsResponse?.data ??
          []) as DepartmentResponseData[];

        applyCategoryData(
          categoryData,
          {
            existingDocument: existingDocData,
            departments,
            staffContext: staff,
          },
          {
            setCategory,
            setTemplate,
            setConfigState,
            setTrackers,
            setBlocks,
            setWorkflow,
            setBody,
            setEditedContents,
            setMetaData,
            setRequirements,
          }
        );
      } catch (error) {
        console.error("Error fetching document data:", error);
      }
    };

    fetchData();
  }, [categoryId, documentId, addRequest, categoryRepo, departmentRepo, staff]);

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
