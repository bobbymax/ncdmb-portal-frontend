import {
    ColumnData,
    ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { JournalTypeResponseData } from "./data";
import { journalTypeRules } from "./rules";
import { journalTypeViews } from "./views";
import { journalTypeColumns } from "./columns";
import { journalTypeConfig } from "./config";

export default class JournalTypeRepository extends BaseRepository {
    public fillables: Array<keyof JournalTypeResponseData> = journalTypeConfig.fillables;
    public rules: { [key: string]: string } = journalTypeRules;
    public views: ViewsProps[] = journalTypeViews;
    protected state: JournalTypeResponseData = journalTypeConfig.state;
    public columns: ColumnData[] = journalTypeColumns;
    public actions: ButtonsProp[] = journalTypeConfig.actions;
    public fromJson(data: JournalTypeResponseData): JournalTypeResponseData {
        return {
            id: data.id ?? 0,
            created_at: data.created_at ?? "",
            updated_at: data.updated_at ?? "",
        };
    }
    public associatedResources: DependencyProps[] =
    journalTypeConfig.associatedResources;
}

