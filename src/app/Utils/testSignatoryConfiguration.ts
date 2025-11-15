/**
 * Test file for SignatoryConfiguration
 * Run this in browser console to test the signatory resolution logic
 *
 * Usage:
 * 1. Import this file or copy the test functions
 * 2. Call testSignatoryResolution() with sample data
 * 3. Check console output for results
 */

import { SignatoryConfiguration } from "./SignatoryConfiguration";
import { DocumentCategoryResponseData } from "../Repositories/DocumentCategory/data";
import { AuthUserResponseData } from "../Context/AuthContext";
import { DepartmentResponseData } from "../Repositories/Department/data";
import { GroupResponseData } from "../Repositories/Group/data";
import { UserResponseData } from "../Repositories/User/data";
import { WorkflowStageResponseData } from "../Repositories/WorkflowStage/data";
import { DocumentActionResponseData } from "../Repositories/DocumentAction/data";

/**
 * Create sample test data
 */
export function createSampleTestData() {
  // Sample departments with hierarchy
  const departments: DepartmentResponseData[] = [
    {
      id: 1,
      name: "Operations Directorate",
      abv: "OPS-DIR",
      parentId: 0,
      type: "directorate",
      bco: 0,
      bo: 0,
      director: 0,
      signatory_staff_id: 101, // Director signatory
      alternate_signatory_staff_id: 102,
      is_blocked: 0,
    },
    {
      id: 2,
      name: "Finance Division",
      abv: "FIN-DIV",
      parentId: 1, // Under Operations Directorate
      type: "division",
      bco: 0,
      bo: 0,
      director: 0,
      signatory_staff_id: 201,
      alternate_signatory_staff_id: 202,
      is_blocked: 0,
    },
    {
      id: 3,
      name: "Procurement Department",
      abv: "PROC-DEPT",
      parentId: 2, // Under Finance Division
      type: "department",
      bco: 0,
      bo: 0,
      director: 0,
      signatory_staff_id: 301,
      alternate_signatory_staff_id: 302,
      is_blocked: 0,
    },
    {
      id: 4,
      name: "Finance Department",
      abv: "FIN-DEPT",
      parentId: 1, // Directly under Directorate
      type: "department",
      bco: 0,
      bo: 0,
      director: 0,
      signatory_staff_id: 401,
      alternate_signatory_staff_id: 402,
      is_blocked: 0,
    },
  ];

  // Sample groups
  const groups: GroupResponseData[] = [
    {
      id: 10,
      name: "procurement_officer",
      label: "Procurement Officer",
      rank: 8,
      scope: "department",
    },
    {
      id: 11,
      name: "budget_controller",
      label: "Budget Controller",
      rank: 5,
      scope: "directorate",
    },
    {
      id: 12,
      name: "directorate_review",
      label: "Directorate Review Group",
      rank: 3,
      scope: "directorate",
    },
  ];

  // Sample users
  const users: UserResponseData[] = [
    {
      id: 501,
      staff_no: "EMP001",
      firstname: "John",
      middlename: "",
      surname: "Doe",
      name: "John Doe",
      role_id: 1,
      grade_level_id: 1,
      department_id: 3, // Procurement Department
      default_page_id: 1,
      location_id: 1,
      avatar: "",
      gender: "male",
      date_joined: "",
      job_title: "Procurement Officer",
      is_admin: 0,
      blocked: 0,
      rank: 8,
      type: "permanent",
      status: "available",
      email: "john.doe@example.com",
      carder_id: 1,
      groups: [{ label: "Procurement Officer", value: 10 }], // In procurement officer group
      role: null,
    },
    {
      id: 502,
      staff_no: "EMP002",
      firstname: "Jane",
      middlename: "",
      surname: "Smith",
      name: "Jane Smith",
      role_id: 1,
      grade_level_id: 1,
      department_id: 3, // Procurement Department
      default_page_id: 1,
      location_id: 1,
      avatar: "",
      gender: "female",
      date_joined: "",
      job_title: "Senior Procurement Officer",
      is_admin: 0,
      blocked: 0,
      rank: 7,
      type: "permanent",
      status: "available",
      email: "jane.smith@example.com",
      carder_id: 1,
      groups: [{ label: "Procurement Officer", value: 10 }], // In procurement officer group
      role: null,
    },
    {
      id: 401,
      staff_no: "EMP003",
      firstname: "Budget",
      middlename: "",
      surname: "Controller",
      name: "Budget Controller",
      role_id: 1,
      grade_level_id: 1,
      department_id: 4, // Finance Department
      default_page_id: 1,
      location_id: 1,
      avatar: "",
      gender: "male",
      date_joined: "",
      job_title: "Budget Controller",
      is_admin: 0,
      blocked: 0,
      rank: 5,
      type: "permanent",
      status: "available",
      email: "budget@example.com",
      carder_id: 1,
      groups: [{ label: "Budget Controller", value: 11 }], // In budget controller group
      role: null,
    },
    {
      id: 101,
      staff_no: "EMP004",
      firstname: "Director",
      middlename: "",
      surname: "Operations",
      name: "Director Operations",
      role_id: 1,
      grade_level_id: 1,
      department_id: 1, // Operations Directorate
      default_page_id: 1,
      location_id: 1,
      avatar: "",
      gender: "male",
      date_joined: "",
      job_title: "Director",
      is_admin: 0,
      blocked: 0,
      rank: 2,
      type: "permanent",
      status: "available",
      email: "director@example.com",
      carder_id: 1,
      groups: [{ label: "Directorate Review Group", value: 12 }],
      role: null,
    },
  ];

  // Logged-in user (John Doe - Procurement Officer)
  const loggedInUser: AuthUserResponseData = {
    id: 501,
    name: "John Doe",
    staff_no: "EMP001",
    grade_level_id: 1,
    department_id: 3, // Procurement Department
    location_id: 1,
    carder: { id: 1, name: "Staff", label: "Staff" } as any,
    avatar: "",
    email: "john.doe@example.com",
    role: null,
    pages: [],
    groups: [
      {
        id: 10,
        name: "procurement_officer",
        label: "Procurement Officer",
        rank: 8,
        scope: "department",
      },
    ],
    default_page_id: 1,
    remunerations: [],
    grade_level_object: null,
  };

  // Sample workflow stages with actions
  const workflowStages: WorkflowStageResponseData[] = [
    {
      id: 1,
      workflow_stage_category_id: 1,
      fallback_stage_id: 0,
      department_id: 0,
      name: "Initiator Stage",
      can_appeal: 0,
      append_signature: 0,
      isDisplayed: 1,
      flow: "process",
      category: "staff",
      stage_category: null,
      groups: [],
      department: undefined,
      recipients: [],
      actions: [],
      document_actions: [
        {
          id: 1,
          carder_id: 0,
          trigger_workflow_id: 0,
          name: "submit",
          label: "Submit",
          button_text: "Submit Document",
          icon: "ri-send-plane-line",
          variant: "primary",
          draft_status: "draft",
          action_status: "processing",
          state: "fixed",
          mode: "store",
          category: "signature",
          resource_type: "searchable",
          has_update: 0,
          component: "",
          description: "Submit the document for processing",
          is_resource: 0,
          is_payment: 0,
        } as DocumentActionResponseData,
      ],
    },
    {
      id: 2,
      workflow_stage_category_id: 1,
      fallback_stage_id: 0,
      department_id: 0,
      name: "Approval Stage",
      can_appeal: 0,
      append_signature: 0,
      isDisplayed: 1,
      flow: "process",
      category: "staff",
      stage_category: null,
      groups: [],
      department: undefined,
      recipients: [],
      actions: [],
      document_actions: [
        {
          id: 2,
          carder_id: 0,
          trigger_workflow_id: 0,
          name: "approve",
          label: "Approve",
          button_text: "Approve Document",
          icon: "ri-check-line",
          variant: "success",
          draft_status: "approved",
          action_status: "complete",
          state: "fixed",
          mode: "update",
          category: "signature",
          resource_type: "searchable",
          has_update: 0,
          component: "",
          description: "Approve the document",
          is_resource: 0,
          is_payment: 0,
        } as DocumentActionResponseData,
        {
          id: 3,
          carder_id: 0,
          trigger_workflow_id: 0,
          name: "reject",
          label: "Reject",
          button_text: "Reject Document",
          icon: "ri-close-line",
          variant: "danger",
          draft_status: "rejected",
          action_status: "failed",
          state: "fixed",
          mode: "update",
          category: "signature",
          resource_type: "searchable",
          has_update: 0,
          component: "",
          description: "Reject the document",
          is_resource: 0,
          is_payment: 0,
        } as DocumentActionResponseData,
      ],
    },
    {
      id: 3,
      workflow_stage_category_id: 1,
      fallback_stage_id: 0,
      department_id: 0,
      name: "Through Stage",
      can_appeal: 0,
      append_signature: 0,
      isDisplayed: 1,
      flow: "process",
      category: "staff",
      stage_category: null,
      groups: [],
      department: undefined,
      recipients: [],
      actions: [],
      document_actions: [
        {
          id: 4,
          carder_id: 0,
          trigger_workflow_id: 0,
          name: "review",
          label: "Review",
          button_text: "Review Document",
          icon: "ri-eye-line",
          variant: "info",
          draft_status: "reviewed",
          action_status: "processing",
          state: "fixed",
          mode: "update",
          category: "comment",
          resource_type: "searchable",
          has_update: 0,
          component: "",
          description: "Review the document",
          is_resource: 0,
          is_payment: 0,
        } as DocumentActionResponseData,
      ],
    },
  ];

  return {
    departments,
    groups,
    users,
    loggedInUser,
    workflowStages,
  };
}

