import { DocumentCategoryResponseData } from "../Repositories/DocumentCategory/data";
import {
  CategoryProgressTrackerProps,
  DocumentPolicy,
} from "../Repositories/DocumentCategory/data";
import {
  ProcessFlowConfigProps,
  ProcessFlowType,
} from "@/resources/views/crud/DocumentWorkflow";
import { AuthUserResponseData } from "../Context/AuthContext";
import { DepartmentResponseData } from "../Repositories/Department/data";
import { GroupResponseData } from "../Repositories/Group/data";
import { UserResponseData } from "../Repositories/User/data";
import { SignatoryType } from "../Repositories/Signatory/data";
import { PermissionTypes } from "../Repositories/ProgressTracker/data";
import { DocumentActionResponseData } from "../Repositories/DocumentAction/data";
import { WorkflowStageResponseData } from "../Repositories/WorkflowStage/data";

export interface SignatoryResolutionParams {
  category: DocumentCategoryResponseData | null;
  loggedInUser: AuthUserResponseData;
  departments: DepartmentResponseData[];
  groups: GroupResponseData[];
  users: UserResponseData[];
  workflowStages?: WorkflowStageResponseData[];
  existingConfig?: ProcessFlowConfigProps | null;
}

export interface SignatoryResolutionResult {
  config: ProcessFlowConfigProps | null;
  trackers: CategoryProgressTrackerProps[];
  canUserSelectInitiator: boolean;
  canUserSelectApprover: boolean;
  availableInitiators: UserResponseData[];
  availableApprovers: UserResponseData[];
}

/**
 * Utility class for resolving document signatory configuration
 * Handles personal and official scope resolution with group-based hierarchy
 */
export class SignatoryConfiguration {
  /**
   * Safely get policy from category with fallback handling
   */
  static getPolicy(
    category: DocumentCategoryResponseData
  ): DocumentPolicy | null {
    return category.meta_data?.policy || null;
  }

  /**
   * Check if a user belongs to a specific group
   */
  static checkUserInGroup(
    user: UserResponseData | AuthUserResponseData,
    groupId: number
  ): boolean {
    if ("groups" in user && user.groups) {
      if (Array.isArray(user.groups)) {
        return user.groups.some((g: any) => {
          return g.id === groupId || g.value === groupId;
        });
      }
    }
    return false;
  }

  /**
   * Get all users in a group within a specific department
   */
  static getUsersInGroupAndDepartment(
    users: UserResponseData[],
    groupId: number,
    departmentId: number
  ): UserResponseData[] {
    return users.filter(
      (user) =>
        user.department_id === departmentId &&
        this.checkUserInGroup(user, groupId)
    );
  }

  /**
   * Traverse department hierarchy to find directorate parent
   * Returns the directorate department that is the ultimate parent
   */
  static findDirectorateParent(
    startDepartmentId: number,
    departments: DepartmentResponseData[]
  ): DepartmentResponseData | null {
    let currentDept = departments.find((d) => d.id === startDepartmentId);
    if (!currentDept) return null;

    // If already a directorate, return it
    if (currentDept.type === "directorate") {
      return currentDept;
    }

    const visited = new Set<number>();

    while (currentDept) {
      // Prevent infinite loops
      if (visited.has(currentDept.id)) break;
      visited.add(currentDept.id);

      // If current department is a directorate, we found it
      if (currentDept.type === "directorate") {
        return currentDept;
      }

      // If no parent, we can't go further
      if (!currentDept.parentId || currentDept.parentId === 0) {
        break;
      }

      // Get parent department
      const parentDept = departments.find(
        (d) => d.id === currentDept!.parentId
      );
      if (!parentDept) break; // Parent doesn't exist

      // Move to parent
      currentDept = parentDept;
    }

    return null;
  }

  /**
   * Get actions from a workflow stage
   */
  static getActionsFromWorkflowStage(
    workflowStageId: number | null | undefined,
    workflowStages: WorkflowStageResponseData[]
  ): DocumentActionResponseData[] {
    if (!workflowStageId || workflowStageId === 0) {
      return [];
    }

    const stage = workflowStages.find((ws) => ws.id === workflowStageId);
    if (!stage) {
      return [];
    }

    return stage.document_actions || [];
  }

