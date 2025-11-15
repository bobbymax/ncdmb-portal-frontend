# Signatory Configuration Implementation Summary

## ✅ Files Created

### 1. **Updated: `src/app/Repositories/DocumentCategory/data.ts`**
   - Added new properties to `DocumentPolicy` type:
     - `department_id?: number | null`
     - `initiator_group_id?: number | null`
     - `approval_group_id?: number | null`
     - `destination_department_id?: number | null`
     - `mustPassThrough?: boolean`
     - `through_group_id?: number | null`

### 2. **New: `src/app/Utils/SignatoryConfiguration.ts`**
   - Core utility class with all signatory resolution logic
   - **Main Method**: `SignatoryConfiguration.resolve()`
   - **Key Methods**:
     - `resolvePersonalScope()` - Handles personal scope documents
     - `resolveOfficialScope()` - Handles official scope documents
     - `resolveInitiator()` - Resolves initiator based on group membership
     - `resolveThrough()` - Resolves through tracker (hierarchy or group-based)
     - `resolveApprover()` - Resolves approver based on approval group
     - `findDirectorateInHierarchy()` - Traverses department hierarchy
     - Helper methods for group checking, user filtering, etc.

### 3. **New: `src/app/Hooks/useDocumentSignatories.ts`**
   - React hook wrapper for `SignatoryConfiguration`
   - Provides `resolveSignatories()` function
   - Automatically fetches resources from `ResourceContext`
   - Returns `SignatoryResolutionResult` with config, trackers, and selection options

### 4. **New: `src/app/Utils/testSignatoryConfiguration.ts`**
   - Test functions for console testing
   - Includes sample data generators
   - Exports test functions to `window.testSignatoryConfiguration` for easy browser console access

### 5. **New: `src/app/Utils/SIGNATORY_CONFIG_TEST.md`**
   - Testing guide and documentation

## 🧪 How to Test

### Option 1: Browser Console Testing

1. **Start your development server** and open the app in browser
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Import the test file** (if using module system) or access via window object
4. **Run test functions**:

```javascript
// Access test functions (if exported to window)
testSignatoryConfiguration.testPersonalScope();
testSignatoryConfiguration.testOfficialScopeWithInitiator();
testSignatoryConfiguration.testThroughResolution();
testSignatoryConfiguration.testMustPassThrough();
testSignatoryConfiguration.runAllTests();
```

### Option 2: Import in a Component

```typescript
import { testPersonalScope, testOfficialScopeWithInitiator } from "app/Utils/testSignatoryConfiguration";

// In your component or console
const result = testPersonalScope();
console.log("Personal Scope Result:", result);
```

### Option 3: Manual Testing with Real Data

```typescript
import { SignatoryConfiguration } from "app/Utils/SignatoryConfiguration";
import { useAuth } from "app/Context/AuthContext";
import { useResourceContext } from "app/Context/ResourceContext";

// In your component
const { staff } = useAuth();
const { getResource } = useResourceContext();

const departments = getResource("departments");
const groups = getResource("groups");
const users = getResource("users");

const category = {
  scope: "official",
  meta_data: {
    policy: {
      department_id: 3,
      initiator_group_id: 10,
      approval_group_id: 11,
      destination_department_id: 4,
      mustPassThrough: false,
    }
  }
};

const result = SignatoryConfiguration.resolve({
  category,
  loggedInUser: staff!,
  departments,
  groups,
  users,
});

console.log("Result:", result);
```

## 📋 Test Scenarios Covered

1. ✅ **Personal Scope**: Always sets initiator to logged-in user
2. ✅ **Official Scope - User in Initiator Group**: User can initiate, can select others
3. ✅ **Official Scope - User NOT in Initiator Group**: Must select from initiator group
4. ✅ **Through Resolution - Department Hierarchy**: Traverses up to find directorate
5. ✅ **Through Resolution - mustPassThrough**: Enforces through even if same department
6. ✅ **Through Validation**: Skips if same user as approver (or same department if not enforced)
7. ✅ **Approver Resolution**: Uses department signatory or first user in approval group

## 🔍 What to Check in Console Output

When you run the tests, check for:

1. **Config Structure**:
   - `config.from` - Should have `user_id`, `department_id`, `group_id`
   - `config.through` - Should have directorate signatory or group-based user
   - `config.to` - Should have approver user from approval group

2. **Validation Logic**:
   - If `through` and `to` have same `department_id` and `mustPassThrough = false` → `through` should be `null`
   - If `through` and `to` have same `user_id` → `through` should be `null` (always)
   - If `mustPassThrough = true` → `through` should be set even if same department

3. **User Selection Flags**:
   - `canUserSelectInitiator` - Should be `true` if user is in initiator group or not in group
   - `canUserSelectApprover` - Should be `true` only if user has higher rank than approval group

4. **Available Options**:
   - `availableInitiators` - List of users in initiator group
   - `availableApprovers` - List of users in approval group

## 🚀 Next Steps

Once you've tested and verified the results:

1. ✅ Review console output
2. ✅ Verify logic matches requirements
3. ✅ Test with your actual data
4. ✅ **Then we'll update `useDocumentGenerator.ts`** to use the new hook

## 📝 Notes

- All properties are accessed via `category.meta_data?.policy?.propertyName`
- Falls back to `loggedInUser.department_id` if policy doesn't have `department_id`
- Handles null/undefined policies gracefully
- Supports both DataOptionsProps and GroupResponseData formats for user groups