/**
 * Test personal scope resolution
 */
export function testPersonalScope() {
  console.log("=== Testing Personal Scope ===");

  const { departments, groups, users, loggedInUser, workflowStages } =
    createSampleTestData();

  const category: DocumentCategoryResponseData = {
    id: 1,
    document_type_id: 1,
    workflow_id: 1,
    type: "staff",
    scope: "personal",
    name: "Personal Document",
    icon: "file",
    label: "Personal Document",
    selectedBlocks: [],
    service: "document",
    description: "Personal document category",
    signature_type: "none",
    with_date: 0,
    requirements: [],
    selectedRequirements: [],
  };

  const result = SignatoryConfiguration.resolve({
    category,
    loggedInUser,
    departments,
    groups,
    users,
    workflowStages,
  });

  console.log("Result:", result);
  console.log("Config:", result.config);
  console.log("Trackers:", result.trackers);

  return result;
}

/**
 * Test official scope with initiator group
 */
export function testOfficialScopeWithInitiator() {
  console.log("=== Testing Official Scope with Initiator Group ===");

  const { departments, groups, users, loggedInUser, workflowStages } =
    createSampleTestData();

  const category: DocumentCategoryResponseData = {
    id: 2,
    document_type_id: 1,
    workflow_id: 1,
    type: "staff",
    scope: "official",
    name: "Work Order",
    icon: "file",
    label: "Work Order",
    selectedBlocks: [],
    service: "document",
    description: "Work order document",
    signature_type: "none",
    with_date: 0,
    requirements: [],
    selectedRequirements: [],
    meta_data: {
      policy: {
        strict: false,
        scope: "private",
        can_override: false,
        clearance_level: null,
        fallback_approver: null,
        for_signed: false,
        days: 30,
        frequency: "days",
        allowedActions: {
          from: [],
          through: [],
          to: [],
        },
        department_id: 3, // Procurement Department
        initiator_group_id: 10, // Procurement Officer group
        approval_group_id: 11, // Budget Controller group
        destination_department_id: 4, // Finance Department
        mustPassThrough: false,
        initiator_workflow_stage_id: 1, // Initiator Stage
        approval_workflow_stage_id: 2, // Approval Stage
        through_workflow_stage_id: 3, // Through Stage
        initiator_should_sign: true, // Initiator should sign
        through_should_sign: true, // Through should sign
      },
      recipients: [],
      actions: [],
      activities: [],
      comments: [],
      settings: {} as any,
    },
  };

  const result = SignatoryConfiguration.resolve({
    category,
    loggedInUser,
    departments,
    groups,
    users,
    workflowStages,
  });

  console.log("Result:", result);
  console.log("Config:", JSON.stringify(result.config, null, 2));
  console.log("Trackers:", result.trackers);
  console.log("Can Select Initiator:", result.canUserSelectInitiator);
  console.log(
    "Available Initiators:",
    result.availableInitiators.map((u) => u.name)
  );
  console.log(
    "Available Approvers:",
    result.availableApprovers.map((u) => u.name)
  );

  return result;
}

