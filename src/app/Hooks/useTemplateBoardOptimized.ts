import { useMemo } from "react";
import { useTemplateBoard } from "../Context/TemplateBoardContext";
import { ContentAreaProps } from "./useBuilder";
import { BlockDataType } from "@/app/Repositories/Block/data";

/**
 * Performance-optimized hook for TemplateBoardContext
 * Provides memoized selectors to prevent unnecessary re-renders
 */
export const useTemplateBoardOptimized = () => {
  const { state, actions } = useTemplateBoard();

  // Memoized selectors for better performance
  const selectors = useMemo(
    () => ({
      // Content selectors
      getContentById: (id: string) =>
        state.contents.find((content) => content.id === id),
      getContentsByType: (type: BlockDataType) =>
        state.contents.filter((content) => content.type === type),
      getContentCount: () => state.contents.length,

      // Config selectors
      getConfigByKey: (key: string) =>
        state.configState[key as keyof typeof state.configState],
      getFromConfig: () => state.configState.from,
      getToConfig: () => state.configState.to,
      getThroughConfig: () => state.configState.through,

      // Document state selectors
      getDocumentField: (field: keyof typeof state.documentState) =>
        state.documentState[field],
      getDocumentTitle: () => state.documentState.title,

      // Resource selectors
      getResourceField: (field: string) => (state.resource as any)?.[field],
      getClaimState: () => (state.resource as any)?.claimState,

      // Validation selectors
      getValidationErrors: () => state.errors,
      getIsValid: () => state.isValid,

      // Generation selectors
      getGenerationProgress: () => state.loadingProgress,
      getGenerationStep: () => state.loadingStep,
      getIsGenerating: () => state.isGenerating,
    }),
    [state]
  );

  // Memoized computed values
  const computed = useMemo(
    () => ({
      // Computed content values
      hasContents: state.contents.length > 0,
      contentTypes: [...new Set(state.contents.map((c) => c.type))],
      totalContentBlocks: state.contents.length,

      // Computed config values
      hasValidConfig: Object.keys(state.configState).length > 0,
      configKeys: Object.keys(state.configState),

      // Computed document values
      hasDocumentTitle: !!state.documentState.title,
      documentFields: Object.keys(state.documentState),

      // Computed resource values
      hasResource: !!state.resource,
      resourceType: state.resource ? typeof state.resource : null,

      // Computed validation values
      errorCount: state.errors.length,
      hasErrors: state.errors.length > 0,

      // Computed generation values
      isGenerating: state.isGenerating,
      hasProgress: state.loadingProgress > 0,
    }),
    [state]
  );

  return {
    state,
    actions,
    selectors,
    computed,
  };
};

/**
 * Hook for accessing specific content by ID with memoization
 */
export const useContentById = (id: string) => {
  const { state } = useTemplateBoard();

  return useMemo(
    () => state.contents.find((content) => content.id === id),
    [state.contents, id]
  );
};

/**
 * Hook for accessing contents by type with memoization
 */
export const useContentsByType = (type: BlockDataType) => {
  const { state } = useTemplateBoard();

  return useMemo(
    () => state.contents.filter((content) => content.type === type),
    [state.contents, type]
  );
};

/**
 * Hook for accessing config state by key with memoization
 */
export const useConfigByKey = (key: string) => {
  const { state } = useTemplateBoard();

  return useMemo(
    () => state.configState[key as keyof typeof state.configState],
    [state.configState, key]
  );
};
