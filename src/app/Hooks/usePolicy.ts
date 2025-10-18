import { useCallback } from "react";
import { useAuth, AuthUserResponseData } from "../Context/AuthContext";
import { useResourceContext } from "../Context/ResourceContext";
import { UserResponseData } from "../Repositories/User/data";
import { GradeLevelResponseData } from "../Repositories/GradeLevel/data";
import { GroupResponseData } from "../Repositories/Group/data";
import { ProgressTrackerResponseData } from "../Repositories/ProgressTracker/data";
import { DocumentDraftResponseData } from "../Repositories/DocumentDraft/data";
import { DocumentResponseData } from "../Repositories/Document/data";
import { CategoryProgressTrackerProps } from "../Repositories/DocumentCategory/data";

interface UsePolicyParams {
  currentProcess?: ProgressTrackerResponseData | null;
  loggedInUser?: AuthUserResponseData | UserResponseData | null;
  trackers?: CategoryProgressTrackerProps[] | ProgressTrackerResponseData[];
  existingDocument?: DocumentResponseData | null;
  currentDraft?: DocumentDraftResponseData | null;
}

export const scopes = {
  board: [0, 1],
  directorate: [2, 3],
  department: [4, 5, 6, 7, 8, 9],
  personal: [10, 11, 12, 13],
};