  /**
   * Resolve user from group and department, prioritizing signatory_staff_id
   */
  static resolveUserFromGroupAndDepartment(
    users: UserResponseData[],
    groupId: number,
    departmentId: number,
    departments: DepartmentResponseData[],
    preferSignatory: boolean = true
  ): UserResponseData | null {
    // Get users in group and department
    const eligibleUsers = this.getUsersInGroupAndDepartment(
      users,
      groupId,
      departmentId
    );

    if (eligibleUsers.length === 0) {
      return null;
    }

    // If preferSignatory is true, try to find department signatory
    if (preferSignatory) {
      const department = departments.find((d) => d.id === departmentId);
      if (department?.signatory_staff_id && department.signatory_staff_id > 0) {
        const signatoryUser = eligibleUsers.find(
          (u) => u.id === department.signatory_staff_id
        );
        if (signatoryUser) {
          return signatoryUser;
        }
      }
    }

    // Fallback to first user
    return eligibleUsers[0];
  }

  /**
   * Create a CategoryProgressTrackerProps object
   */
  static createTracker(params: {
    flow_type: ProcessFlowType;
    user_id: number;
    department_id: number;
    group_id?: number | null;
    carder_id?: number;
    workflow_stage_id?: number;
    order: number;
    permission?: PermissionTypes;
    signatory_type?: SignatoryType;
    should_be_signed?: "yes" | "no";
    actions?: DocumentActionResponseData[];
    identifier?: string;
  }): CategoryProgressTrackerProps {
    return {
      flow_type: params.flow_type,
      identifier: params.identifier || `${params.flow_type}-${params.user_id}`,
      workflow_stage_id: params.workflow_stage_id || 0,
      group_id: params.group_id || 0,
      department_id: params.department_id,
      carder_id: params.carder_id || 0,
      user_id: params.user_id,
      order: params.order,
      permission: params.permission || "rw",
      signatory_type: params.signatory_type || "approval",
      should_be_signed: params.should_be_signed || "yes",
      actions: params.actions || [],
    };
  }

  /**
   * Resolve FROM (Initiator) channel
   */
  static resolveFrom(
    category: DocumentCategoryResponseData,
    loggedInUser: AuthUserResponseData,
    departments: DepartmentResponseData[],
    groups: GroupResponseData[],
    users: UserResponseData[],
    workflowStages: WorkflowStageResponseData[] = []
  ): {
    tracker: CategoryProgressTrackerProps | null;
    department: DepartmentResponseData | null;
  } {
    const policy = this.getPolicy(category);
    const initiatorWorkflowStageId = policy?.initiator_workflow_stage_id;
    const initiatorGroupId = policy?.initiator_group_id;
    const policyDepartmentId = policy?.department_id;
    const initiatorShouldSign = policy?.initiator_should_sign ?? true;

    // Handle personal scope
    if (category.scope === "personal") {
      const tracker = this.createTracker({
        flow_type: "from",
        user_id: loggedInUser.id,
        department_id: loggedInUser.department_id,
        order: 1,
        signatory_type: "initiator",
        should_be_signed: initiatorShouldSign ? "yes" : "no",
      });

      const department = departments.find(
        (d) => d.id === loggedInUser.department_id
      );

      return {
        tracker,
        department: department || null,
      };
    }

    // Handle official scope
    // Require initiator_workflow_stage_id and initiator_group_id (must be > 0)
    if (
      !initiatorWorkflowStageId ||
      initiatorWorkflowStageId === 0 ||
      !initiatorGroupId ||
      initiatorGroupId === 0
    ) {
      return {
        tracker: null,
        department: null,
      };
    }

    // Resolve department_id: if 0, use loggedInUser.department_id
    const resolvedDepartmentId =
      !policyDepartmentId || policyDepartmentId === 0
        ? loggedInUser.department_id
        : policyDepartmentId;

    // Resolve department
    const department = departments.find((d) => d.id === resolvedDepartmentId);
    if (!department) {
      return {
        tracker: null,
        department: null,
      };
    }

    // Resolve workflow stage and get actions
    const actions = this.getActionsFromWorkflowStage(
      initiatorWorkflowStageId,
      workflowStages
    );

    // Resolve user: prefer department.signatory_staff_id, else first user in group
    const resolvedUser = this.resolveUserFromGroupAndDepartment(
      users,
      initiatorGroupId,
      resolvedDepartmentId,
      departments,
      true // preferSignatory = true
    );

    if (!resolvedUser) {
      return {
        tracker: null,
        department: null,
      };
    }

    const tracker = this.createTracker({
      flow_type: "from",
      user_id: resolvedUser.id,
      department_id: resolvedDepartmentId,
      group_id: initiatorGroupId,
      workflow_stage_id: initiatorWorkflowStageId,
      actions,
      order: 1,
      signatory_type: "initiator",
      should_be_signed: initiatorShouldSign ? "yes" : "no",
    });

    return {
      tracker,
      department,
    };
  }