/**
 * Test through resolution with hierarchy
 */
export function testThroughResolution() {
  console.log("=== Testing Through Resolution (Department Hierarchy) ===");

  const { departments, groups, users, loggedInUser, workflowStages } =
    createSampleTestData();

  const category: DocumentCategoryResponseData = {
    id: 3,
    document_type_id: 1,
    workflow_id: 1,
    type: "staff",
    scope: "official",
    name: "Procurement Document",
    icon: "file",
    label: "Procurement Document",
    selectedBlocks: [],
    service: "document",
    description: "Procurement document",
    signature_type: "none",
    with_date: 0,
    requirements: [],
    selectedRequirements: [],
    meta_data: {
      policy: {
        strict: false,
        scope: "private",
        can_override: false,
        clearance_level: null,
        fallback_approver: null,
        for_signed: false,
        days: 30,
        frequency: "days",
        allowedActions: {
          from: [],
          through: [],
          to: [],
        },
        department_id: 3, // Procurement Department (type: department)
        initiator_group_id: 10,
        approval_group_id: 11,
        destination_department_id: 4,
        mustPassThrough: false,
        initiator_workflow_stage_id: 1,
        approval_workflow_stage_id: 2,
        through_workflow_stage_id: 3,
        initiator_should_sign: true,
        through_should_sign: true,
      },
      recipients: [],
      actions: [],
      activities: [],
      comments: [],
      settings: {} as any,
    },
  };

  const result = SignatoryConfiguration.resolve({
    category,
    loggedInUser,
    departments,
    groups,
    users,
    workflowStages,
  });

  console.log("Result:", result);
  console.log("Through Tracker:", result.config?.through);
  console.log(
    "Through Department:",
    departments.find((d) => d.id === result.config?.through?.department_id)
      ?.name
  );
  console.log(
    "Through User:",
    users.find((u) => u.id === result.config?.through?.user_id)?.name
  );

  return result;
}

