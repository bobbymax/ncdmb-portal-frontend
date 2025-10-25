import React, { useMemo } from "react";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { PaperBoardContext } from "app/Context/PaperBoardContext";
import { usePaperBoard } from "app/Context/PaperBoardContext";

interface LinkedPageContextWrapperProps {
  page: DocumentResponseData;
  children: React.ReactNode;
}

/**
 * This component wraps each linked page with its own isolated context
 * to prevent content cards from accessing the main document's global state
 */
const LinkedPageContextWrapper: React.FC<LinkedPageContextWrapperProps> = ({
  page,
  children,
}) => {
  const parentContext = usePaperBoard();

  // Create an isolated state for this linked page
  const isolatedState = useMemo(() => {
    return {
      ...parentContext.state,
      // Override with the linked page's data
      existingDocument: page,
      category: page.document_category,
      template: page.document_category?.template || null,
      body: page.contents || [],
      configState: page.config || null,
      documentState: page,
      metaData: page.meta_data || null,
      preferences: page.preferences || parentContext.state.preferences,
      watchers: page.watchers || [],
      threads: page.threads || [],
      uploads: [], // Linked pages don't need uploads in context
      requirements: [],
      // Keep the parent's logged in user
      loggedInUser: parentContext.state.loggedInUser,
    };
  }, [page, parentContext.state]);

  // No-op actions for read-only mode
  const isolatedActions = useMemo(() => {
    return {
      ...parentContext.actions,
      // Override with no-op functions for read-only
      setBody: () => {},
      updateBody: () => {},
      setConfigState: () => {},
      updateConfigState: () => {},
      setDocumentState: () => {},
      setCategory: () => {},
      setTemplate: () => {},
    };
  }, [parentContext.actions]);

  const contextValue = useMemo(
    () => ({
      state: isolatedState,
      actions: isolatedActions,
    }),
    [isolatedState, isolatedActions]
  );

  return (
    <PaperBoardContext.Provider value={contextValue}>
      {children}
    </PaperBoardContext.Provider>
  );
};

export default LinkedPageContextWrapper;