  /**
   * Resolve TO (Approver) channel
   */
  static resolveTo(
    category: DocumentCategoryResponseData,
    loggedInUser: AuthUserResponseData,
    departments: DepartmentResponseData[],
    groups: GroupResponseData[],
    users: UserResponseData[],
    workflowStages: WorkflowStageResponseData[] = []
  ): {
    tracker: CategoryProgressTrackerProps | null;
    department: DepartmentResponseData | null;
  } {
    const policy = this.getPolicy(category);
    const approvalWorkflowStageId = policy?.approval_workflow_stage_id;
    const approvalGroupId = policy?.approval_group_id;
    const destinationDepartmentId = policy?.destination_department_id;

    // Require approval_workflow_stage_id and approval_group_id (must be > 0)
    if (
      !approvalWorkflowStageId ||
      approvalWorkflowStageId === 0 ||
      !approvalGroupId ||
      approvalGroupId === 0
    ) {
      return {
        tracker: null,
        department: null,
      };
    }

    // Resolve department_id: if < 1, use loggedInUser.department_id
    const resolvedDepartmentId =
      !destinationDepartmentId || destinationDepartmentId < 1
        ? loggedInUser.department_id
        : destinationDepartmentId;

    // Resolve department
    const department = departments.find((d) => d.id === resolvedDepartmentId);
    if (!department) {
      return {
        tracker: null,
        department: null,
      };
    }

    // Resolve workflow stage and get actions
    const actions = this.getActionsFromWorkflowStage(
      approvalWorkflowStageId,
      workflowStages
    );

    // Resolve user: prefer department.signatory_staff_id, else first user in group
    const resolvedUser = this.resolveUserFromGroupAndDepartment(
      users,
      approvalGroupId,
      resolvedDepartmentId,
      departments,
      true // preferSignatory = true
    );

    if (!resolvedUser) {
      return {
        tracker: null,
        department: null,
      };
    }

    const tracker = this.createTracker({
      flow_type: "to",
      user_id: resolvedUser.id,
      department_id: resolvedDepartmentId,
      group_id: approvalGroupId,
      workflow_stage_id: approvalWorkflowStageId,
      actions,
      order: 3, // Will be adjusted based on through existence
      signatory_type: "approval",
      should_be_signed: "yes", // Always yes for approver
    });

    return {
      tracker,
      department,
    };
  }