/**
 * Test mustPassThrough enforcement
 */
export function testMustPassThrough() {
  console.log("=== Testing mustPassThrough Enforcement ===");

  const { departments, groups, users, loggedInUser, workflowStages } =
    createSampleTestData();

  const category: DocumentCategoryResponseData = {
    id: 4,
    document_type_id: 1,
    workflow_id: 1,
    type: "staff",
    scope: "official",
    name: "Enforced Through Document",
    icon: "file",
    label: "Enforced Through Document",
    selectedBlocks: [],
    service: "document",
    description: "Document with enforced through",
    signature_type: "none",
    with_date: 0,
    requirements: [],
    selectedRequirements: [],
    meta_data: {
      policy: {
        strict: false,
        scope: "private",
        can_override: false,
        clearance_level: null,
        fallback_approver: null,
        for_signed: false,
        days: 30,
        frequency: "days",
        allowedActions: {
          from: [],
          through: [],
          to: [],
        },
        department_id: 3,
        initiator_group_id: 10,
        approval_group_id: 11,
        destination_department_id: 4,
        mustPassThrough: true, // Enforce through
        through_group_id: 12, // Directorate Review Group
        initiator_workflow_stage_id: 1,
        approval_workflow_stage_id: 2,
        through_workflow_stage_id: 3,
        initiator_should_sign: true,
        through_should_sign: true,
      },
      recipients: [],
      actions: [],
      activities: [],
      comments: [],
      settings: {} as any,
    },
  };

  const result = SignatoryConfiguration.resolve({
    category,
    loggedInUser,
    departments,
    groups,
    users,
    workflowStages,
  });

  console.log("Result:", result);
  console.log("Through Tracker (Enforced):", result.config?.through);
  console.log(
    "Must Pass Through:",
    category.meta_data?.policy?.mustPassThrough
  );

  return result;
}

