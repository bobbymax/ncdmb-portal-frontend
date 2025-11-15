# Signatory Configuration Testing Guide

## Files Created

1. **`SignatoryConfiguration.ts`** - Core utility class with all signatory resolution logic
2. **`useDocumentSignatories.ts`** - React hook wrapper for easy integration
3. **`testSignatoryConfiguration.ts`** - Test functions for console testing

## How to Test in Browser Console

### Step 1: Import the test functions

In your browser console (after the app is loaded), you can access the test functions via:

```javascript
// The test file exports functions to window.testSignatoryConfiguration
// You can also import directly if using ES modules
```

### Step 2: Run individual tests

```javascript
// Test personal scope
testSignatoryConfiguration.testPersonalScope();

// Test official scope with initiator group
testSignatoryConfiguration.testOfficialScopeWithInitiator();

// Test through resolution with department hierarchy
testSignatoryConfiguration.testThroughResolution();

// Test mustPassThrough enforcement
testSignatoryConfiguration.testMustPassThrough();

// Run all tests
testSignatoryConfiguration.runAllTests();
```

### Step 3: Test with your own data

```javascript
// Get your actual data from the app
const { staff } = useAuth(); // In React component
const { getResource } = useResourceContext(); // In React component

// Or manually create test data
const testData = testSignatoryConfiguration.createSampleTestData();

// Create a category with policy
const category = {
  id: 1,
  scope: "official",
  meta_data: {
    policy: {
      department_id: 3,
      initiator_group_id: 10,
      approval_group_id: 11,
      destination_department_id: 4,
      mustPassThrough: false,
      // ... other policy fields
    }
  }
};

// Resolve signatories
const result = SignatoryConfiguration.resolve({
  category,
  loggedInUser: testData.loggedInUser,
  departments: testData.departments,
  groups: testData.groups,
  users: testData.users,
});

console.log("Result:", result);
```

## Expected Output Format

```javascript
{
  config: {
    from: {
      flow_type: "from",
      user_id: 501,
      department_id: 3,
      group_id: 10,
      // ... other tracker fields
    },
    through: {
      flow_type: "through",
      user_id: 101,
      department_id: 1,
      // ... other tracker fields
    },
    to: {
      flow_type: "to",
      user_id: 401,
      department_id: 4,
      group_id: 11,
      // ... other tracker fields
    }
  },
  trackers: [/* array of all trackers */],
  canUserSelectInitiator: true,
  canUserSelectApprover: false,
  availableInitiators: [/* array of UserResponseData */],
  availableApprovers: [/* array of UserResponseData */]
}
```

## Testing Scenarios

### Scenario 1: Personal Scope
- **Expected**: `config.from` = logged-in user, `config.through` = null, `config.to` = null

### Scenario 2: Official Scope - User in Initiator Group
- **Expected**: `config.from` = logged-in user (can select others), `canUserSelectInitiator` = true

### Scenario 3: Official Scope - User NOT in Initiator Group
- **Expected**: `config.from` = first user from initiator group, `canUserSelectInitiator` = true

### Scenario 4: Through Resolution - Department Hierarchy
- **Expected**: `config.through` = directorate signatory from hierarchy traversal

### Scenario 5: Through Resolution - mustPassThrough = true
- **Expected**: `config.through` enforced even if same department as `config.to` (only skipped if same user)

### Scenario 6: Through Resolution - Same Department/User as To
- **Expected**: `config.through` = null (skipped to avoid redundancy)

## Next Steps

After testing and verifying the results:
1. Review the console output
2. Verify the logic matches your requirements
3. Once satisfied, we'll update `useDocumentGenerator.ts` to use the new hook

