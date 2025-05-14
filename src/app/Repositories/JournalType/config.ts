import { ConfigProp } from "../BaseRepository"; 
import { JournalTypeResponseData } from "./data";

export const journalTypeConfig: ConfigProp<JournalTypeResponseData> = {
    fillables: [],
    associatedResources: [],
    state: {
        id: 0,
    },
    actions: [
        {
            label: "manage",
            icon: "ri-settings-3-line",
            variant: "success",
            conditions: [],
            operator: "and",
            display: "Manage",
        },
    ]
}