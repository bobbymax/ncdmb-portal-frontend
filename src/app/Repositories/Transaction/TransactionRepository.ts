import {
    ColumnData,
    ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { TransactionResponseData } from "./data";
import { transactionRules } from "./rules";
import { transactionViews } from "./views";
import { transactionColumns } from "./columns";
import { transactionConfig } from "./config";

export default class TransactionRepository extends BaseRepository {
    public fillables: Array<keyof TransactionResponseData> = transactionConfig.fillables;
    public rules: { [key: string]: string } = transactionRules;
    public views: ViewsProps[] = transactionViews;
    protected state: TransactionResponseData = transactionConfig.state;
    public columns: ColumnData[] = transactionColumns;
    public actions: ButtonsProp[] = transactionConfig.actions;
    public fromJson(data: TransactionResponseData): TransactionResponseData {
        return {
            id: data.id ?? 0,
            created_at: data.created_at ?? "",
            updated_at: data.updated_at ?? "",
        };
    }
    public associatedResources: DependencyProps[] =
    transactionConfig.associatedResources;
}

