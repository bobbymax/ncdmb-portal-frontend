import { BaseResponse } from "../BaseRepository";
import { DepartmentResponseData } from "../Department/data";
import { ProductCategoryResponseData } from "../ProductCategory/data";
import { ProductMeasurementResponseData } from "../ProductMeasurement/data";
import { ProductStockResponseData } from "../ProductStock/data";

export interface ProductResponseData extends BaseResponse {
  product_category_id: number | null;
  department_id: number | null;
  product_brand_id: number | null;
  primary_vendor_id: number | null;
  name: string;
  label: string;
  code: string;
  description: string;
  restock_qty: number;
  reorder_point: number;
  max_stock_level: number;
  track_batches: boolean;
  owner: "store" | "other";
  request_on_delivery: boolean;
  out_of_stock: boolean;
  is_blocked: boolean;
  measurements: ProductMeasurementResponseData[];
  stocks?: ProductStockResponseData[];
  category?: ProductCategoryResponseData | null;
  brand?: { id: number; name?: string } | null;
  department?: DepartmentResponseData | null;
  created_at?: string;
  updated_at?: string;
}
