import { ConfigProp } from "../BaseRepository";
import { ExpenditureResponseData } from "./data";

export const expenditureConfig: ConfigProp<ExpenditureResponseData> = {
  fillables: [
    "department_id",
    "fund_id",
    "document_draft_id",
    "code",
    "purpose",
    "additional_info",
    "amount",
    "type",
    "status",
    "budget_year",
    "currency",
    "cbn_current_rate",
    "document_reference_id",
    "expenditureable_id",
    "expenditureable_type",
  ],
  associatedResources: [{ name: "funds", url: "funds" }],
  state: {
    id: 0,
    user_id: 0,
    department_id: 0,
    fund_id: 0,
    document_draft_id: 0,
    code: "",
    purpose: "",
    additional_info: "",
    amount: "",
    type: "",
    status: "",
    currency: "NGN",
    cbn_current_rate: "",
    budget_year: 0,
    is_archived: 0,
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
  ],
};
