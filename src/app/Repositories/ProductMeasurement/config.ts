import { ConfigProp } from "../BaseRepository";
import { ProductMeasurementResponseData } from "./data";

export const productMeasurementConfig: ConfigProp<ProductMeasurementResponseData> =
  {
    fillables: ["product_id", "measurement_type_id", "quantity"],
    associatedResources: [
      { name: "products", url: "products" },
      { name: "measurementTypes", url: "measurementTypes" },
    ],
    state: {
      id: 0,
      product_id: 0,
      measurement_type_id: 0,
      quantity: 0,
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
