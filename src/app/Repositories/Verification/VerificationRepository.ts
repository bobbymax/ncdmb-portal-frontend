import {
    ColumnData,
    ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { VerificationResponseData } from "./data";
import { verificationRules } from "./rules";
import { verificationViews } from "./views";
import { verificationColumns } from "./columns";
import { verificationConfig } from "./config";

export default class VerificationRepository extends BaseRepository {
    public fillables: Array<keyof VerificationResponseData> = verificationConfig.fillables;
    public rules: { [key: string]: string } = verificationRules;
    public views: ViewsProps[] = verificationViews;
    protected state: VerificationResponseData = verificationConfig.state;
    public columns: ColumnData[] = verificationColumns;
    public actions: ButtonsProp[] = verificationConfig.actions;
    public fromJson(data: VerificationResponseData): VerificationResponseData {
        return {
            id: data.id ?? 0,
            created_at: data.created_at ?? "",
            updated_at: data.updated_at ?? "",
        };
    }
    public associatedResources: DependencyProps[] =
    verificationConfig.associatedResources;
}

