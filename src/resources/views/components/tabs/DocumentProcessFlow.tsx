import React from "react";
import { ProcessTabsOption } from "resources/views/crud/ContentBuilder";
import { ConfigState } from "@/app/Hooks/useTemplateHeader";
import ContentBuilderProcessFlow from "./ContentBuilderProcessFlow";
import DocumentConfiguratorProcessFlow from "./DocumentConfiguratorProcessFlow";
import { ProcessFlowProvider } from "app/Context/ProcessFlowContext";

type ProcessType = "from" | "to" | "through" | "cc" | "approvers";

interface DocumentProcessFlowProps {
  processTypeOptions: ProcessTabsOption[];
  activeTab: ProcessTabsOption;
  configState: ConfigState;
  setConfigState: (state: ConfigState) => void;
  setActiveTab: (tab: ProcessTabsOption) => void;
  isDisplay?: boolean;
  onStateUpdate?: (key: ProcessType, state: any) => void;
}

const DocumentProcessFlow: React.FC<DocumentProcessFlowProps> = (props) => {
  // Auto-detect context based on props and usage patterns

  // Check if this is ContentBuilder context
  // ContentBuilder typically has processTypeOptions, activeTab, and complex state management
  const isContentBuilderContext = React.useMemo(() => {
    return (
      props.processTypeOptions &&
      props.activeTab &&
      props.configState &&
      // ContentBuilder usually doesn't have onStateUpdate (it uses setConfigState directly)
      props.onStateUpdate === undefined
    );
  }, [
    props.processTypeOptions,
    props.activeTab,
    props.configState,
    props.onStateUpdate,
  ]);

  // Check if this is DocumentConfigurator context
  // DocumentConfigurator typically has onStateUpdate and simpler state management
  const isDocumentConfiguratorContext = React.useMemo(() => {
    return (
      props.processTypeOptions &&
      props.activeTab &&
      props.configState &&
      // DocumentConfigurator usually has onStateUpdate
      props.onStateUpdate !== undefined
    );
  }, [
    props.processTypeOptions,
    props.activeTab,
    props.configState,
    props.onStateUpdate,
  ]);

  // Wrap with ProcessFlowProvider for global state management
  const renderContent = () => {
    if (isContentBuilderContext) {
      return <ContentBuilderProcessFlow {...props} />;
    }

    if (isDocumentConfiguratorContext) {
      return <DocumentConfiguratorProcessFlow {...props} />;
    }

    // Fallback to DocumentConfigurator for backward compatibility
    console.warn(
      "DocumentProcessFlow: Context not detected, falling back to DocumentConfigurator mode"
    );
    return <DocumentConfiguratorProcessFlow {...props} />;
  };

  return (
    <ProcessFlowProvider initialState={props.configState}>
      {renderContent()}
    </ProcessFlowProvider>
  );
};

export default React.memo(DocumentProcessFlow);
