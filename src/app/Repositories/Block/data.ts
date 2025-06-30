import { BaseResponse } from "../BaseRepository";

// type OptionProps = {
//   name: string;
//   data_type: "string" | "number" | "currency" | "date";
//   isFormatted?: boolean;
// };

export interface BlockResponseData extends BaseResponse {
  title: string;
  label?: string;
  icon: string;
  data_type:
    | "paragraph"
    | "purchase"
    | "event"
    | "milestone"
    | "estacode"
    | "invoice"
    | "training"
    | "posting"
    | "bullet";
  input_type:
    | "ParagraphBlock"
    | "EventBlock"
    | "MilestoneBlock"
    | "FundBlock"
    | "TableBlock"
    | "SignatureBlock"
    | "ListBlock";
  max_words: number;
  type: "staff" | "third-party" | "document";
  active: number;
  created_at?: string;
  updated_at?: string;
}
