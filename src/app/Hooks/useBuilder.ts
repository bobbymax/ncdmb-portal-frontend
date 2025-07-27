import { BlockDataType, BlockResponseData } from "app/Repositories/Block/data";
import { TemplateResponseData } from "app/Repositories/Template/data";
import { useCallback, useEffect, useState } from "react";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { ResourcesList } from "resources/views/crud/templates/builders/DynamicTableBuilder";
import isEqual from "fast-deep-equal";
import { MilestoneResponseData } from "../Repositories/Milestone/data";
import { ProjectResponseData } from "../Repositories/Project/data";
import {
  InvoiceItemResponseData,
  InvoiceResponseData,
} from "../Repositories/Invoice/data";

export type InputFieldTypes =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "multi-select"
  | "checkbox"
  | "date"
  | "dateTime";

export type ResourceFilterTypes = "department" | "carder" | "none";
export type ResourceComputations = "estacode" | "remunerations" | "custom";
export type ResourceFetchType = "collection" | "resource" | "input";

export type TableContentAreaHeaderProps = {
  id: string;
  display_name: string;
  column: string;
  endpoint_column: string;
  value: string;
  format: "text" | "date" | "currency" | "name" | "number";
  currency?: "NGN" | "USD" | "EUR" | "GBP" | "NA";
  type: "list" | "sum" | "unit" | "total" | "grand-total" | "none";
  staff_current_location?: DataOptionsProps | null;
  input_field: InputFieldTypes;
  compute_column: string;
  placeholder: string;
  editable: boolean;
  computeable: boolean;
};

export type TableContentAreaRowProps = {
  identifier: string;
  [key: string]: string | number | boolean | unknown;
  isVisible: boolean;
  meta_data: unknown;
};

export type TableContentAreaProps = {
  filter: ResourceFilterTypes;
  compute: ResourceComputations;
  source: ResourcesList;
  type: ResourceFetchType;
  headers: TableContentAreaHeaderProps[];
  rows: TableContentAreaRowProps[];
};

export type EventContentAreaProps = {
  name: string;
  venue: string;
  start_date: string;
  end_date: string;
  start_time: string;
  address: string;
  location: string;
  type: "international" | "local";
  country: string;
  currency: "NGN" | "USD" | "EUR" | "GBP" | "NA";
  estacode: "NGN" | "USD" | "EUR" | "GBP" | "NA";
  source?: "vendors" | "custom";
  vendor_name?: string;
};

export type ParagraphContentAreaProps = {
  body: string;
};

export type CommentContentAreaProps = {
  user_id: number;
  staff_name: string;
  message: string;
  priority: "low" | "medium" | "high";
};

export type SignaturePadGroupProps = {
  group: DataOptionsProps | null;
  fallback_group: DataOptionsProps | null;
  approver: DataOptionsProps | null;
  department: DataOptionsProps | null;
  carder_id: number;
  approval_type:
    | "initiator"
    | "witness"
    | "attestation"
    | "approval"
    | "agreement";
  identifier: string;
  is_signed: boolean;
  can_override: boolean;
  make_comment: number;
  order: number;
  meta_data?: {
    [key: string]: unknown;
    signature?: string | null;
    date_signed?: string | null;
  };
};

export type SignatureContentAreaProps = {
  approvals: SignaturePadGroupProps[];
  max_signatures: number;
  style: "boxed" | "tabular" | "stacked" | "basic";
  originator_id: number;
  originator_name: string;
  originator_department_id: number;
};

export type MilestoneContentAreaProps = {
  milestones: MilestoneResponseData[];
  project?: ProjectResponseData | null;
};

export type InvoiceContentAreaProps = {
  invoice: InvoiceResponseData | null;
  project?: ProjectResponseData | null;
  items: InvoiceItemResponseData[];
  sub_total: number;
  total: number;
  vat: number;
  service_charge: number;
  markup: number;
  currency: "NGN" | "USD" | "EUR" | "GBP" | "NA";
};

export type OptionsContentAreaProps = {
  title: string;
  tagline: string;
  table?: TableContentAreaProps | undefined;
  event?: EventContentAreaProps | undefined;
  paragraph?: ParagraphContentAreaProps | undefined;
  approval?: SignatureContentAreaProps | undefined;
  milestone?: MilestoneContentAreaProps | undefined;
  invoice?: InvoiceContentAreaProps | undefined;
};

export interface ContentAreaProps {
  id: string;
  activeId: string | null;
  name: string;
  type: BlockDataType;
  isBeingEdited: boolean;
  block_id: number;
  isCollapsed: boolean;
  content?: OptionsContentAreaProps;
  comments?: CommentContentAreaProps[];
  source?: string;
  order: number;
}

const useBuilder = (template: TemplateResponseData | null | undefined) => {
  const [blocks, setBlocks] = useState<BlockResponseData[]>([]);

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [contents, setContents] = useState<ContentAreaProps[]>([]);

  const handleAddToSheet = useCallback(
    (block: BlockResponseData, type: BlockDataType) => {
      const blockComponent: ContentAreaProps | undefined = {
        id: crypto.randomUUID(),
        activeId: activeBlockId,
        type,
        isBeingEdited: false,
        isCollapsed: true,
        block_id: block.id,
        name: block.title,
        content: {} as OptionsContentAreaProps,
        order: contents.length + 1,
      };

      setActiveBlockId(blockComponent.id);

      setContents((prev) => [...prev, blockComponent]);
    },
    [blocks]
  );

  const handleResolve = (data: OptionsContentAreaProps, blockId: string) => {
    setContents((prev) =>
      prev.map((content) => {
        if (content.id === blockId) {
          return {
            ...content,
            content: data,
            isCollapsed: true,
            isBeingEdited: false,
          };
        }

        return content;
      })
    );

    setActiveBlockId(null);
  };

  const handleRemoveFromSheet = useCallback((blockId: string) => {
    setContents((prev) => prev.filter((c) => c.id !== blockId));
  }, []);

  const handleCollapseBlock = useCallback(
    (blockId: string, toggle: "expand" | "collapse") => {
      setContents((prev) =>
        prev.map((block) =>
          block.id === blockId
            ? {
                ...block,
                isCollapsed: !block.isCollapsed,
                isBeingEdited: toggle === "expand",
              }
            : block
        )
      );

      setActiveBlockId(toggle === "expand" ? blockId : null);
    },
    []
  );

  useEffect(() => {
    if (template && template?.blocks && !isEqual(template.blocks, blocks)) {
      setBlocks(template.blocks);
    }
  }, [template]);

  return {
    blocks,
    activeBlockId,
    contents,
    setContents,
    handleAddToSheet,
    handleCollapseBlock,
    handleRemoveFromSheet,
    handleResolve,
  };
};

export default useBuilder;
