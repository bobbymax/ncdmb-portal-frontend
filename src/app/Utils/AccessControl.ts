import { BaseResponse } from "../Repositories/BaseRepository";
import { AuthUserResponseData } from "../Context/AuthContext";
import { GroupResponseData } from "../Repositories/Group/data";

/**
 * Access Control Configuration Types
 */
export interface AccessControlConfig {
  /** The logged-in user's information */
  loggedInUser: AuthUserResponseData;
  /** The user's current grade level rank (0-13) */
  userGradeRank: number;
  /** The user's groups with their ranks and scopes */
  userGroups: GroupResponseData[];
}

/**
 * Resource that can be filtered by access control
 * Must extend BaseResponse and optionally have department_id and user_id
 */
export interface AccessControlResource extends BaseResponse {
  department_id?: number;
  user_id?: number;
  grade_level_id?: number;
  [key: string]: any;
}

/**
 * Access level determination result
 */
export interface AccessLevel {
  /** The effective rank being used (from grade level or group) */
  effectiveRank: number;
  /** Whether this access comes from group membership */
  isGroupAccess: boolean;
  /** The group providing access (if applicable) */
  accessGroup?: GroupResponseData;
  /** The scope to apply for filtering */
  scope:
    | "board"
    | "personal"
    | "department"
    | "directorate"
    | "division"
    | "collaborations";
  /** Whether department filtering should be ignored */
  ignoreDepartmentFilter: boolean;
  /** The range of ranks this user can access */
  accessibleRanks: { min: number; max: number };
}

/**
 * Determines the access level for a logged-in user
 */
export function determineAccessLevel(config: AccessControlConfig): AccessLevel {
  const { loggedInUser, userGradeRank, userGroups } = config;

  // Find the highest-ranked group the user belongs to
  let highestGroupRank = -1;
  let accessGroup: GroupResponseData | undefined;

  for (const group of userGroups) {
    if (group.rank > highestGroupRank) {
      highestGroupRank = group.rank;
      accessGroup = group;
    }
  }

  // Determine if we use group access or individual grade level access
  const useGroupAccess = highestGroupRank > userGradeRank;
  const effectiveRank = useGroupAccess ? highestGroupRank : userGradeRank;

  // Determine scope
  let scope: AccessLevel["scope"] = "department"; // default
  let ignoreDepartmentFilter = false;

  if (useGroupAccess && accessGroup) {
    scope = accessGroup.scope as AccessLevel["scope"];
    ignoreDepartmentFilter = scope === "board";
  } else {
    // For individual grade level access, higher ranks ignore department
    ignoreDepartmentFilter = effectiveRank >= 4;
    scope = ignoreDepartmentFilter ? "board" : "department";
  }

  // Calculate accessible ranks based on the algorithm
  const accessibleRanks = calculateAccessibleRanks(effectiveRank);

  return {
    effectiveRank,
    isGroupAccess: useGroupAccess,
    accessGroup,
    scope,
    ignoreDepartmentFilter,
    accessibleRanks,
  };
}

/**
 * Calculates the range of ranks a user can access based on their effective rank
 */
export function calculateAccessibleRanks(effectiveRank: number): {
  min: number;
  max: number;
} {
  if (effectiveRank >= 0 && effectiveRank <= 3) {
    // Ranks 0-3: Access only to themselves (same rank)
    return { min: effectiveRank, max: effectiveRank };
  } else if (effectiveRank >= 4 && effectiveRank <= 6) {
    // Ranks 4-6: Access to ranks 0-6
    return { min: 0, max: 6 };
  } else if (effectiveRank >= 7 && effectiveRank <= 9) {
    // Ranks 7-9: Access to ranks 3-9
    return { min: 3, max: 9 };
  } else if (effectiveRank >= 10 && effectiveRank <= 13) {
    // Ranks 10-13: Access to ranks 5-13
    return { min: 5, max: 13 };
  }

  // Fallback: access only to self
  return { min: effectiveRank, max: effectiveRank };
}

/**
 * Filters a collection of resources based on access control rules
 */
export function filterResourcesByAccess<T extends AccessControlResource>(
  resources: T[],
  accessLevel: AccessLevel,
  loggedInUser: AuthUserResponseData
): T[] {
  return resources.filter((resource) => {
    // Handle personal scope - only show user's own resources
    if (accessLevel.scope === "personal") {
      return resource.user_id === loggedInUser.id;
    }

    // Handle board scope - show all resources regardless of department
    if (accessLevel.scope === "board") {
      return isResourceAccessibleByRank(resource, accessLevel.accessibleRanks);
    }

    // Handle department-based scopes
    const isDepartmentMatch = checkDepartmentAccess(
      resource,
      loggedInUser,
      accessLevel.scope
    );

    if (!isDepartmentMatch && !accessLevel.ignoreDepartmentFilter) {
      return false;
    }

    // Check rank-based access
    return isResourceAccessibleByRank(resource, accessLevel.accessibleRanks);
  });
}

/**
 * Checks if a resource is accessible based on rank requirements
 */
function isResourceAccessibleByRank<T extends AccessControlResource>(
  resource: T,
  accessibleRanks: { min: number; max: number }
): boolean {
  // If resource doesn't have grade_level_id, we can't filter by rank
  // In this case, allow access (you may want to adjust this logic)
  if (resource.grade_level_id === undefined) {
    return true;
  }

  // Note: This assumes you have a way to map grade_level_id to rank
  // You might need to maintain a mapping or fetch grade level data
  // For now, we'll assume grade_level_id directly corresponds to rank
  const resourceRank = resource.grade_level_id;

  return (
    resourceRank >= accessibleRanks.min && resourceRank <= accessibleRanks.max
  );
}

/**
 * Checks if a resource matches department-based access requirements
 */
function checkDepartmentAccess<T extends AccessControlResource>(
  resource: T,
  loggedInUser: AuthUserResponseData,
  scope: AccessLevel["scope"]
): boolean {
  // If resource doesn't have department_id, we can't filter by department
  if (resource.department_id === undefined) {
    return true;
  }

  switch (scope) {
    case "department":
    case "directorate":
    case "division":
    case "collaborations":
      return resource.department_id === loggedInUser.department_id;
    case "board":
      return true; // Board scope ignores department
    case "personal":
      return resource.user_id === loggedInUser.id;
    default:
      return false;
  }
}

/**
 * Main access control function that combines all the logic
 */
export function applyAccessControl<T extends AccessControlResource>(
  resources: T[],
  config: AccessControlConfig
): {
  filteredResources: T[];
  accessLevel: AccessLevel;
} {
  const accessLevel = determineAccessLevel(config);
  const filteredResources = filterResourcesByAccess(
    resources,
    accessLevel,
    config.loggedInUser
  );

  return {
    filteredResources,
    accessLevel,
  };
}
