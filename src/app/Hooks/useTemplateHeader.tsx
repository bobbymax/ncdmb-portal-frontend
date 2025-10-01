import { useCallback } from "react";
import { TemplateResponseData } from "app/Repositories/Template/data";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import {
  InternalMemoHeader,
  ResourceHeader,
  WhiteFormHeader,
} from "resources/templates/headers";
import moment from "moment";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";

export type ProcessType = "from" | "to" | "through" | "cc" | "approvers";

export type ProcessStateMap = {
  from: TemplateProcessProps;
  to: TemplateProcessProps;
  through: TemplateProcessProps;
  cc: TemplateProcessProps[];
  approvers: TemplateProcessProps[];
};

export type ConfigState = {
  [K in ProcessType]: {
    key: K;
    state: ProcessStateMap[K];
  };
};

export interface HeaderProps {
  code?: string | null;
  configState: ProcessFlowConfigProps | null;
  tagline?: string | null;
  title?: string | null;
  date?: string | null;
  ref?: string | null;
}

/**
 * Custom hook for generating template headers based on template type and configuration
 * @param template - The template data containing header configuration
 * @returns A function that generates the appropriate header component
 */
export const useTemplateHeader = (
  template: TemplateResponseData | null | undefined
) => {
  return useCallback(
    (params: HeaderProps) => {
      const { code, configState, tagline, title, date, ref } = params;
      const header = template?.header;

      switch (header) {
        case "banner":
          return null;
        case "white-form":
          return (
            <WhiteFormHeader code={code} tagline={tagline} title={title} />
          );
        case "resource":
          return <ResourceHeader configState={configState} />;
        default:
          return (
            <InternalMemoHeader
              to={configState?.to ?? null}
              from={configState?.from ?? null}
              through={configState?.through ?? null}
              ref={code ?? null}
              date={moment().format()}
              title={title ?? null}
            />
          );
      }
    },
    [template]
  );
};
