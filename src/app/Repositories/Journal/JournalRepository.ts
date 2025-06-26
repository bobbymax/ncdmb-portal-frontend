import {
    ColumnData,
    ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { JournalResponseData } from "./data";
import { journalRules } from "./rules";
import { journalViews } from "./views";
import { journalColumns } from "./columns";
import { journalConfig } from "./config";

export default class JournalRepository extends BaseRepository {
    public fillables: Array<keyof JournalResponseData> = journalConfig.fillables;
    public rules: { [key: string]: string } = journalRules;
    public views: ViewsProps[] = journalViews;
    protected state: JournalResponseData = journalConfig.state;
    public columns: ColumnData[] = journalColumns;
    public actions: ButtonsProp[] = journalConfig.actions;
    public fromJson(data: JournalResponseData): JournalResponseData {
        return {
            id: data.id ?? 0,
            created_at: data.created_at ?? "",
            updated_at: data.updated_at ?? "",
        };
    }
    public associatedResources: DependencyProps[] =
    journalConfig.associatedResources;
}

