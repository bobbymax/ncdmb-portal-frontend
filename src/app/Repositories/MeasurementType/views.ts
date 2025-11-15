import { ViewsProps } from "../BaseRepository";

export const measurementTypeViews: ViewsProps[] = [
    {
        title: "List of MeasurementTypes",
        server_url: "measurementTypes",
        component: "MeasurementTypes",
        frontend_path: "/inventory/measurement-types",
        type: "index",
        tag: "Add MeasurementType",
        mode: "list",
    },
    {
        title: "Create MeasurementType",
        server_url: "measurementTypes",
        component: "MeasurementType",
        frontend_path: "/inventory/measurement-types/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add MeasurementType",
        index_path: "/inventory/measurement-types",
    },
    {
        title: "Manage MeasurementType",
        server_url: "measurementTypes",
        component: "MeasurementType",
        frontend_path: "/inventory/measurement-types/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/inventory/measurement-types",
    },
];