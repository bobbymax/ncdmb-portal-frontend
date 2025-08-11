/**
 * ACCESS CONTROL SYSTEM - USAGE EXAMPLES
 *
 * This file demonstrates how to use the access control system across different scenarios.
 * The system implements a hierarchical access control based on grade levels and group memberships.
 */

import React, { useState } from "react";
import {
  useAccessControl,
  useAccessLevel,
  useCanAccessResource,
} from "../Hooks/useAccessControl";
import { UserResponseData } from "../Repositories/User/data";
import { ClaimResponseData } from "../Repositories/Claim/data";
import { GradeLevelResponseData } from "../Repositories/GradeLevel/data";

/**
 * EXAMPLE 1: Filtering Users for Training Schedule Creation
 *
 * When a staff member wants to create a training schedule, they should only see
 * users they have access to based on their grade level and group memberships.
 */
export const TrainingScheduleExample = () => {
  // Sample users data (would come from your API)
  const allUsers: UserResponseData[] = [
    {
      id: 1,
      department_id: 10,
      grade_level_id: 2,
      name: "John Doe",
      staff_no: "001",
    },
    {
      id: 2,
      department_id: 10,
      grade_level_id: 5,
      name: "Jane Smith",
      staff_no: "002",
    },
    {
      id: 3,
      department_id: 15,
      grade_level_id: 8,
      name: "Bob Johnson",
      staff_no: "003",
    },
    {
      id: 4,
      department_id: 10,
      grade_level_id: 12,
      name: "Alice Brown",
      staff_no: "004",
    },
  ] as UserResponseData[];

  // Sample grade levels (would come from your API)
  const gradeLevels: GradeLevelResponseData[] = [
    {
      id: 2,
      rank: 2,
      name: "Officer II",
      key: "officer-ii",
      type: "system",
      carder_id: 1,
      carder: null,
    },
    {
      id: 5,
      rank: 5,
      name: "Senior Officer",
      key: "senior-officer",
      type: "system",
      carder_id: 1,
      carder: null,
    },
    {
      id: 8,
      rank: 8,
      name: "Principal Officer",
      key: "principal-officer",
      type: "system",
      carder_id: 1,
      carder: null,
    },
    {
      id: 12,
      rank: 12,
      name: "Director",
      key: "director",
      type: "board",
      carder_id: 1,
      carder: null,
    },
  ] as GradeLevelResponseData[];

  // Apply access control to filter users
  const { filteredResources: accessibleUsers, accessLevel } = useAccessControl(
    allUsers,
    gradeLevels
  );

  return {
    accessibleUsers,
    accessLevel,
    totalUsers: allUsers.length,
    accessibleCount: accessibleUsers.length,
  };
};

/**
 * EXAMPLE 2: Checking Access to Specific Claims
 *
 * When displaying claims, filter based on user's access level
 */
export const ClaimsAccessExample = () => {
  const claims: ClaimResponseData[] = [
    {
      id: 1,
      user_id: 101,
      department_id: 10,
      title: "Travel Claim - Lagos",
      total_amount_spent: 50000,
      // ... other claim properties
    },
    {
      id: 2,
      user_id: 102,
      department_id: 15,
      title: "Training Claim - Abuja",
      total_amount_spent: 75000,
      // ... other claim properties
    },
  ] as ClaimResponseData[];

  const gradeLevels: GradeLevelResponseData[] = []; // Your grade levels data

  const { filteredResources: accessibleClaims, accessLevel } = useAccessControl(
    claims,
    gradeLevels
  );

  return {
    accessibleClaims,
    accessLevel,
  };
};

/**
 * EXAMPLE 3: Checking Individual Resource Access
 *
 * Check if current user can access a specific resource
 */
export const IndividualAccessCheck = () => {
  const specificUser: UserResponseData = {
    id: 123,
    department_id: 10,
    grade_level_id: 8,
    name: "Test User",
    staff_no: "TEST001",
    // ... other properties
  } as UserResponseData;

  const gradeLevels: GradeLevelResponseData[] = []; // Your grade levels data

  const canAccess = useCanAccessResource(specificUser, gradeLevels);

  return { canAccess };
};

/**
 * EXAMPLE 4: Getting Access Level Information for UI Display
 *
 * Display user's current access level and permissions
 */
export const AccessLevelDisplay = () => {
  const gradeLevels: GradeLevelResponseData[] = []; // Your grade levels data

  const accessLevel = useAccessLevel(gradeLevels);

  if (!accessLevel) {
    return <div>No access information available</div>;
  }

  return (
    <div className="access-info">
      <h3>Your Access Level</h3>
      <p>Effective Rank: {accessLevel.effectiveRank}</p>
      <p>
        Access Source: {accessLevel.isGroupAccess ? "Group" : "Grade Level"}
      </p>
      {accessLevel.accessGroup && (
        <p>Access Group: {accessLevel.accessGroup.name}</p>
      )}
      <p>Scope: {accessLevel.scope}</p>
      <p>
        Accessible Ranks: {accessLevel.accessibleRanks.min} -{" "}
        {accessLevel.accessibleRanks.max}
      </p>
      <p>
        Department Filter:{" "}
        {accessLevel.ignoreDepartmentFilter ? "Ignored" : "Applied"}
      </p>
    </div>
  );
};

/**
 * ALGORITHM EXPLANATION:
 *
 * 1. GRADE LEVEL ACCESS (Individual):
 *    - Rank 0-3: Access only to themselves
 *    - Rank 4-6: Access to ranks 0-6 (no department filter)
 *    - Rank 7-9: Access to ranks 3-9 (no department filter)
 *    - Rank 10-13: Access to ranks 5-13 (no department filter)
 *
 * 2. GROUP ACCESS (Takes Priority):
 *    - Uses same ranking logic but overrides individual access
 *    - Scope determines filtering:
 *      - "board": All resources (no department filter)
 *      - "personal": Only user's own resources
 *      - "department/directorate/division/collaborations": Filter by department_id
 *
 * 3. PRIORITY ORDER:
 *    - Check user's groups
 *    - Use highest group rank if higher than individual rank
 *    - Apply scope-based filtering
 *    - Fall back to individual grade level if no group access
 *
 * 4. IMPLEMENTATION NOTES:
 *    - Resources must extend BaseResponse with optional department_id, user_id, grade_level_id
 *    - Grade level rank mapping may need adjustment based on your data structure
 *    - Department filtering respects the logged-in user's department_id
 */

/**
 * INTEGRATION EXAMPLE: Complete Component Usage
 */
export const UserManagementComponent = () => {
  // This would be your actual users data from API
  const [allUsers, setAllUsers] = useState<UserResponseData[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevelResponseData[]>([]);

  // Apply access control
  const {
    filteredResources: accessibleUsers,
    accessLevel,
    isLoading,
    error,
  } = useAccessControl(allUsers, gradeLevels);

  if (isLoading) return <div>Loading access control...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Training Schedule - Select Users</h2>

      {/* Access Level Info */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p>Your access level: Rank {accessLevel?.effectiveRank}</p>
        <p>Scope: {accessLevel?.scope}</p>
        <p>
          Showing {accessibleUsers.length} of {allUsers.length} users
        </p>
      </div>

      {/* User List */}
      <div className="user-list">
        {accessibleUsers.map((user) => (
          <div key={user.id} className="user-item p-2 border-b">
            <span>
              {user.name} ({user.staff_no})
            </span>
            <span className="ml-2 text-sm text-gray-600">
              Dept: {user.department_id}, Grade: {user.grade_level_id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// React imports are now properly included above