  /**
   * Resolve THROUGH channel
   */
  static resolveThrough(
    category: DocumentCategoryResponseData,
    loggedInUser: AuthUserResponseData,
    departments: DepartmentResponseData[],
    groups: GroupResponseData[],
    users: UserResponseData[],
    workflowStages: WorkflowStageResponseData[] = [],
    fromDepartment: DepartmentResponseData | null,
    toDepartment: DepartmentResponseData | null
  ): CategoryProgressTrackerProps | null {
    const policy = this.getPolicy(category);
    const mustPassThrough = policy?.mustPassThrough ?? false;
    const explicitlyEnforceThrough = policy?.explicitlyEnforceThrough ?? false;
    const throughGroupId = policy?.through_group_id;
    const throughWorkflowStageId = policy?.through_workflow_stage_id;
    const throughShouldSign = policy?.through_should_sign ?? true;

    // If explicitlyEnforceThrough is true, check if all required params are set
    if (explicitlyEnforceThrough) {
      if (
        !throughGroupId ||
        throughGroupId === 0 ||
        !throughWorkflowStageId ||
        throughWorkflowStageId === 0
      ) {
        // Missing required params, return null
        return null;
      }

      // Resolve through from group (similar to resolveThroughFromGroup logic)
      const categoryDeptId =
        policy?.department_id && policy.department_id > 0
          ? policy.department_id
          : loggedInUser.department_id;

      if (!categoryDeptId || categoryDeptId === 0) {
        return null;
      }

      const throughUsers = this.getUsersInGroupAndDepartment(
        users,
        throughGroupId,
        categoryDeptId
      );

      if (throughUsers.length === 0) {
        return null;
      }

      const categoryDept = departments.find((d) => d.id === categoryDeptId);
      let throughUserId: number | null = null;

      if (categoryDept?.signatory_staff_id) {
        const signatoryInGroup = throughUsers.find(
          (u) => u.id === categoryDept.signatory_staff_id
        );
        if (signatoryInGroup) {
          throughUserId = categoryDept.signatory_staff_id;
        }
      }

      if (!throughUserId && throughUsers.length > 0) {
        throughUserId = throughUsers[0].id;
      }

      if (!throughUserId) {
        return null;
      }

      const actions = this.getActionsFromWorkflowStage(
        throughWorkflowStageId,
        workflowStages
      );

      return this.createTracker({
        flow_type: "through",
        user_id: throughUserId,
        department_id: categoryDeptId,
        group_id: throughGroupId,
        workflow_stage_id: throughWorkflowStageId,
        actions,
        order: 2,
        signatory_type: "approval",
        should_be_signed: throughShouldSign ? "yes" : "no",
        identifier: `through-explicit-${throughGroupId}`,
      });
    }

    // Normal through resolution logic
    // Check all conditions:
    // 1. to.department.type === "directorate"
    // 2. to.department.is_soverign === true
    // 3. from.department.type === "department" OR "division"
    // 4. mustPassThrough === true
    // 5. through_group_id > 0
    // 6. through_workflow_stage_id > 0

    if (!mustPassThrough) {
      return null;
    }

    if (
      !throughGroupId ||
      throughGroupId === 0 ||
      !throughWorkflowStageId ||
      throughWorkflowStageId === 0
    ) {
      return null;
    }

    if (!fromDepartment || !toDepartment) {
      return null;
    }

    // Check to department conditions
    if (
      toDepartment.type !== "directorate" ||
      !toDepartment.is_soverign ||
      toDepartment.is_soverign !== true
    ) {
      return null;
    }

    // Check from department type
    if (
      fromDepartment.type !== "department" &&
      fromDepartment.type !== "division"
    ) {
      return null;
    }

    // Find directorate parent for from department
    const directorateParent = this.findDirectorateParent(
      fromDepartment.id,
      departments
    );

    if (!directorateParent) {
      return null;
    }

    // Resolve workflow stage and get actions
    const actions = this.getActionsFromWorkflowStage(
      throughWorkflowStageId,
      workflowStages
    );

    // Get users in through group within directorate department
    const throughUsers = this.getUsersInGroupAndDepartment(
      users,
      throughGroupId,
      directorateParent.id
    );

    if (throughUsers.length === 0) {
      return null;
    }

    // Resolve user: prefer directorate.signatory_staff_id, else first user
    let throughUserId: number | null = null;

    if (directorateParent.signatory_staff_id) {
      const signatoryInGroup = throughUsers.find(
        (u) => u.id === directorateParent.signatory_staff_id
      );
      if (signatoryInGroup) {
        throughUserId = directorateParent.signatory_staff_id;
      }
    }

    if (!throughUserId && throughUsers.length > 0) {
      throughUserId = throughUsers[0].id;
    }

    if (!throughUserId) {
      return null;
    }

    return this.createTracker({
      flow_type: "through",
      user_id: throughUserId,
      department_id: directorateParent.id,
      group_id: throughGroupId,
      workflow_stage_id: throughWorkflowStageId,
      actions,
      order: 2,
      signatory_type: "approval",
      should_be_signed: throughShouldSign ? "yes" : "no",
      identifier: `through-directorate-${directorateParent.id}`,
    });
  }

