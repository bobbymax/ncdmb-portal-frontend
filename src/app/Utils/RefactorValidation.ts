import { TemplateProcessProps } from "app/Repositories/Template/data";
import { ProcessType } from "resources/views/crud/ContentBuilder";

export interface ValidationResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ComponentValidation {
  componentName: string;
  results: ValidationResult[];
  overallSuccess: boolean;
}

export class RefactorValidation {
  private static instance: RefactorValidation;
  private validationResults: ComponentValidation[] = [];

  static getInstance(): RefactorValidation {
    if (!RefactorValidation.instance) {
      RefactorValidation.instance = new RefactorValidation();
    }
    return RefactorValidation.instance;
  }

  // Validate state synchronization between ContentBuilder and DocumentGenerator
  validateStateSynchronization(
    contentBuilderState: any,
    documentGeneratorState: any
  ): ValidationResult {
    try {
      const contentConfigState = contentBuilderState?.configState;
      const generatorConfigState = documentGeneratorState?.configState;

      if (!contentConfigState || !generatorConfigState) {
        return {
          success: false,
          message: "Missing configState in one or both components",
          timestamp: new Date(),
        };
      }

      // Check if process types are synchronized
      const contentProcessTypes = Object.keys(contentConfigState);
      const generatorProcessTypes = Object.keys(generatorConfigState);

      if (contentProcessTypes.length !== generatorProcessTypes.length) {
        return {
          success: false,
          message: `Process type count mismatch: ContentBuilder (${contentProcessTypes.length}) vs DocumentGenerator (${generatorProcessTypes.length})`,
          timestamp: new Date(),
        };
      }

      // Validate each process type
      for (const processType of contentProcessTypes) {
        const contentData = contentConfigState[processType];
        const generatorData = generatorConfigState[processType];

        if (!contentData || !generatorData) {
          return {
            success: false,
            message: `Missing data for process type: ${processType}`,
            timestamp: new Date(),
          };
        }

        // Deep comparison of state data
        if (JSON.stringify(contentData) !== JSON.stringify(generatorData)) {
          return {
            success: false,
            message: `State mismatch for process type: ${processType}`,
            details: {
              contentData,
              generatorData,
            },
            timestamp: new Date(),
          };
        }
      }

      return {
        success: true,
        message: "State synchronization validated successfully",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Validation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date(),
      };
    }
  }

