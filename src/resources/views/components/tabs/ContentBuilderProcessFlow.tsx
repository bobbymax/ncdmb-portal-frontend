import React from "react";
import { ProcessTabsOption } from "resources/views/crud/ContentBuilder";
import { ConfigState } from "@/app/Hooks/useTemplateHeader";
import BaseProcessFlow from "./BaseProcessFlow";
import ProcessFlowContent from "./ProcessFlowContent";
import { TemplateBoardProvider } from "app/Context/TemplateBoardProvider";

interface ContentBuilderProcessFlowProps {
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

const ContentBuilderProcessFlow: React.FC<ContentBuilderProcessFlowProps> = (
  props
) => {
  return (
    <TemplateBoardProvider>
      <BaseProcessFlow {...props} />
    </TemplateBoardProvider>
  );
};

export default ContentBuilderProcessFlow;
