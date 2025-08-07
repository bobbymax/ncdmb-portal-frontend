import { ContentAreaProps } from "app/Hooks/useBuilder";
import { BaseResponse } from "../BaseRepository";

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
  | "paper_title";

export type BlockInputType =
  | "ParagraphBlock"
  | "EventBlock"
  | "MilestoneBlock"
  | "FundBlock"
  | "TableBlock"
  | "SignatureBlock"
  | "ListBlock"
  | "ExpenseBlock"
  | "TitleBlock";

export interface BlockResponseData extends BaseResponse {
  title: string;
  label?: string;
  icon: string;
  data_type: BlockDataType;
  input_type: BlockInputType;
  max_words: number;
  type: "staff" | "third-party" | "document";
  contents: ContentAreaProps[];
  active: number;
  created_at?: string;
  updated_at?: string;
}
