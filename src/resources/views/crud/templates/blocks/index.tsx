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
  InvoiceContentAreaProps,
  MilestoneContentAreaProps,
  OptionsContentAreaProps,
  ParagraphContentAreaProps,
  SignatureContentAreaProps,
  TableContentAreaProps,
} from "app/Hooks/useBuilder";
import SignatureBlock from "./SignatureBlock";

export type BlockDataTypeMap = {
  paragraph: ParagraphContentAreaProps;
  purchase: TableContentAreaProps;
  event: EventContentAreaProps;
  milestone: MilestoneContentAreaProps;
  estacode: TableContentAreaProps;
  invoice: InvoiceContentAreaProps;
  training: TableContentAreaProps;
  approval: SignatureContentAreaProps; // Assuming approval uses SignatureContentAreaProps
  posting: unknown;
  bullet: unknown;
};

export interface BlockContentComponentPorps {
  resource?: unknown;
  localContentState: OptionsContentAreaProps;
  updateLocal: <T extends BlockDataType>(
    data: BlockDataTypeMap[T],
    identifier: keyof OptionsContentAreaProps
  ) => void;
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
  approval: SignatureBlock, // Assuming approval uses the same ListBlock for now
};
