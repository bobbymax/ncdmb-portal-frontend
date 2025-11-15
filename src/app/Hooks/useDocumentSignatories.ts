import { useCallback } from "react";
import { SignatoryConfiguration } from "../Utils/SignatoryConfiguration";
import {
  SignatoryResolutionParams,
  SignatoryResolutionResult,
} from "../Utils/SignatoryConfiguration";
import { useAuth } from "../Context/AuthContext";
import { useResourceContext } from "../Context/ResourceContext";
import { DocumentCategoryResponseData } from "../Repositories/DocumentCategory/data";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";
import { DepartmentResponseData } from "../Repositories/Department/data";
import { GroupResponseData } from "../Repositories/Group/data";
import { UserResponseData } from "../Repositories/User/data";
import { WorkflowStageResponseData } from "../Repositories/WorkflowStage/data";

/**
 * React hook for resolving document signatory configuration
 * Provides a React-friendly interface to SignatoryConfiguration utility
 */
export const useDocumentSignatories = () => {
  const { staff } = useAuth();
  const { getResource } = useResourceContext();

  const resolveSignatories = useCallback(
    (
      category: DocumentCategoryResponseData | null,
      existingConfig?: ProcessFlowConfigProps | null
    ): SignatoryResolutionResult => {
      // Early return if category is null
      if (!category) {
        return {
          config: null,
          trackers: [],
          canUserSelectInitiator: false,
          canUserSelectApprover: false,
          availableInitiators: [],
          availableApprovers: [],
        };
      }

      // Get required resources from ResourceContext
      const departments = getResource("departments") as
        | DepartmentResponseData[]
        | undefined;
      const groups = getResource("groups") as GroupResponseData[] | undefined;
      const users = getResource("users") as UserResponseData[] | undefined;
      const workflowStages = getResource("workflowStages") as
        | WorkflowStageResponseData[]
        | undefined;

      // Validate required data
      if (!staff || !departments || !groups || !users) {
        return {
          config: null,
          trackers: [],
          canUserSelectInitiator: false,
          canUserSelectApprover: false,
          availableInitiators: [],
          availableApprovers: [],
        };
      }

      // Use SignatoryConfiguration to resolve
      return SignatoryConfiguration.resolve({
        category: category as DocumentCategoryResponseData,
        loggedInUser: staff,
        departments,
        groups,
        users,
        workflowStages: workflowStages || [],
        existingConfig,
      });
    },
    [staff, getResource]
  );

  return {
    resolveSignatories,
  };
};
