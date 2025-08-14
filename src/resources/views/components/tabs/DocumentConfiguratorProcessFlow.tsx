import React from "react";
import { ProcessTabsOption } from "resources/views/crud/ContentBuilder";
import { ConfigState } from "@/app/Hooks/useTemplateHeader";
import BaseProcessFlow from "./BaseProcessFlow";
import ProcessFlowContent from "./ProcessFlowContent";

interface DocumentConfiguratorProcessFlowProps {
  processTypeOptions: ProcessTabsOption[];
  activeTab: ProcessTabsOption;
  configState: ConfigState;
  setConfigState: (state: ConfigState) => void;
  setActiveTab: (tab: ProcessTabsOption) => void;
  isDisplay?: boolean;
  onStateUpdate?: (
    key: "from" | "to" | "through" | "cc" | "approvers",
    state: any
  ) => void;
}

const DocumentConfiguratorProcessFlow: React.FC<
  DocumentConfiguratorProcessFlowProps
> = (props) => {
  return <BaseProcessFlow {...props} />;
};

export default DocumentConfiguratorProcessFlow;
