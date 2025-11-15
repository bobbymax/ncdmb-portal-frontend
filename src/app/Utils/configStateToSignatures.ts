import { useCallback, useMemo } from "react";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";
import { CategoryProgressTrackerProps } from "app/Repositories/DocumentCategory/data";
import { SignatureResponseData } from "app/Repositories/Signature/data";
import { UserResponseData } from "app/Repositories/User/data";

/**
 * Get signable stages from configState (filtered by should_be_signed === "yes")
 * Maintains order: from → through → to
 */
export function getSignableStages(
  configState: ProcessFlowConfigProps | null
): CategoryProgressTrackerProps[] {
  if (!configState) return [];

  const stages: CategoryProgressTrackerProps[] = [];

  // "from" must always be first (top or left)
  if (configState.from && configState.from.should_be_signed === "yes") {
    stages.push({
      ...configState.from,
      order: stages.length + 1,
      flow_type: "from",
    });
  }

  if (configState.through && configState.through.should_be_signed === "yes") {
    stages.push({
      ...configState.through,
      order: stages.length + 1,
      flow_type: "through",
    });
  }

  if (configState.to && configState.to.should_be_signed === "yes") {
    stages.push({
      ...configState.to,
      order: stages.length + 1,
      flow_type: "to",
    });
  }

  return stages;
}

/**
 * Format user name for approving_officer
 */
function getUserName(user: UserResponseData | null | undefined, userId: number): string {
  if (!user) return `User ID: ${userId}`;
  
  // UserResponseData has firstname, middlename, surname, and name
  const fullName = `${user.firstname || ""} ${user.middlename || ""} ${user.surname || ""}`.trim();
  return fullName || user.name || "Unknown User";
}

/**
 * Get grade level from user
 */
function getGradeLevel(user: UserResponseData | null | undefined): string {
  return user?.grade_level || "";
}

/**
 * Transform configState to SignatureResponseData array
 * 
 * @param configState - The process flow configuration state
 * @param getUserById - Function to get user by ID (from ResourceContext or similar)
 * @param existingSignatures - Optional existing signatures to merge with
 * @returns Array of SignatureResponseData
 */
export function configStateToSignatures(
  configState: ProcessFlowConfigProps | null,
  getUserById: (userId: number) => UserResponseData | null | undefined,
  existingSignatures: SignatureResponseData[] = []
): SignatureResponseData[] {
  const signableStages = getSignableStages(configState);
  
  if (signableStages.length === 0) return [];

  return signableStages.map((stage: CategoryProgressTrackerProps, index: number) => {
    // Get user from provided lookup function
    const user = getUserById(stage.user_id);

    // Find existing signature for this stage (by flow_type)
    const existingSignature = existingSignatures.find(
      (sig) => sig.flow_type === stage.flow_type
    );

    return {
      id: existingSignature?.id || index + 1,
      signatory_id: stage.user_id,
      user_id: stage.user_id,
      document_draft_id: existingSignature?.document_draft_id || 0,
      type: existingSignature?.type || ("signatory" as any),
      flow_type: stage.flow_type,
      signature: existingSignature?.signature || null,
      user: user || null,
      group_id: stage.group_id,
      order: stage.order,
      approving_officer: {
        name: getUserName(user, stage.user_id),
        grade_level: getGradeLevel(user),
      },
      created_at: existingSignature?.created_at,
      updated_at: existingSignature?.updated_at,
    } as SignatureResponseData;
  });
}

/**
 * Hook-friendly wrapper that uses ResourceContext
 * Use this in React components
 */
export function useConfigStateSignatures<T extends string = string>(
  configState: ProcessFlowConfigProps | null,
  getResourceById: (type: T, id: number) => any,
  existingSignatures: SignatureResponseData[] = []
): SignatureResponseData[] {
  const getUserById = useCallback(
    (userId: number) => getResourceById("users" as T, userId) as UserResponseData | null,
    [getResourceById]
  );

  return useMemo(
    () => configStateToSignatures(configState, getUserById, existingSignatures),
    [configState, getUserById, existingSignatures]
  );
}

