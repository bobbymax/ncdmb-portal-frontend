import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { InboundInstructionResponseData } from "./data";
import { inboundInstructionRules } from "./rules";
import { inboundInstructionViews } from "./views";
import { inboundInstructionColumns } from "./columns";
import { inboundInstructionConfig } from "./config";

export default class InboundInstructionRepository extends BaseRepository {
  public fillables: Array<keyof InboundInstructionResponseData> =
    inboundInstructionConfig.fillables;
  public rules: { [key: string]: string } = inboundInstructionRules;
  public views: ViewsProps[] = inboundInstructionViews;
  protected state: InboundInstructionResponseData =
    inboundInstructionConfig.state;
  public columns: ColumnData[] = inboundInstructionColumns;
  public actions: ButtonsProp[] = inboundInstructionConfig.actions;
  public fromJson(
    data: InboundInstructionResponseData
  ): InboundInstructionResponseData {
    return {
      id: data.id ?? 0,
      inbound_id: data.inbound_id ?? 0,
      created_by_id: data.created_by_id ?? 0,
      instruction_type: data.instruction_type ?? "review",
      instruction_text: data.instruction_text ?? "",
      notes: data.notes ?? {},
      assignable_id: data.assignable_id ?? 0,
      assignable_type: data.assignable_type ?? "",
      category: data.category ?? "user",
      status: data.status ?? "pending",
      priority: data.priority ?? "low",
      due_date: data.due_date ?? "",
      completed_at: data.completed_at ?? "",
      started_at: data.started_at ?? "",
      completion_notes: data.completion_notes ?? "",
      completed_by_id: data.completed_by_id ?? null,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    inboundInstructionConfig.associatedResources;
}
