import { RepositoryService } from "@services/RepositoryService";

interface BaseResponse {
  id: number;
}

export type JsonResponse = BaseResponse & Record<string, any>;

interface RepositoryTableColumns {
  accessor: string;
  display: string;
  type: "text" | "currency" | "date" | "status" | "badge" | "field";
}

type ConditionalArray = [keyof JsonResponse, string | number, string | number];

interface TableBttnProps {
  action:
    | "update"
    | "destroy"
    | "external"
    | "block"
    | "guarantors"
    | "view"
    | "schedule"
    | "print";
  label?: string;
  icon?: string;
  isDisabled: boolean;
  variant?: "success" | "info" | "warning" | "danger" | "dark";
  conditions: ConditionalArray[];
  terms: "and" | "or";
}

export abstract class BaseRepository extends RepositoryService {
  // This is the path for the frontend route of the repository
  protected path: string = "";
  public abstract fillables: Array<keyof JsonResponse>;
  public abstract rules: { [key: string]: string };

  constructor(url: string, path: string) {
    super(url);
    this.path = path;
  }

  // This is the repository initialState
  protected state: JsonResponse = {
    id: 0,
  };

  public columns: RepositoryTableColumns[] = [];
  public actions: TableBttnProps[] = [
    {
      action: "update",
      label: "Manage",
      icon: "create",
      variant: "dark",
      isDisabled: false,
      conditions: [],
      terms: "and",
    },
  ];

  abstract fromJson(data: JsonResponse): JsonResponse;

  getPath = (): string => {
    return this.path;
  };

  getUrl = (): string => {
    return this.url;
  };

  formatDataOnSubmit = (data: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};

    this.fillables.forEach((key) => {
      if (key in data) {
        result[key] = data[key];
      }
    });

    return result;
  };

  getState(): JsonResponse {
    return this.state;
  }
}
