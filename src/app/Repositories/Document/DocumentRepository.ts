import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  DependencyProps,
  JsonResponse,
  ViewsProps,
} from "../BaseRepository";
import { DocumentResponseData } from "./data";
import { documentRules } from "./rules";
import { documentViews } from "./views";
import { documentColumns } from "./columns";
import { documentConfig } from "./config";

export default class DocumentRepository extends BaseRepository {
  public fillables: Array<keyof DocumentResponseData> =
    documentConfig.fillables;
  public rules: { [key: string]: string } = documentRules;
  public views: ViewsProps[] = documentViews;
  protected state: DocumentResponseData = documentConfig.state;
  public columns: ColumnData[] = documentColumns;
  public actions: ButtonsProp[] = documentConfig.actions;
  public fromJson(data: JsonResponse): DocumentResponseData {
    // Map numeric status values to string representations
    const mapStatusToString = (status: any): string => {
      if (typeof status === "string") {
        return status;
      }

      const statusMap: Record<number, string> = {
        0: "pending",
        1: "processing",
        2: "completed",
        3: "approved",
        4: "rejected",
        5: "cancelled",
        6: "draft",
        7: "stalled",
        8: "escalated",
        9: "reversed",
        10: "appealed",
        11: "payment-committed",
        12: "payment-confirmed",
        13: "procurement",
      };

      return statusMap[Number(status)] ?? "pending";
    };

    // Start with the original data to preserve all fields
    const result: DocumentResponseData = {
      ...data, // Preserve all original fields first
      // Then override with transformations and defaults only where needed
      status: mapStatusToString(data.status),
      approved_amount:
        data.approved_amount !== undefined && data.approved_amount !== null
          ? parseFloat(String(data.approved_amount))
          : data.approved_amount ?? 0,
      // Ensure required fields exist, but don't override if they're already present
      title: data.title ?? "",
      ref: data.ref ?? "",
      // ... other fields with defaults only if truly missing
    } as DocumentResponseData;

    return result;
  }
  public associatedResources: DependencyProps[] =
    documentConfig.associatedResources;
}