  /**
   * Resolve official scope configuration
   */
  static resolveOfficialScope(
    category: DocumentCategoryResponseData,
    loggedInUser: AuthUserResponseData,
    departments: DepartmentResponseData[],
    groups: GroupResponseData[],
    users: UserResponseData[],
    workflowStages: WorkflowStageResponseData[] = []
  ): SignatoryResolutionResult {
    const config: ProcessFlowConfigProps = {
      from: null,
      through: null,
      to: null,
    };
    const result: SignatoryResolutionResult = {
      config,
      trackers: [],
      canUserSelectInitiator: false,
      canUserSelectApprover: false,
      availableInitiators: [],
      availableApprovers: [],
    };

    // Resolve FROM
    const fromResult = this.resolveFrom(
      category,
      loggedInUser,
      departments,
      groups,
      users,
      workflowStages
    );
    if (fromResult.tracker) {
      config.from = fromResult.tracker;
    }

    // Resolve TO
    const toResult = this.resolveTo(
      category,
      loggedInUser,
      departments,
      groups,
      users,
      workflowStages
    );
    if (toResult.tracker) {
      config.to = toResult.tracker;
      // Adjust order based on through existence (will be updated if through exists)
      config.to.order = 3;
    }

    // Resolve THROUGH (requires from and to departments)
    if (fromResult.department && toResult.department) {
      const throughTracker = this.resolveThrough(
        category,
        loggedInUser,
        departments,
        groups,
        users,
        workflowStages,
        fromResult.department,
        toResult.department
      );

      if (throughTracker) {
        config.through = throughTracker;
        // Adjust to order since through exists
        if (config.to) {
          config.to.order = 3;
        }
      } else {
        // No through, adjust to order
        if (config.to) {
          config.to.order = 2;
        }
      }
    }

    // Build trackers array (filter out null values)
    result.trackers = [config.from, config.through, config.to].filter(
      (tracker): tracker is CategoryProgressTrackerProps => tracker !== null
    );

    return result;
  }

  /**
   * Resolve personal scope configuration
   */
  static resolvePersonalScope(
    loggedInUser: AuthUserResponseData,
    category: DocumentCategoryResponseData,
    departments: DepartmentResponseData[] = [],
    groups: GroupResponseData[] = [],
    users: UserResponseData[] = [],
    workflowStages: WorkflowStageResponseData[] = []
  ): SignatoryResolutionResult {
    const policy = this.getPolicy(category);
    const initiatorShouldSign = policy?.initiator_should_sign ?? true;

    const fromTracker = this.createTracker({
      flow_type: "from",
      user_id: loggedInUser.id,
      department_id: loggedInUser.department_id,
      order: 1,
      signatory_type: "initiator",
      should_be_signed: initiatorShouldSign ? "yes" : "no",
    });

    const config: ProcessFlowConfigProps = {
      from: fromTracker,
      through: null,
      to: null,
    };

    // Resolve approver if configured
    const toResult = this.resolveTo(
      category,
      loggedInUser,
      departments,
      groups,
      users,
      workflowStages
    );
    if (toResult.tracker) {
      config.to = toResult.tracker;
      config.to.order = 2; // No through in personal scope typically
    }

    const trackers = [fromTracker];
    if (config.to) {
      trackers.push(config.to);
    }

    return {
      config,
      trackers,
      canUserSelectInitiator: false,
      canUserSelectApprover: false,
      availableInitiators: [],
      availableApprovers: [],
    };
  }

  /**
   * Main resolution method - orchestrates the entire signatory resolution process
   */
  static resolve(params: SignatoryResolutionParams): SignatoryResolutionResult {
    const {
      category,
      loggedInUser,
      departments,
      groups,
      users,
      workflowStages = [],
      existingConfig,
    } = params;

    // Add null check for category
    if (!category) {
      return {
        config: null,
        trackers: [],
        canUserSelectInitiator: false,
        canUserSelectApprover: false,
        availableInitiators: [],
        availableApprovers: [],
      };
    }

    // Priority 1: Use existing config if available
    if (existingConfig) {
      return {
        config: existingConfig,
        trackers: [],
        canUserSelectInitiator: false,
        canUserSelectApprover: false,
        availableInitiators: [],
        availableApprovers: [],
      };
    }

    // Priority 2: Scope-based resolution
    if (category.scope === "personal") {
      return this.resolvePersonalScope(
        loggedInUser,
        category,
        departments,
        groups,
        users,
        workflowStages
      );
    } else if (category.scope === "official") {
      return this.resolveOfficialScope(
        category,
        loggedInUser,
        departments,
        groups,
        users,
        workflowStages
      );
    }

    // Fallback
    return {
      config: null,
      trackers: [],
      canUserSelectInitiator: false,
      canUserSelectApprover: false,
      availableInitiators: [],
      availableApprovers: [],
    };
  }
}
