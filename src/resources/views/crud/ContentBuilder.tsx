import {
  TemplateProcessProps,
  TemplateResponseData,
} from "app/Repositories/Template/data";
import TemplateRepository from "app/Repositories/Template/TemplateRepository";
import { BuilderComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { InternalMemoHeader } from "resources/templates/headers";
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
  isDisplay?: boolean;
}

export type ProcessComponentMap = {
  from: React.FC<TabConfigContentProps<"from", TemplateProcessProps>>;
  to: React.FC<TabConfigContentProps<"to", TemplateProcessProps>>;
  through: React.FC<TabConfigContentProps<"through", TemplateProcessProps>>;
  cc: React.FC<TabConfigContentProps<"cc", TemplateProcessProps[]>>;
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
  const { processTypeOptions } = useProcessFlowTypes();
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

  console.log(template);

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
                  to={configState.to.state}
                  from={configState.from.state}
                  through={configState.through.state}
                  ref={null}
                  date={null}
                  title={null}
                />
                {/* Block Content Area */}
                {/* The Template should be here!!! */}
                <div className="block__placeholders">
                  <TemplateBuilderView
                    contents={contents}
                    modify={() => {}}
                    editor
                    configState={configState}
                  />
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
            configState={configState}
            setConfigState={setConfigState}
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
                  configState={configState}
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
