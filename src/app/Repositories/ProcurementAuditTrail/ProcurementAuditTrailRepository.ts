import { BaseRepository, JsonResponse } from "../BaseRepository";
import { ProcurementAuditTrailResponseData } from "./data";

export default class ProcurementAuditTrailRepository extends BaseRepository {
  public fillables: Array<keyof ProcurementAuditTrailResponseData> = [];
  public rules: { [key: string]: string } = {};
  public views: any[] = []; // Read-only, no views needed
  protected state: ProcurementAuditTrailResponseData = {
    id: 0,
    project_id: 0,
    user_id: 0,
    action: "",
    entity_type: null,
    entity_id: null,
    before_value: null,
    after_value: null,
    ip_address: null,
    user_agent: null,
    notes: null,
    created_at: "",
  };
  public columns: any[] = [];
  public actions: any[] = [];

  public fromJson(data: JsonResponse): ProcurementAuditTrailResponseData {
    return {
      id: data.id ?? 0,
      project_id: data.project_id ?? 0,
      user_id: data.user_id ?? 0,
      action: data.action ?? "",
      entity_type: data.entity_type ?? null,
      entity_id: data.entity_id ?? null,
      before_value: data.before_value ?? null,
      after_value: data.after_value ?? null,
      ip_address: data.ip_address ?? null,
      user_agent: data.user_agent ?? null,
      notes: data.notes ?? null,
      project: data.project ?? undefined,
      user: data.user ?? undefined,
      created_at: data.created_at ?? "",
    };
  }

  public associatedResources: any[] = [];
}

