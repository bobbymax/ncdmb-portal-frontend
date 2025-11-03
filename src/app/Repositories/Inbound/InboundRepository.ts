import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { InboundResponseData } from "./data";
import { inboundRules } from "./rules";
import { inboundViews } from "./views";
import { inboundColumns } from "./columns";
import { inboundConfig } from "./config";

export default class InboundRepository extends BaseRepository {
  public fillables: Array<keyof InboundResponseData> = inboundConfig.fillables;
  public rules: { [key: string]: string } = inboundRules;
  public views: ViewsProps[] = inboundViews;
  protected state: InboundResponseData = inboundConfig.state;
  public columns: ColumnData[] = inboundColumns;
  public actions: ButtonsProp[] = inboundConfig.actions;
  public fromJson(data: InboundResponseData): InboundResponseData {
    return {
      id: data.id ?? 0,
      received_by_id: data.received_by_id ?? 0,
      authorising_officer_id: data.authorising_officer_id ?? 0,
      department_id: data.department_id ?? 0,
      vendor_id: data.vendor_id ?? 0,
      from_name: data.from_name ?? "",
      from_email: data.from_email ?? "",
      from_phone: data.from_phone ?? "",
      ref_no: data.ref_no ?? "",
      summary: data.summary ?? "",
      instructions: data.instructions ?? [],
      analysis: data.analysis ?? {},
      mailed_at: data.mailed_at ?? "",
      received_at: data.received_at ?? "",
      published_at: data.published_at ?? "",
      assignable_id: data.assignable_id ?? 0,
      assignable_type: data.assignable_type ?? "",
      security_class: data.security_class ?? "public",
      channel: data.channel ?? "email",
      priority: data.priority ?? "low",
      status: data.status ?? "pending",
      file_uploads: data.file_uploads ?? [],
      ocr_available: data.ocr_available ?? false,
      ocr_index_version: data.ocr_index_version ?? 0,
      uploads: data.uploads ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      deleted_at: data.deleted_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    inboundConfig.associatedResources;
}
