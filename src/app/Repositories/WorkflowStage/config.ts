import { ConfigProp } from "../BaseRepository"; 
import { WorkflowStageResponseData } from "./data";

export const workflowStageConfig: ConfigProp<WorkflowStageResponseData> = {
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