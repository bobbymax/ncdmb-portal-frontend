import { ConfigProp } from "../BaseRepository"; 
import { MilestoneResponseData } from "./data";

export const milestoneConfig: ConfigProp<MilestoneResponseData> = {
    fillables: [],
    associatedResources: [
        {name: "", url: ""}
    ],
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