import {
  ProcessComponentMap,
  ProcessTabsOption,
  ProcessType,
} from "resources/views/crud/ContentBuilder";
import CCStaffComponent from "resources/views/crud/templates/tabs/CCStaffComponent";
import FromStaffTabComponent from "resources/views/crud/templates/tabs/FromStaffTabComponent";
import ThroughStaffComponent from "resources/views/crud/templates/tabs/ThroughStaffComponent";
import ToStaffTabComponent from "resources/views/crud/templates/tabs/ToStaffTabComponent";
import sent_from from "resources/assets/images/processes/forward.png";
import sent_to from "resources/assets/images/processes/sent_to.png";
import sent_through from "resources/assets/images/processes/forward.png";
import sent_cc from "resources/assets/images/processes/cc.png";

const useProcessFlowTypes = () => {
  const processTypes = ["from", "to", "through", "cc"] as const;
  const processIcons: Record<ProcessType, string> = {
    from: sent_from,
    to: sent_to,
    through: sent_through,
    cc: sent_cc,
  };
  const processComponents: ProcessComponentMap = {
    from: FromStaffTabComponent,
    to: ToStaffTabComponent,
    through: ThroughStaffComponent,
    cc: CCStaffComponent,
  };
  const processTypeOptions: ProcessTabsOption[] = processTypes.map((type) => ({
    value: type,
    icon: processIcons[type],
    TabContent: processComponents[type],
    default: type === "from",
    label: type.charAt(0).toUpperCase() + type.slice(1),
  }));

  return {
    processTypes,
    processIcons,
    processComponents,
    processTypeOptions,
  };
};

export default useProcessFlowTypes;
