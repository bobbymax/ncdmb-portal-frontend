import {
    ColumnData,
    ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { MilestoneResponseData } from "./data";
import { milestoneRules } from "./rules";
import { milestoneViews } from "./views";
import { milestoneColumns } from "./columns";
import { milestoneConfig } from "./config";

export default class MilestoneRepository extends BaseRepository {
    public fillables: Array<keyof MilestoneResponseData> = milestoneConfig.fillables;
    public rules: { [key: string]: string } = milestoneRules;
    public views: ViewsProps[] = milestoneViews;
    protected state: MilestoneResponseData = milestoneConfig.state;
    public columns: ColumnData[] = milestoneColumns;
    public actions: ButtonsProp[] = milestoneConfig.actions;
    public fromJson(data: MilestoneResponseData): MilestoneResponseData {
        return {
            id: data.id ?? 0,
            created_at: data.created_at ?? "",
            updated_at: data.updated_at ?? "",
        };
    }
    public associatedResources: DependencyProps[] =
    milestoneConfig.associatedResources;
}

