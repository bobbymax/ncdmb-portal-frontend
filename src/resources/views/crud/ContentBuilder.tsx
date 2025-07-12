import {
  TemplateProcessProps,
  TemplateResponseData,
} from "app/Repositories/Template/data";
import TemplateRepository from "app/Repositories/Template/TemplateRepository";
import { BuilderComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import {
  BlockBuilderCard,
  InternalMemoHeader,
} from "resources/templates/headers";
import ContentBlock from "./templates/blocks/ContentBlock";
import useBuilder from "app/Hooks/useBuilder";
import TemplateBuilderView from "./templates/builders/TemplateBuilderView";

import sent_to from "../../assets/images/processes/sent_through.png";
import sent_from from "../../assets/images/processes/sent_to.png";
import sent_through from "../../assets/images/processes/forward.png";
import sent_cc from "../../assets/images/processes/cc.png";
import CCStaffComponent, {
  CCProcessProps,
} from "./templates/tabs/CCStaffComponent";
import FromStaffTabComponent from "./templates/tabs/FromStaffTabComponent";
import ToStaffTabComponent from "./templates/tabs/ToStaffTabComponent";
import ThroughStaffComponent from "./templates/tabs/ThroughStaffComponent";
import useDirectories from "app/Hooks/useDirectories";
import { repo } from "bootstrap/repositories";
import { UserResponseData } from "app/Repositories/User/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { DepartmentResponseData } from "app/Repositories/Department/data";

type ProcessType = "from" | "to" | "through" | "cc";
export type ProcessTypeDependencies = {
  users: UserResponseData[];
  groups: GroupResponseData[];
  departments: DepartmentResponseData[];
};

export interface TabConfigContentProps<K extends ProcessType, S> {
  value: K;
  icon: string;
  default: boolean;
  data?: S | S[] | null;
  label: string;
  handleStateUpdate: (state: S | S[], value: K) => void;
  dependencies?: ProcessTypeDependencies;
}

type ProcessComponentMap = {
  from: React.FC<TabConfigContentProps<"from", TemplateProcessProps>>;
  to: React.FC<TabConfigContentProps<"to", TemplateProcessProps>>;
  through: React.FC<TabConfigContentProps<"through", TemplateProcessProps>>;
  cc: React.FC<TabConfigContentProps<"cc", CCProcessProps>>;
};

type ProcessTabsOption = {
  value: ProcessType;
  icon: string;
  default: boolean;
  label: string;
  TabContent: React.FC<any>;
};

// Declare the generic component properly
const ContentBuilder: React.FC<
  BuilderComponentProps<TemplateResponseData, TemplateRepository>
> = ({
  repo: repository,
  resource: template,
  state,
  setState,
}): React.ReactElement => {
  const { collection: users } = useDirectories(repo("user"), "users");
  const { collection: departments } = useDirectories(
    repo("department"),
    "departments"
  );
  const { collection: groups } = useDirectories(repo("group"), "groups");
  const {
    blocks,
    activeBlockId,
    contents,
    handleAddToSheet,
    handleCollapseBlock,
    handleRemoveFromSheet,
    handleResolve,
  } = useBuilder(template);
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

  const [activeTab, setActiveTab] = useState<ProcessTabsOption>(
    () =>
      processTypeOptions.find((option) => option.default) ||
      processTypeOptions[0]
  );

  // const TabContent =

  useEffect(() => {
    if (setState) {
      setState((prev) => ({
        ...prev,
        body: contents,
      }));
    }
  }, [contents]);

  console.log(state);

  return (
    <div className="row mt-4">
      <div className="col-md-7 mb-3">
        <div className="custom-card file__card desk__office">
          <div className="row">
            <div className="col-md-12 mb-5">
              <div className="glossy-panel flex align gap-xl">
                {blocks.map((block) => (
                  <BlockBuilderCard
                    key={block.id}
                    raw={block}
                    addToSheet={handleAddToSheet}
                  />
                ))}
              </div>
            </div>
            <div className="col-md-12 mb-3">
              {/* Page Component */}
              <div className="template__page">
                <InternalMemoHeader
                  to={null}
                  from={null}
                  through={null}
                  ref={null}
                  date={null}
                  title={null}
                />
                {/* Block Content Area */}
                {/* The Template should be here!!! */}
                <div className="block__placeholders">
                  <TemplateBuilderView contents={contents} />
                </div>
                {/* End Block Content Area */}
              </div>
              {/* End Page Component */}
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-5 mb-3">
        <div className="custom-card file__card desk__office">
          <div className="config__section">
            <h4 className="mb-3">Configuration</h4>

            <div className="config__tab__section">
              <div className="config__tab__header flex align mt-4">
                {processTypeOptions.map((option, idx) => (
                  <div
                    className={`tab__section__item flex column gap-md align center ${
                      activeTab.value === option.value ? "active" : ""
                    }`}
                    key={idx}
                    onClick={() => setActiveTab(option)}
                  >
                    <img src={option.icon} alt={option.label} />
                    <p
                      style={{
                        letterSpacing: 1.3,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {option.label}:
                    </p>
                  </div>
                ))}
              </div>
              <div className="config__tab__content">
                {processTypeOptions.map((option, idx) => {
                  const ActiveComponent = option.TabContent;
                  return (
                    <div
                      className="tab__smallest__layer"
                      style={{
                        display:
                          activeTab.value === option.value ? "block" : "none",
                      }}
                      key={idx}
                    >
                      <ActiveComponent
                        value={activeTab.value}
                        icon={activeTab.icon}
                        label={activeTab.label}
                        default={activeTab.default}
                        data={null}
                        handleStateUpdate={(
                          updatedState: TemplateProcessProps | CCProcessProps,
                          key: ProcessType
                        ) => {
                          console.log("Update state", updatedState, key);
                        }}
                        dependencies={{
                          users: users as UserResponseData[],
                          groups: groups as GroupResponseData[],
                          departments: departments as DepartmentResponseData[],
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="block__content__area">
            {contents.length > 0 ? (
              contents.map((memoBlock) => (
                <ContentBlock
                  repo={repository}
                  key={memoBlock.id}
                  block={memoBlock}
                  active={activeBlockId === memoBlock.id}
                  resolve={handleResolve}
                  remove={handleRemoveFromSheet}
                  collapse={handleCollapseBlock}
                />
              ))
            ) : (
              <p>Empty</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentBuilder;
