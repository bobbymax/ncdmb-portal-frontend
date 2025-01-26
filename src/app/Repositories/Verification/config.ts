import { ConfigProp } from "../BaseRepository"; 
import { VerificationResponseData } from "./data";

export const verificationConfig: ConfigProp<VerificationResponseData> = {
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