import { ConfigProp } from "../BaseRepository"; 
import { JournalResponseData } from "./data";

export const journalConfig: ConfigProp<JournalResponseData> = {
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