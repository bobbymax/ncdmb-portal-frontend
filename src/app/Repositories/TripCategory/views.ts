import { ViewsProps } from "../BaseRepository";

export const tripCategoryViews: ViewsProps[] = [
  {
    title: "List of Trip Categories",
    server_url: "tripCategories",
    component: "TripCategories",
    frontend_path: "/specifications/trip-categories",
    type: "index",
    tag: "Add Category",
    mode: "list",
  },
  {
    title: "Create Trip Category",
    server_url: "tripCategories",
    component: "TripCategory",
    frontend_path: "/specifications/trip-categories/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Category",
    index_path: "/specifications/trip-categories",
  },
  {
    title: "Manage Trip Category",
    server_url: "tripCategories",
    component: "TripCategory",
    frontend_path: "/specifications/trip-categories/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/specifications/trip-categories",
  },
];
