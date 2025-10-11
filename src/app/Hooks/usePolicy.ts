import { useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { useResourceContext } from "../Context/ResourceContext";
import { UserResponseData } from "../Repositories/User/data";
import { GradeLevelResponseData } from "../Repositories/GradeLevel/data";
import { GroupResponseData } from "../Repositories/Group/data";

const usePolicy = () => {
  const { staff } = useAuth();
  const { getResource } = useResourceContext();

  const scopes = {
    board: [0, 1],
    directorate: [2, 3],
    department: [4, 5, 6, 7, 8, 9],
    personal: [10, 11, 12, 13],
  };

  const users = (getResource("users") as UserResponseData[]) || [];

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

          // Exclude self
          const notSelf = user.id !== staff.id;

          return isInScope && isUpline && sameDepartment && notSelf;
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

  return {
    uplines,
    downlines,
    peers,
    scopes,
  };
};

export default usePolicy;
