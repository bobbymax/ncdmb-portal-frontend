import { useMemo } from "react";
import { useAuth } from "../Context/AuthContext";
import { useStateContext } from "../Context/ContentContext";
import {
  AccessControlConfig,
  AccessControlResource,
  AccessLevel,
  applyAccessControl,
  determineAccessLevel,
} from "../Utils/AccessControl";
import { GradeLevelResponseData } from "../Repositories/GradeLevel/data";

/**
 * Hook for applying access control to resources
 * This hook automatically handles the logged-in user context and provides
 * filtered resources based on the access control algorithm
 */
export function useAccessControl<T extends AccessControlResource>(
  resources: T[],
  gradeLevels?: GradeLevelResponseData[]
) {
  const { staff } = useAuth();
  const { groups } = useStateContext();

  const accessControlResult = useMemo(() => {
    // Return empty result if no user is logged in
    if (!staff) {
      return {
        filteredResources: [] as T[],
        accessLevel: null as AccessLevel | null,
        isLoading: true,
        error: "No authenticated user",
      };
    }

    try {
      // Find the user's grade level rank
      let userGradeRank = 0; // default to lowest rank

      if (gradeLevels && staff.grade_level_id) {
        const userGradeLevel = gradeLevels.find(
          (gl) => gl.id === staff.grade_level_id
        );
        if (userGradeLevel) {
          userGradeRank = userGradeLevel.rank;
        }
      } else if (staff.grade_level_id !== undefined) {
        // Fallback: assume grade_level_id maps directly to rank
        // You may need to adjust this based on your actual data structure
        userGradeRank = Math.min(staff.grade_level_id, 13);
      }

      // Create access control configuration
      const config: AccessControlConfig = {
        loggedInUser: staff,
        userGradeRank,
        userGroups: groups || [],
      };

      // Apply access control
      const result = applyAccessControl(resources, config);

      return {
        filteredResources: result.filteredResources,
        accessLevel: result.accessLevel,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error("Access control error:", error);
      return {
        filteredResources: [] as T[],
        accessLevel: null as AccessLevel | null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }, [resources, staff, groups, gradeLevels]);

  return accessControlResult;
}

/**
 * Hook for getting just the access level without filtering resources
 * Useful for checking permissions or displaying access information
 */
export function useAccessLevel(gradeLevels?: GradeLevelResponseData[]) {
  const { staff } = useAuth();
  const { groups } = useStateContext();

  const accessLevel = useMemo(() => {
    if (!staff) {
      return null;
    }

    try {
      // Find the user's grade level rank
      let userGradeRank = 0;

      if (gradeLevels && staff.grade_level_id) {
        const userGradeLevel = gradeLevels.find(
          (gl) => gl.id === staff.grade_level_id
        );
        if (userGradeLevel) {
          userGradeRank = userGradeLevel.rank;
        }
      } else if (staff.grade_level_id !== undefined) {
        userGradeRank = Math.min(staff.grade_level_id, 13);
      }

      const config: AccessControlConfig = {
        loggedInUser: staff,
        userGradeRank,
        userGroups: groups || [],
      };

      return determineAccessLevel(config);
    } catch (error) {
      console.error("Access level determination error:", error);
      return null;
    }
  }, [staff, groups, gradeLevels]);

  return accessLevel;
}

/**
 * Hook for checking if the current user can access a specific resource
 */
export function useCanAccessResource<T extends AccessControlResource>(
  resource: T,
  gradeLevels?: GradeLevelResponseData[]
): boolean {
  const { filteredResources } = useAccessControl([resource], gradeLevels);
  return filteredResources.length > 0;
}

/**
 * Hook for getting access control information for display purposes
 */
export function useAccessControlInfo(gradeLevels?: GradeLevelResponseData[]) {
  const accessLevel = useAccessLevel(gradeLevels);
  const { staff } = useAuth();

  const info = useMemo(() => {
    if (!accessLevel || !staff) {
      return null;
    }

    return {
      effectiveRank: accessLevel.effectiveRank,
      accessSource: accessLevel.isGroupAccess ? "group" : "grade_level",
      accessGroup: accessLevel.accessGroup?.name || null,
      scope: accessLevel.scope,
      canAccessAllDepartments: accessLevel.ignoreDepartmentFilter,
      accessibleRankRange: accessLevel.accessibleRanks,
      userDepartmentId: staff.department_id,
      userGradeLevelId: staff.grade_level_id,
    };
  }, [accessLevel, staff]);

  return info;
}
