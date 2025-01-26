import {
    ColumnData,
    ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { FolderResponseData } from "./data";
import { folderRules } from "./rules";
import { folderViews } from "./views";
import { folderColumns } from "./columns";
import { folderConfig } from "./config";

export default class FolderRepository extends BaseRepository {
    public fillables: Array<keyof FolderResponseData> = folderConfig.fillables;
    public rules: { [key: string]: string } = folderRules;
    public views: ViewsProps[] = folderViews;
    protected state: FolderResponseData = folderConfig.state;
    public columns: ColumnData[] = folderColumns;
    public actions: ButtonsProp[] = folderConfig.actions;
    public fromJson(data: FolderResponseData): FolderResponseData {
        return {
            id: data.id ?? 0,
            created_at: data.created_at ?? "",
            updated_at: data.updated_at ?? "",
        };
    }
    public associatedResources: DependencyProps[] =
    folderConfig.associatedResources;
}

