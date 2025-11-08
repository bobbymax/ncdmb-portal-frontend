import { ContentAreaProps } from "app/Hooks/useBuilder";
import { BaseResponse } from "../BaseRepository";
import { DeskComponentPropTypes } from "resources/views/pages/DocumentTemplateContent";

export type BlockDataType =
  | "paragraph"
  | "purchase"
  | "event"
  | "milestone"
  | "estacode"
  | "invoice"
  | "training"
  | "posting"
  | "bullet"
  | "approval"
  | "expense"
  | "paper_title"
  | "signature"
  | "payment_batch"
  | "prayer"
  | "header";

export type BlockInputType =
  | "ParagraphBlock"
  | "EventBlock"
  | "MilestoneBlock"
  | "FundBlock"
  | "TableBlock"
  | "SignatureBlock"
  | "ListBlock"
  | "ExpenseBlock"
  | "TitleBlock"
  | "SignatureBlock"
  | "PrayerBlock"
  | "HeaderBlock";

export interface BlockResponseData extends BaseResponse {
  title: string;
  label?: string;
  icon: string;
  data_type: DeskComponentPropTypes;
  input_type: BlockInputType;
  max_words: number;
  type: "staff" | "third-party" | "document";
  contents: ContentAreaProps[];
  active: number;
  created_at?: string;
  updated_at?: string;
}