const usePolicy = (params?: UsePolicyParams) => {
  const { staff } = useAuth();
  const { getResource } = useResourceContext();

  const {
    currentProcess = null,
    loggedInUser = null,
    trackers = [],
    existingDocument = null,
    currentDraft = null,
  } = params || {};

  const users = (getResource("users") as UserResponseData[]) || [];

  // console.log(users);

  /**
   * Get users with higher or equal rank (supervisors/seniors)
   * @param scope - Organizational scope to filter by
   * @param flag - Whether to filter by 'grade' level or 'group' membership
   * @param group_id - Specific group ID to filter by (when flag is 'group')
   */
  const uplines = useCallback(
    (
      scope: keyof typeof scopes = "department",
      flag: "group" | "grade" = "grade",
      group_id: number = 0
    ): UserResponseData[] => {
      if (!staff || users.length < 1) return [];

      // Filter by grade level rank
      if (flag === "grade") {
        const gradeLevel: GradeLevelResponseData | null =
          staff.grade_level_object;
        if (!gradeLevel) return [];

        const scopeRanks = scopes[scope];
        // console.log(scopeRanks, gradeLevel);

        return users.filter((user) => {
          const userGradeLevel =
            user.grade_level_object as GradeLevelResponseData;
          if (!userGradeLevel) return false;

          // Check if user's rank is within the scope
          const isInScope = scopeRanks.includes(userGradeLevel.rank);

          // Check if user has higher or equal authority (lower rank number = higher authority)
          const isUpline = userGradeLevel.rank <= gradeLevel.rank;

          // Same department check
          const sameDepartment = user.department_id === staff.department_id;

          // const considerScope = scope === "board" ? sameDepartment :

          // Exclude self
          const notSelf = user.id !== staff.id;

          if (scope === "department") {
            return isUpline && sameDepartment && notSelf;
          }

          return isUpline && notSelf;
        });
      }

      // Filter by group rank
      if (flag === "group") {
        const userGroup = staff.groups?.find((g) => g.id === group_id) as
          | GroupResponseData
          | undefined;
        if (!userGroup || typeof userGroup.rank === "undefined") return [];

        return users.filter((user) => {
          const targetGroup = user.groups?.find(
            (g) => (g as unknown as GroupResponseData).id === group_id
          ) as unknown as GroupResponseData | undefined;
          if (!targetGroup || typeof targetGroup.rank === "undefined")
            return false;

          // Check if user has higher or equal authority in the group
          const isUpline = targetGroup.rank <= userGroup.rank;

          // Same department check
          const sameDepartment = user.department_id === staff.department_id;

          // Exclude self
          const notSelf = user.id !== staff.id;

          return isUpline && sameDepartment && notSelf;
        });
      }

      return [];
    },
    [staff, users]
  );

  /**
   * Get users with lower or equal rank (subordinates/juniors)
   * @param scope - Organizational scope to filter by
   * @param flag - Whether to filter by 'grade' level or 'group' membership
   * @param group_id - Specific group ID to filter by (when flag is 'group')
   */
  const downlines = useCallback(
    (
      scope: keyof typeof scopes = "department",
      flag: "group" | "grade" = "grade",
      group_id: number = 0
    ): UserResponseData[] => {
      if (!staff || users.length < 1) return [];

      // Filter by grade level rank
      if (flag === "grade") {
        const gradeLevel: GradeLevelResponseData | null =
          staff.grade_level_object;
        if (!gradeLevel) return [];

        const scopeRanks = scopes[scope];

        return users.filter((user) => {
          const userGradeLevel =
            user.grade_level_object as GradeLevelResponseData;
          if (!userGradeLevel) return false;

          // Check if user's rank is within the scope
          const isInScope = scopeRanks.includes(userGradeLevel.rank);

          // Check if user has lower or equal authority (higher rank number = lower authority)
          const isDownline = userGradeLevel.rank >= gradeLevel.rank;

          // Same department check
          const sameDepartment = user.department_id === staff.department_id;

          // Exclude self
          const notSelf = user.id !== staff.id;

          return isInScope && isDownline && sameDepartment && notSelf;
        });
      }

      // Filter by group rank
      if (flag === "group") {
        const userGroup = staff.groups?.find((g) => g.id === group_id) as
          | GroupResponseData
          | undefined;
        if (!userGroup || typeof userGroup.rank === "undefined") return [];

        return users.filter((user) => {
          const targetGroup = user.groups?.find(
            (g) => (g as unknown as GroupResponseData).id === group_id
          ) as unknown as GroupResponseData | undefined;
          if (!targetGroup || typeof targetGroup.rank === "undefined")
            return false;

          // Check if user has lower or equal authority in the group
          const isDownline = targetGroup.rank >= userGroup.rank;

          // Same department check
          const sameDepartment = user.department_id === staff.department_id;

          // Exclude self
          const notSelf = user.id !== staff.id;

          return isDownline && sameDepartment && notSelf;
        });
      }

      return [];
    },
    [staff, users]
  );

  /**
   * Get all users at the same rank level (peers)
   * @param scope - Organizational scope to filter by
   * @param flag - Whether to filter by 'grade' level or 'group' membership
   * @param group_id - Specific group ID to filter by (when flag is 'group')
   */
  const peers = useCallback(
    (
      scope: keyof typeof scopes = "department",
      flag: "group" | "grade" = "grade",
      group_id: number = 0
    ): UserResponseData[] => {
      if (!staff || users.length < 1) return [];

      if (flag === "grade") {
        const gradeLevel: GradeLevelResponseData | null =
          staff.grade_level_object;
        if (!gradeLevel) return [];

        const scopeRanks = scopes[scope];

        return users.filter((user) => {
          const userGradeLevel =
            user.grade_level_object as GradeLevelResponseData;
          if (!userGradeLevel) return false;

          const isInScope = scopeRanks.includes(userGradeLevel.rank);
          const isSameRank = userGradeLevel.rank === gradeLevel.rank;
          const sameDepartment = user.department_id === staff.department_id;
          const notSelf = user.id !== staff.id;

          return isInScope && isSameRank && sameDepartment && notSelf;
        });
      }

      if (flag === "group") {
        const userGroup = staff.groups?.find((g) => g.id === group_id) as
          | GroupResponseData
          | undefined;
        if (!userGroup || typeof userGroup.rank === "undefined") return [];

        return users.filter((user) => {
          const targetGroup = user.groups?.find(
            (g) => (g as unknown as GroupResponseData).id === group_id
          ) as unknown as GroupResponseData | undefined;
          if (!targetGroup || typeof targetGroup.rank === "undefined")
            return false;

          const isSameRank = targetGroup.rank === userGroup.rank;
          const sameDepartment = user.department_id === staff.department_id;
          const notSelf = user.id !== staff.id;

          return isSameRank && sameDepartment && notSelf;
        });
      }

      return [];
    },
    [staff, users]
  );

  /**
   * Check if user has permission based on their groups
   * @param groups - User's groups to check against current process
   */
  const can = useCallback(
    (groups?: GroupResponseData[]): boolean => {
      if (!groups || !currentProcess?.group_id) return false;

      return groups.some((group) => group.id === currentProcess.group_id);
    },
    [currentProcess]
  );

  /**
   * Get unique user IDs from trackers
   */
  const getTrackerUserIds = useCallback((): number[] => {
    if (!trackers || trackers.length === 0) return [];

    return Array.from(
      new Set([
        ...trackers
          .map((tracker) => (tracker as CategoryProgressTrackerProps).user_id)
          .filter((id) => id && id > 0),
        existingDocument?.user_id ?? 0,
        existingDocument?.created_by ?? 0,
      ])
    );
  }, [trackers, existingDocument]);

  /**
   * Check if user can handle the current draft
   * @param draft - Current draft to check
   */
  const canHandle = useCallback(
    (draft: DocumentDraftResponseData | null): boolean => {
      // First check if user has group permission
      if (!can(loggedInUser?.groups as GroupResponseData[])) {
        return false;
      }

      // If no draft exists, cannot handle
      if (!draft) {
        return false;
      }

      // If operator is not assigned (null), user can handle
      if (!draft.operator_id) {
        return true;
      }

      // If operator is assigned to someone else, user cannot handle
      if (draft.operator_id !== loggedInUser?.id) {
        return false;
      }

      // If operator is assigned to this user, they can handle
      return true;
    },
    [can, loggedInUser]
  );

  // Computed values
  const userHasPermission = can(loggedInUser?.groups as GroupResponseData[]);
  const userCanHandle = canHandle(currentDraft);

  return {
    uplines,
    downlines,
    peers,
    scopes,
    can,
    canHandle,
    getTrackerUserIds,
    userHasPermission,
    userCanHandle,
  };
};

export default usePolicy;
