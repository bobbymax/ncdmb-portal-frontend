import { TemplateBoardState } from "./TemplateBoardContext";
import { ContentAreaProps } from "app/Hooks/useBuilder";
import { ConfigState } from "app/Hooks/useTemplateHeader";

/**
 * Migration utility to handle backward compatibility during refactoring
 */
export class TemplateBoardMigration {
  /**
   * Migrate existing content state to new context structure
   */
  static migrateContentState(
    existingContents: ContentAreaProps[],
    existingConfigState: ConfigState,
    existingResource: any
  ): Partial<TemplateBoardState> {
    return {
      contents: existingContents || [],
      configState: existingConfigState || {
        from: {
          key: "from",
          state: {
            process_type: "from",
            stage: null,
            group: null,
            department: null,
            permissions: {} as any,
          },
        },
        to: {
          key: "to",
          state: {
            process_type: "to",
            stage: null,
            group: null,
            department: null,
            permissions: {} as any,
          },
        },
        through: {
          key: "through",
          state: {
            process_type: "through",
            stage: null,
            group: null,
            department: null,
            permissions: {} as any,
          },
        },
        cc: { key: "cc", state: [] },
        approvers: { key: "approvers", state: [] },
      },
      resource: existingResource || null,
    };
  }

  /**
   * Validate state structure for backward compatibility
   */
  static validateState(state: TemplateBoardState): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check if contents array exists
    if (!Array.isArray(state.contents)) {
      errors.push("Contents must be an array");
    }

    // Check if configState has required structure
    if (!state.configState || typeof state.configState !== "object") {
      errors.push("ConfigState must be an object");
    }

    // Check required configState properties
    const requiredConfigKeys = [
      "from",
      "to",
      "through",
      "cc",
      "approvers",
    ] as const;
    requiredConfigKeys.forEach((key) => {
      if (!state.configState[key as keyof ConfigState]) {
        errors.push(`ConfigState missing required key: ${key}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a fallback state for error recovery
   */
  static createFallbackState(): TemplateBoardState {
    return {
      category: null,
      template: null,
      contents: [],
      configState: {
        from: {
          key: "from",
          state: {
            process_type: "from",
            stage: null,
            group: null,
            department: null,
            permissions: {} as any,
          },
        },
        to: {
          key: "to",
          state: {
            process_type: "to",
            stage: null,
            group: null,
            department: null,
            permissions: {} as any,
          },
        },
        through: {
          key: "through",
          state: {
            process_type: "through",
            stage: null,
            group: null,
            department: null,
            permissions: {} as any,
          },
        },
        cc: { key: "cc", state: [] },
        approvers: { key: "approvers", state: [] },
      },
      // ContentBuilder Specific State
      blocks: [],
      activeBlockId: null,
      isBuilding: false,
      buildProgress: 0,
      buildStep: "",
      documentState: {} as any,
      resource: null,
      workflow: null,
      trackers: [],
      processType: {} as any,
      uploads: [],
      fund: null,
      parentDocument: null,
      isGenerating: false,
      loadingProgress: 0,
      loadingStep: "",
      isValid: false,
      errors: [],
    };
  }
}
