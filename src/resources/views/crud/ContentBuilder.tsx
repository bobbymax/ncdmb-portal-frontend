import {
  TemplateProcessProps,
  TemplateResponseData,
} from "app/Repositories/Template/data";
import TemplateRepository from "app/Repositories/Template/TemplateRepository";
import { BuilderComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ContentBlock from "./templates/blocks/ContentBlock";
import useBuilder from "app/Hooks/useBuilder";
import TemplateBuilderView from "./templates/builders/TemplateBuilderView";
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
import DocumentProcessFlow from "../components/tabs/DocumentProcessFlow";
import useProcessFlowTypes from "app/Hooks/useProcessFlowTypes";
import { BaseResponse } from "@/app/Repositories/BaseRepository";
import {
  useTemplateHeader,
  ConfigState,
  HeaderProps,
} from "app/Hooks/useTemplateHeader";
import TemplateBoardErrorBoundary from "app/Context/TemplateBoardErrorBoundary";
import { TemplateBoardProvider } from "app/Context/TemplateBoardProvider";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";

export type ProcessType = "from" | "to" | "through" | "cc" | "approvers";
export type ProcessTypeDependencies = {
  stages: WorkflowStageResponseData[];
  groups: GroupResponseData[];
  users: UserResponseData[];
};
export interface TabConfigContentProps<K extends ProcessType, S> {
  value: K;
  icon: string;
  default: boolean;
  configState: ConfigState;
  data?: S | S[] | null;
  label: string;
  handleStateUpdate: (state: S | S[], value: K) => void;
  dependencies?: ProcessTypeDependencies;
  isDisplay?: boolean;
}

export type ProcessComponentMap = {
  from: React.FC<TabConfigContentProps<"from", TemplateProcessProps>>;
  to: React.FC<TabConfigContentProps<"to", TemplateProcessProps>>;
  through: React.FC<TabConfigContentProps<"through", TemplateProcessProps>>;
  cc: React.FC<TabConfigContentProps<"cc", TemplateProcessProps[]>>;
  approvers: React.FC<
    TabConfigContentProps<"approvers", TemplateProcessProps[]>
  >;
};

export type ProcessTabsOption = {
  value: ProcessType;
  icon: string;
  default: boolean;
  label: string;
  TabContent: React.FC<any>;
};

export type ProcessStateMap = {
  from: TemplateProcessProps;
  to: TemplateProcessProps;
  through: TemplateProcessProps;
  cc: TemplateProcessProps[];
  approvers: TemplateProcessProps[];
};

// Declare the generic component properly
const ContentBuilder: React.FC<
  BuilderComponentProps<TemplateResponseData, TemplateRepository>
> = ({
  repo: repository,
  resource: template,
  state,
  setState,
  generatedData,
}): React.ReactElement => {
  const navigate = useNavigate();
  const { setIsLoading } = useStateContext();
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
  const { processTypeOptions } = useProcessFlowTypes();
  const [activeTab, setActiveTab] = useState<ProcessTabsOption>(
    () =>
      processTypeOptions.find((option) => option.default) ||
      processTypeOptions[0]
  );

  const getTemplateHeader = useTemplateHeader(template);

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

  // Inner component that uses the context after provider is rendered
  const ContentBuilderInner = () => {
    const { state: contextState, actions } = useTemplateBoard();

    // Initialize content and config state from template data
    const initialized = useRef(false);

    useEffect(() => {
      if (initialized.current) return;

      if ((state.body ?? [])?.length > 0) {
        // Update context contents
        actions.reorderContents(state.body ?? []);

        const incoming = state.config?.process;
        if (incoming) {
          // Update context config state
          actions.updateConfigState(incoming);
        }

        initialized.current = true;
      }
    }, [state.config, state.body, actions]);

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
                  {getTemplateHeader({
                    configState: contextState.configState,
                  })}
                  {/* Block Content Area */}
                  {/* The Template should be here!!! */}
                  <div className="block__placeholders">
                    <TemplateBuilderView resource={null} editor />
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
            <DocumentProcessFlow
              processTypeOptions={processTypeOptions}
              activeTab={activeTab}
              configState={contextState.configState}
              setConfigState={(newConfig) => {
                actions.updateConfigState(newConfig);
              }}
              setActiveTab={setActiveTab}
            />

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
                    configState={contextState.configState}
                  />
                ))
              ) : (
                <p>Empty</p>
              )}
            </div>

            <div className="form__submit mt-5 flex align gap-md">
              <Button
                label="Build Template"
                handleClick={() => {
                  // Merge the original state with updated context state
                  const mergedState = {
                    ...state,
                    config: {
                      ...state.config,
                      process: contextState.configState,
                      subject: state.config?.subject || "", // Ensure subject is always a string
                    },
                  };
                  buildTemplate(mergedState);
                }}
                icon="ri-webhook-line"
                size="md"
                variant="success"
                isDisabled={contents.length < 1 || !contextState.configState}
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

  return (
    <TemplateBoardErrorBoundary>
      <TemplateBoardProvider>
        <ContentBuilderInner />
      </TemplateBoardProvider>
    </TemplateBoardErrorBoundary>
  );
};

export default ContentBuilder;
