import { useMemo } from "react";
import { ConfigState } from "app/Hooks/useTemplateHeader";
import { TemplateProcessProps } from "../Repositories/Template/data";
import { WorkflowResponseData } from "../Repositories/Workflow/data";
import { ProgressTrackerResponseData } from "../Repositories/ProgressTracker/data";
import { DocumentCategoryResponseData } from "../Repositories/DocumentCategory/data";
// Using built-in crypto.randomUUID() for unique identifiers

interface UseWorkflowTransformerProps {
  configState: ConfigState;
  category: DocumentCategoryResponseData | null;
}

interface WorkflowTransformerResult {
  workflow: WorkflowResponseData | null;
  trackers: ProgressTrackerResponseData[];
  isValid: boolean;
  errors: string[];
}

const useWorkflowTransformer = ({
  configState,
  category,
}: UseWorkflowTransformerProps): WorkflowTransformerResult => {
  return useMemo(() => {
    const errors: string[] = [];
    const trackers: ProgressTrackerResponseData[] = [];

    // Validate required data
    if (!category) {
      errors.push("Category is required");
      return { workflow: null, trackers: [], isValid: false, errors };
    }

    if (!configState.from?.state) {
      errors.push("From state is required");
      return { workflow: null, trackers: [], isValid: false, errors };
    }

    if (!configState.to?.state) {
      errors.push("To state is required");
      return { workflow: null, trackers: [], isValid: false, errors };
    }

    // Note: configState.through is optional and may not be present

    // Generate workflow name and description
    const workflowName = `${category.name} Workflow`;
    const workflowDescription = `Automated workflow for ${category.name} document processing`;

    // Generate unique identifier for the workflow
    const workflowIdentifier = `wf_${category.service}_${Date.now()}_${crypto
      .randomUUID()
      .replace(/-/g, "")
      .substring(0, 8)}`;

    // Define the flow order based on the transformation requirements
    const flowOrder: Array<{
      key: keyof ConfigState;
      state: TemplateProcessProps;
    }> = [];

    // Add 'from' state as first tracker (required)
    if (configState.from?.state) {
      flowOrder.push({ key: "from", state: configState.from.state });
    }

    // Add 'through' state as second tracker (optional - may not be present)
    // Only include if it has valid stage, group, and department data
    if (
      configState.through?.state &&
      configState.through.state.stage?.value &&
      configState.through.state.group?.value &&
      configState.through.state.department?.value
    ) {
      flowOrder.push({ key: "through", state: configState.through.state });
    }

    // Add 'to' state as last tracker (required)
    if (configState.to?.state) {
      flowOrder.push({ key: "to", state: configState.to.state });
    }

    // Transform each state into a ProgressTrackerResponseData
    flowOrder.forEach(({ key, state }, index) => {
      const order = index + 1;
      const trackerIdentifier = `${workflowIdentifier}_tracker_${order}`;

      // Validate required fields for each tracker
      if (!state.stage?.value) {
        errors.push(`${key} stage is required`);
        return;
      }

      if (!state.group?.value) {
        errors.push(`${key} group is required`);
        return;
      }

      if (!state.department?.value) {
        errors.push(`${key} department is required`);
        return;
      }

      const tracker: ProgressTrackerResponseData = {
        id: 0, // Will be set by backend
        workflow_id: 0, // Will be set by backend
        workflow_stage_id: Number(state.stage.value),
        identifier: trackerIdentifier,
        document_type_id: category.document_type_id,
        group_id: Number(state.group.value),
        carder_id: state.staff?.value ? Number(state.staff.value) : 0,
        department_id: Number(state.department.value),
        signatory_id: 0, // Will be set by backend if needed
        internal_process_id: 0, // Will be set by backend if needed
        permission: state.permissions || "r",
        order,
        stage: null, // Will be populated by backend
        group: null, // Will be populated by backend
        document_type: null, // Will be populated by backend
        carder: null, // Will be populated by backend
        actions: [], // Will be populated by backend
        recipients: [], // Will be populated by backend
        loadedActions: [], // Will be populated by backend
        widgets: [], // Will be populated by backend
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      trackers.push(tracker);
    });

    // Create the workflow object
    const workflow: WorkflowResponseData = {
      id: 0, // Will be set by backend
      name: workflowName,
      type: "serialize", // Default to serialize for document workflows
      description: workflowDescription,
      stages: [], // Will be populated by backend
      signatories: [], // Will be populated by backend
      trackers,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const isValid = errors.length === 0 && trackers.length > 0;

    return {
      workflow: isValid ? workflow : null,
      trackers,
      isValid,
      errors,
    };
  }, [configState, category]);
};

export default useWorkflowTransformer;