  // Validate useProcessState hook functionality
  validateUseProcessState(
    processType: ProcessType,
    currentState: TemplateProcessProps,
    dependencies: any,
    handleStateUpdate: (state: TemplateProcessProps, key: ProcessType) => void
  ): ValidationResult {
    try {
      // Validate process type
      if (
        !processType ||
        !["from", "to", "through", "cc", "approvers"].includes(processType)
      ) {
        return {
          success: false,
          message: `Invalid process type: ${processType}`,
          timestamp: new Date(),
        };
      }

      // Validate current state structure
      if (!currentState || typeof currentState !== "object") {
        return {
          success: false,
          message: "Invalid current state structure",
          timestamp: new Date(),
        };
      }

      // Validate dependencies
      if (
        !dependencies ||
        !dependencies.stages ||
        !dependencies.groups ||
        !dependencies.users
      ) {
        return {
          success: false,
          message: "Missing required dependencies",
          timestamp: new Date(),
        };
      }

      // Validate handleStateUpdate function
      if (typeof handleStateUpdate !== "function") {
        return {
          success: false,
          message: "handleStateUpdate is not a function",
          timestamp: new Date(),
        };
      }

      // Test state update functionality
      const testState: TemplateProcessProps = {
        process_type: processType,
        stage: null,
        group: null,
        department: null,
        staff: null,
        is_approving: { label: "No", value: 0 },
        permissions: "rw",
      };

      try {
        handleStateUpdate(testState, processType);
      } catch (error) {
        return {
          success: false,
          message: `State update test failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        message: "useProcessState validation successful",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Validation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date(),
      };
    }
  }

  // Validate DocumentProcessFlow performance
  validateDocumentProcessFlowPerformance(
    renderTime: number,
    tabSwitchTime: number
  ): ValidationResult {
    try {
      const performanceIssues: string[] = [];

      // Check render performance (should be under 100ms for good UX)
      if (renderTime > 100) {
        performanceIssues.push(`Slow render: ${renderTime}ms (target: <100ms)`);
      }

      // Check tab switch performance (should be under 50ms for smooth UX)
      if (tabSwitchTime > 50) {
        performanceIssues.push(
          `Slow tab switch: ${tabSwitchTime}ms (target: <50ms)`
        );
      }

      if (performanceIssues.length > 0) {
        return {
          success: false,
          message: "Performance issues detected",
          details: performanceIssues,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        message: "Performance validation passed",
        details: {
          renderTime: `${renderTime}ms`,
          tabSwitchTime: `${tabSwitchTime}ms`,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Performance validation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date(),
      };
    }
  }

  // Validate error handling and recovery
  validateErrorHandling(
    errorState: any,
    recoveryAttempts: number
  ): ValidationResult {
    try {
      // Check if error state is properly managed
      if (
        errorState &&
        typeof errorState !== "string" &&
        typeof errorState !== "object"
      ) {
        return {
          success: false,
          message: "Invalid error state format",
          timestamp: new Date(),
        };
      }

      // Validate recovery attempts
      if (recoveryAttempts < 0) {
        return {
          success: false,
          message: "Invalid recovery attempts count",
          timestamp: new Date(),
        };
      }

      // Check if errors are being cleared properly
      if (errorState && recoveryAttempts > 3) {
        return {
          success: false,
          message: "Error recovery taking too long",
          details: {
            errorState,
            recoveryAttempts,
          },
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        message: "Error handling validation passed",
        details: {
          errorState: errorState || "No errors",
          recoveryAttempts,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error handling validation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date(),
      };
    }
  }

  // Run comprehensive validation suite
  runComprehensiveValidation(
    contentBuilderState: any,
    documentGeneratorState: any,
    processStateData: any,
    performanceMetrics: any
  ): ComponentValidation[] {
    this.validationResults = [];

    // Validate ContentBuilder
    const contentBuilderValidation: ComponentValidation = {
      componentName: "ContentBuilder",
      results: [],
      overallSuccess: true,
    };

    // Validate DocumentGenerator
    const documentGeneratorValidation: ComponentValidation = {
      componentName: "DocumentGenerator",
      results: [],
      overallSuccess: true,
    };

    // Validate DocumentProcessFlow
    const documentProcessFlowValidation: ComponentValidation = {
      componentName: "DocumentProcessFlow",
      results: [],
      overallSuccess: true,
    };

    // Validate useProcessState
    const useProcessStateValidation: ComponentValidation = {
      componentName: "useProcessState",
      results: [],
      overallSuccess: true,
    };

    // Run validations
    const stateSyncResult = this.validateStateSynchronization(
      contentBuilderState,
      documentGeneratorState
    );
    contentBuilderValidation.results.push(stateSyncResult);
    documentGeneratorValidation.results.push(stateSyncResult);

    if (!stateSyncResult.success) {
      contentBuilderValidation.overallSuccess = false;
      documentGeneratorValidation.overallSuccess = false;
    }

    // Validate process state
    if (processStateData) {
      const processStateResult = this.validateUseProcessState(
        processStateData.processType,
        processStateData.currentState,
        processStateData.dependencies,
        processStateData.handleStateUpdate
      );
      useProcessStateValidation.results.push(processStateResult);
      if (!processStateResult.success) {
        useProcessStateValidation.overallSuccess = false;
      }
    }

    // Validate performance
    if (performanceMetrics) {
      const performanceResult = this.validateDocumentProcessFlowPerformance(
        performanceMetrics.renderTime || 0,
        performanceMetrics.tabSwitchTime || 0
      );
      documentProcessFlowValidation.results.push(performanceResult);
      if (!performanceResult.success) {
        documentProcessFlowValidation.overallSuccess = false;
      }
    }

    // Add all validations to results
    this.validationResults.push(
      contentBuilderValidation,
      documentGeneratorValidation,
      documentProcessFlowValidation,
      useProcessStateValidation
    );

    return this.validationResults;
  }

  // Get validation summary
  getValidationSummary(): {
    totalComponents: number;
    successfulComponents: number;
    failedComponents: number;
    overallSuccess: boolean;
  } {
    const totalComponents = this.validationResults.length;
    const successfulComponents = this.validationResults.filter(
      (validation) => validation.overallSuccess
    ).length;
    const failedComponents = totalComponents - successfulComponents;
    const overallSuccess = failedComponents === 0;

    return {
      totalComponents,
      successfulComponents,
      failedComponents,
      overallSuccess,
    };
  }

  // Export validation results
  exportValidationResults(): string {
    const summary = this.getValidationSummary();
    const timestamp = new Date().toISOString();

    let report = `# Refactor Validation Report\n`;
    report += `Generated: ${timestamp}\n\n`;
    report += `## Summary\n`;
    report += `- Total Components: ${summary.totalComponents}\n`;
    report += `- Successful: ${summary.successfulComponents}\n`;
    report += `- Failed: ${summary.failedComponents}\n`;
    report += `- Overall Status: ${
      summary.overallSuccess ? "✅ PASSED" : "❌ FAILED"
    }\n\n`;

    report += `## Detailed Results\n\n`;

    this.validationResults.forEach((validation) => {
      report += `### ${validation.componentName}\n`;
      report += `Status: ${
        validation.overallSuccess ? "✅ PASSED" : "❌ FAILED"
      }\n\n`;

      validation.results.forEach((result) => {
        report += `- **${result.success ? "✅" : "❌"} ${result.message}**\n`;
        if (result.details) {
          report += `  - Details: ${JSON.stringify(result.details, null, 2)}\n`;
        }
        report += `  - Timestamp: ${result.timestamp.toISOString()}\n\n`;
      });
    });

    return report;
  }
}

export default RefactorValidation;
