import {
    ColumnData,
    ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { WorkflowStageResponseData } from "./data";
import { workflowStageRules } from "./rules";
import { workflowStageViews } from "./views";
import { workflowStageColumns } from "./columns";
import { workflowStageConfig } from "./config";

export default class WorkflowStageRepository extends BaseRepository {
    public fillables: Array<keyof WorkflowStageResponseData> = workflowStageConfig.fillables;
    public rules: { [key: string]: string } = workflowStageRules;
    public views: ViewsProps[] = workflowStageViews;
    protected state: WorkflowStageResponseData = workflowStageConfig.state;
    public columns: ColumnData[] = workflowStageColumns;
    public actions: ButtonsProp[] = workflowStageConfig.actions;
    public fromJson(data: WorkflowStageResponseData): WorkflowStageResponseData {
        return {
            id: data.id ?? 0,
            created_at: data.created_at ?? "",
            updated_at: data.updated_at ?? "",
        };
    }
    public associatedResources: DependencyProps[] =
    workflowStageConfig.associatedResources;
}

