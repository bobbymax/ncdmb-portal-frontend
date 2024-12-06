import { ViewsProps } from "../BaseRepository";

export const documentRequirementViews: ViewsProps[] = [
  {
    title: "Document Requirement Lists",
    server_url: "documentRequirements",
    component: "DocumentRequirements",
    frontend_path: "/specifications/document-requirements",
    type: "index",
    tag: "Add Requirement",
    mode: "list",
  },
  {
    title: "Create Requirement",
    server_url: "documentRequirements",
    component: "DocumentRequirement",
    frontend_path: "/specifications/document-requirements/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Requirement",
    index_path: "/specifications/document-requirements",
  },
  {
    title: "Manage Requirement",
    server_url: "documentRequirements",
    component: "DocumentRequirement",
    frontend_path: "/specifications/document-requirements/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/specifications/document-requirements",
  },
];
