import {
    ColumnData,
    ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { ImportResponseData } from "./data";
import { importRules } from "./rules";
import { importViews } from "./views";
import { importColumns } from "./columns";
import { importConfig } from "./config";

export default class ImportRepository extends BaseRepository {
    public fillables: Array<keyof ImportResponseData> = importConfig.fillables;
    public rules: { [key: string]: string } = importRules;
    public views: ViewsProps[] = importViews;
    protected state: ImportResponseData = importConfig.state;
    public columns: ColumnData[] = importColumns;
    public actions: ButtonsProp[] = importConfig.actions;
    public fromJson(data: ImportResponseData): ImportResponseData {
        return {
            id: data.id ?? 0,
            created_at: data.created_at ?? "",
            updated_at: data.updated_at ?? "",
        };
    }
    public associatedResources: DependencyProps[] =
    importConfig.associatedResources;
}

