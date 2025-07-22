import {
  TemplateProcessProps,
  TemplateResponseData,
} from "app/Repositories/Template/data";
import TemplateRepository from "app/Repositories/Template/TemplateRepository";
import { BuilderComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { UserResponseData } from "app/Repositories/User/data";
import Button from "../components/forms/Button";
import Alert from "app/Support/Alert";
import { useStateContext } from "app/Context/ContentContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BlockNavigationBar from "./BlockNavigationBar";

export type ProcessType = "from" | "to" | "through" | "cc";
export type ProcessTypeDependencies = {
  stages: WorkflowStageResponseData[];
  groups: GroupResponseData[];
  users: UserResponseData[];
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
  cc: React.FC<TabConfigContentProps<"cc", TemplateProcessProps[]>>;
};

type ProcessTabsOption = {
  value: ProcessType;
  icon: string;
  default: boolean;
  label: string;
  TabContent: React.FC<any>;
};

type ProcessStateMap = {
  from: TemplateProcessProps;
  to: TemplateProcessProps;
  through: TemplateProcessProps;
  cc: TemplateProcessProps[];
};

export type ConfigState = {
  [K in ProcessType]: {
    key: K;
    state: ProcessStateMap[K];
  };
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
  const navigate = useNavigate();
  const { setIsLoading } = useStateContext();
  const { collection: stages } = useDirectories(
    repo("workflow_stage"),
    "workflowStages"
  );
  const { collection: groups } = useDirectories(repo("group"), "groups");
  const { collection: staff } = useDirectories(repo("user"), "users");
  const [configState, setConfigState] = useState<ConfigState>({
    from: { key: "from", state: {} as TemplateProcessProps },
    to: { key: "to", state: {} as TemplateProcessProps },
    through: { key: "through", state: {} as TemplateProcessProps },
    cc: { key: "cc", state: [] },
  });
  const {
    blocks,
    activeBlockId,
    contents,
    setContents,
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
  const buildTemplate = useCallback(
    (data: TemplateResponseData) => {
      Alert.flash(
        "Are your sure!!",
        "info",
        "Trust all content blocks are in place?"
      ).then(async (res) => {
        if (res.isConfirmed) {
          setIsLoading(true);
          const result = await repository.update("templates", data.id, data);

          if (result) {
            toast.success(result?.message);
            navigate("/intelligence/templates");
          }

          setIsLoading(false);
        }
      });
    },
    [repository]
  );

  useEffect(() => {
    if (setState) {
      setState((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          subject: "",
          process: configState,
        },
        body: contents,
      }));
    }
  }, [contents, configState]);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if ((state.body ?? [])?.length > 0) {
      setContents(state.body ?? []);

      const incoming = state.config?.process;
      if (incoming) {
        setConfigState((prev) => {
          const merged = { ...prev };

          (Object.keys(incoming) as ProcessType[]).forEach((key) => {
            const entry = incoming[key];
            if (!entry?.state) return;

            switch (key) {
              case "from": {
                const fromKey = "from" as const;
                merged[fromKey] = entry as ConfigState[typeof fromKey];
                break;
              }
              case "to": {
                const toKey = "to" as const;
                merged[toKey] = entry as ConfigState[typeof toKey];
                break;
              }
              case "through": {
                const throughKey = "through" as const;
                merged[throughKey] = entry as ConfigState[typeof throughKey];
                break;
              }
              case "cc": {
                const ccKey = "cc" as const;
                merged[ccKey] = entry as ConfigState[typeof ccKey];
                break;
              }
            }
          });

          return merged;
        });
      }

      initialized.current = true;
    }
  }, [state.config, state.body]);

  return (
    <div className="row mt-4">
      <div className="col-md-7 mb-3">
        <div className="custom-card file__card desk__office">
          <div className="row">
            <div className="col-md-12 mb-3">
              <div className="block__navigation mb-3">
                <BlockNavigationBar
                  blocks={blocks}
                  handleAddToSheet={handleAddToSheet}
                />
              </div>
            </div>
            <div className="col-md-12 mb-3">
              {/* Page Component */}
              <div className="template__page">
                <InternalMemoHeader
                  to={
                    state.config?.process?.to
                      ? state.config.process.to.state
                      : null
                  }
                  from={
                    state.config?.process?.from
                      ? state.config.process.from.state
                      : null
                  }
                  through={
                    state.config?.process?.through
                      ? state.config.process.through.state
                      : null
                  }
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
                          updatedState:
                            | TemplateProcessProps
                            | TemplateProcessProps[],
                          key: ProcessType
                        ) => {
                          setConfigState((prev) => ({
                            ...prev,
                            [key]: {
                              key,
                              state:
                                updatedState as ProcessStateMap[typeof key], // TS-safe
                            },
                          }));
                        }}
                        dependencies={{
                          stages: stages as WorkflowStageResponseData[],
                          groups: groups as GroupResponseData[],
                          users: staff as UserResponseData[],
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="block__content__area mb-3">
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
                  resource={null}
                />
              ))
            ) : (
              <p>Empty</p>
            )}
          </div>

          <div className="form__submit mt-5 flex align gap-md">
            <Button
              label="Build Template"
              handleClick={() => buildTemplate(state)}
              icon="ri-webhook-line"
              size="md"
              variant="success"
              isDisabled={contents.length < 1 || !configState}
            />
            <Button
              label="Reset State"
              handleClick={() => {}}
              icon="ri-refresh-line"
              size="md"
              variant="danger"
              isDisabled
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentBuilder;
