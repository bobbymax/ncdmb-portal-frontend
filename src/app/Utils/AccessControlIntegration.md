# Access Control System - Integration Guide

## Overview

This access control system provides a hierarchical permission model based on grade levels and group memberships. It filters resources dynamically based on the logged-in user's access rights.

## Key Features

- **Hierarchical Access**: Grade levels 0-13 with increasing access rights
- **Group Override**: Group membership can override individual grade level access
- **Scope-based Filtering**: Different scopes (board, personal, department, etc.) control visibility
- **Reusable**: Works with any resource that extends `BaseResponse`

## Quick Start

### 1. Basic Usage - Filter Users

```tsx
import { useAccessControl } from "app/Hooks/useAccessControl";
import { UserResponseData } from "app/Repositories/User/data";

const TrainingScheduleComponent = () => {
  const [users, setUsers] = useState<UserResponseData[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevelResponseData[]>([]);

  // Apply access control
  const { filteredResources: accessibleUsers, accessLevel } = useAccessControl(
    users,
    gradeLevels
  );

  return (
    <div>
      <h2>Select Users for Training</h2>
      <p>
        You can access {accessibleUsers.length} of {users.length} users
      </p>

      {accessibleUsers.map((user) => (
        <div key={user.id}>
          {user.name} - {user.staff_no}
        </div>
      ))}
    </div>
  );
};
```

### 2. Check Individual Resource Access

```tsx
import { useCanAccessResource } from "app/Hooks/useAccessControl";

const UserProfileComponent = ({ user }: { user: UserResponseData }) => {
  const canAccess = useCanAccessResource(user);

  if (!canAccess) {
    return <div>Access Denied</div>;
  }

  return <div>User Profile: {user.name}</div>;
};
```

### 3. Display Access Information

```tsx
import { useAccessLevel } from "app/Hooks/useAccessControl";

const AccessInfoComponent = () => {
  const accessLevel = useAccessLevel();

  return (
    <div className="access-info">
      <h3>Your Access Level</h3>
      <p>Rank: {accessLevel?.effectiveRank}</p>
      <p>Source: {accessLevel?.isGroupAccess ? "Group" : "Grade Level"}</p>
      <p>Scope: {accessLevel?.scope}</p>
    </div>
  );
};
```

## Access Control Algorithm

### Grade Level Access (Individual)

| Rank Range | Access To  | Department Filter |
| ---------- | ---------- | ----------------- |
| 0-3        | Self only  | Applied           |
| 4-6        | Ranks 0-6  | Ignored           |
| 7-9        | Ranks 3-9  | Ignored           |
| 10-13      | Ranks 5-13 | Ignored           |

### Group Access (Takes Priority)

Groups use the same ranking logic but can override individual access based on scope:

| Scope            | Description               | Department Filter |
| ---------------- | ------------------------- | ----------------- |
| `board`          | All resources             | Ignored           |
| `personal`       | User's own resources only | N/A               |
| `department`     | Same department only      | Applied           |
| `directorate`    | Same department only      | Applied           |
| `division`       | Same department only      | Applied           |
| `collaborations` | Same department only      | Applied           |

## Implementation Details

### Required Resource Properties

Your resources must extend `BaseResponse` and can optionally include:

```tsx
interface MyResource extends BaseResponse {
  department_id?: number; // For department filtering
  user_id?: number; // For personal scope filtering
  grade_level_id?: number; // For rank-based filtering
}
```

### Grade Level Mapping

The system assumes you have grade level data with ranks 0-13. If your grade levels use different IDs, ensure you pass the `gradeLevels` array to the hooks:

```tsx
const gradeLevels: GradeLevelResponseData[] = [
  { id: 1, rank: 0, name: "Trainee", ... },
  { id: 2, rank: 1, name: "Officer I", ... },
  // ... more grade levels
];

const { filteredResources } = useAccessControl(resources, gradeLevels);
```

## Real-World Examples

### Example 1: Claims Management

```tsx
const ClaimsComponent = () => {
  const [claims, setClaims] = useState<ClaimResponseData[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevelResponseData[]>([]);

  const { filteredResources: accessibleClaims } = useAccessControl(
    claims,
    gradeLevels
  );

  return (
    <div>
      <h2>Claims Management</h2>
      {accessibleClaims.map((claim) => (
        <div key={claim.id}>
          <h3>{claim.title}</h3>
          <p>Amount: ₦{claim.total_amount_spent.toLocaleString()}</p>
          <p>Department: {claim.department_id}</p>
        </div>
      ))}
    </div>
  );
};
```

### Example 2: Document Access

```tsx
const DocumentsComponent = () => {
  const [documents, setDocuments] = useState<DocumentResponseData[]>([]);

  const { filteredResources: accessibleDocs, accessLevel } =
    useAccessControl(documents);

  return (
    <div>
      <div className="access-badge">
        Access Level: {accessLevel?.effectiveRank}(
        {accessLevel?.isGroupAccess ? "Group" : "Individual"})
      </div>

      {accessibleDocs.map((doc) => (
        <div key={doc.id} className="document-item">
          {doc.title}
        </div>
      ))}
    </div>
  );
};
```

## Testing Your Implementation

### Test Scenarios

1. **Low Rank User (0-3)**: Should only see their own resources
2. **Mid Rank User (4-6)**: Should see ranks 0-6, ignoring department
3. **High Rank User (7-9)**: Should see ranks 3-9, ignoring department
4. **Executive User (10-13)**: Should see ranks 5-13, ignoring department
5. **Group Member**: Should get group access if higher than individual rank
6. **Board Scope**: Should see all resources regardless of department
7. **Personal Scope**: Should only see own resources

### Debug Information

Use the access level information for debugging:

```tsx
const { accessLevel } = useAccessControl(resources);

console.log("Access Debug Info:", {
  effectiveRank: accessLevel?.effectiveRank,
  isGroupAccess: accessLevel?.isGroupAccess,
  scope: accessLevel?.scope,
  accessibleRanks: accessLevel?.accessibleRanks,
  ignoreDepartmentFilter: accessLevel?.ignoreDepartmentFilter,
});
```

## Migration Guide

### From Manual Permission Checks

If you currently have manual permission checks:

```tsx
// Before
const visibleUsers = users.filter((user) => {
  if (currentUser.role === "admin") return true;
  if (user.department_id === currentUser.department_id) return true;
  return false;
});

// After
const { filteredResources: visibleUsers } = useAccessControl(users);
```

### Adding to Existing Components

1. Import the hook: `import { useAccessControl } from 'app/Hooks/useAccessControl';`
2. Replace your filtering logic with the hook
3. Pass grade levels data if available
4. Use the filtered results in your UI

## Performance Considerations

- The filtering happens in memory using `useMemo` for optimization
- Grade level data is cached between renders
- Consider server-side filtering for large datasets

## Security Notes

- This is client-side filtering for UI purposes
- Always implement server-side access control for data security
- Use this system to enhance UX, not as the primary security measure

## Troubleshooting

### Common Issues

1. **No users showing**: Check if grade levels are loaded correctly
2. **Too many users showing**: Verify group membership and ranks
3. **Department filtering not working**: Ensure resources have `department_id`
4. **Access level null**: Check if user is authenticated

### Debug Steps

1. Check if `staff` is loaded in AuthContext
2. Verify `groups` are available in ContentContext
3. Ensure grade levels data is properly structured
4. Log the access level object for inspection
