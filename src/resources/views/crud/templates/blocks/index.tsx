import React from "react";
import { BlockDataType } from "app/Repositories/Block/data";
import ParagraphBlock from "./ParagraphBlock";
import PurchaseBlock from "./PurchaseBlock";
import EventBlock from "./EventBlock";
import MilestoneBlock from "./MilestoneBlock";
import EstacodeBlock from "./EstacodeBlock";
import InvoiceBlock from "./InvoiceBlock";
import TrainingBlock from "./TrainingBlock";
import RedeploymentBlock from "./RedeploymentBlock";
import ListBlock from "./ListBlock";
import {
  EventContentAreaProps,
  ExpenseContentProps,
  InvoiceContentAreaProps,
  MilestoneContentAreaProps,
  OptionsContentAreaProps,
  ParagraphContentAreaProps,
  SignatureContentAreaProps,
  TableContentAreaProps,
  TitleContentProps,
} from "app/Hooks/useBuilder";
import SignatureBlock from "./SignatureBlock";
import { ConfigState } from "app/Hooks/useTemplateHeader";
import ExpenseBlock from "./ExpenseBlock";
import TitleBlock from "./TitleBlock";

export type BlockDataTypeMap = {
  paragraph: ParagraphContentAreaProps;
  purchase: TableContentAreaProps;
  event: EventContentAreaProps;
  milestone: MilestoneContentAreaProps;
  estacode: TableContentAreaProps;
  invoice: InvoiceContentAreaProps;
  training: TableContentAreaProps;
  approval: SignatureContentAreaProps;
  posting: unknown;
  bullet: unknown;
  expense: ExpenseContentProps;
  paper_title: TitleContentProps;
};

export interface BlockContentComponentPorps {
  resource?: unknown;
  localContentState: OptionsContentAreaProps;
  updateLocal: <T extends BlockDataType>(
    data: BlockDataTypeMap[T],
    identifier: keyof OptionsContentAreaProps
  ) => void;
  configState: ConfigState;
  sharedState?: Record<string, any>;
  blockId?: string;
}

export const blockFormMap: Record<
  BlockDataType,
  React.ComponentType<BlockContentComponentPorps>
> = {
  paragraph: ParagraphBlock,
  purchase: PurchaseBlock,
  event: EventBlock,
  milestone: MilestoneBlock,
  estacode: EstacodeBlock,
  invoice: InvoiceBlock,
  training: TrainingBlock,
  posting: RedeploymentBlock,
  bullet: ListBlock,
  approval: SignatureBlock,
  expense: ExpenseBlock,
  paper_title: TitleBlock,
};