/**
 * Test fixed user IDs (bypass group resolution)
 */
export function testFixedUsers() {
  console.log("=== Testing Fixed User IDs ===");

  const { departments, groups, users, loggedInUser, workflowStages } =
    createSampleTestData();

  const category: DocumentCategoryResponseData = {
    id: 5,
    document_type_id: 1,
    workflow_id: 1,
    type: "staff",
    scope: "official",
    name: "Fixed Users Document",
    icon: "file",
    label: "Fixed Users Document",
    selectedBlocks: [],
    service: "document",
    description: "Document with fixed users for all stages",
    signature_type: "none",
    with_date: 0,
    requirements: [],
    selectedRequirements: [],
    meta_data: {
      policy: {
        strict: false,
        scope: "private",
        can_override: false,
        clearance_level: null,
        fallback_approver: null,
        for_signed: false,
        days: 30,
        frequency: "days",
        allowedActions: {
          from: [],
          through: [],
          to: [],
        },
        // Fixed user IDs override group resolution
        initiator_user_id: 501, // John Doe (Procurement Officer)
        through_user_id: 101, // Director (from Operations Directorate)
        to_user_id: 401, // Finance Department Signatory
        initiator_workflow_stage_id: 1,
        approval_workflow_stage_id: 2,
        through_workflow_stage_id: 3,
        initiator_should_sign: true,
        through_should_sign: true,
      },
      recipients: [],
      actions: [],
      activities: [],
      comments: [],
      settings: {} as any,
    },
  };

  const result = SignatoryConfiguration.resolve({
    category,
    loggedInUser,
    departments,
    groups,
    users,
    workflowStages,
  });

  console.log("Result:", result);
  console.log("Initiator (Fixed):", result.config?.from);
  console.log(
    "Initiator User:",
    users.find((u) => u.id === result.config?.from?.user_id)?.name
  );
  console.log("Through (Fixed):", result.config?.through);
  console.log(
    "Through User:",
    users.find((u) => u.id === result.config?.through?.user_id)?.name
  );
  console.log("Approver (Fixed):", result.config?.to);
  console.log(
    "Approver User:",
    users.find((u) => u.id === result.config?.to?.user_id)?.name
  );
  console.log("Can Select Initiator:", result.canUserSelectInitiator);
  console.log("Can Select Approver:", result.canUserSelectApprover);

  return result;
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log("🧪 Running SignatoryConfiguration Tests\n");

  testPersonalScope();
  console.log("\n");

  testOfficialScopeWithInitiator();
  console.log("\n");

  testThroughResolution();
  console.log("\n");

  testMustPassThrough();
  console.log("\n");

  testFixedUsers();
  console.log("\n");

  console.log("✅ All tests completed!");
}

// Export for browser console usage
if (typeof window !== "undefined") {
  (window as any).testSignatoryConfiguration = {
    testPersonalScope,
    testOfficialScopeWithInitiator,
    testThroughResolution,
    testMustPassThrough,
    testFixedUsers,
    runAllTests,
    createSampleTestData,
  };
}
