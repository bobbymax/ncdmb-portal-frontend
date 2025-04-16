import { ConfigProp } from "../BaseRepository"; 
import { ImportResponseData } from "./data";

export const importConfig: ConfigProp<ImportResponseData> = {
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