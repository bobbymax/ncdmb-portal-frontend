import { ProductResponseData } from "@/app/Repositories/Product/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useMemo } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import Select from "../components/forms/Select";
import ToggleCard from "../components/forms/ToggleCard";
import { formatOptions } from "app/Support/Helpers";
import { ProductCategoryResponseData } from "@/app/Repositories/ProductCategory/data";
import { DepartmentResponseData } from "@/app/Repositories/Department/data";

interface DependencyProps {
  categories: ProductCategoryResponseData[];
  departments: DepartmentResponseData[];
}

const Product: React.FC<FormPageComponentProps<ProductResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
  loading,
}) => {
  const { categories = [], departments = [] } = useMemo(
    () => (dependencies || {}) as Partial<DependencyProps>,
    [dependencies]
  );

  const categoryOptions = useMemo(
    () => formatOptions(categories, "id", "name"),
    [categories]
  );

  const departmentOptions = useMemo(
    () => formatOptions(departments, "id", "name"),
    [departments]
  );

  const handleToggle =
    (key: keyof ProductResponseData) => (checked: boolean) => {
      setState?.((prev) => ({
        ...prev,
        [key]: checked,
      }));
    };

  return (
    <>
      <div className="col-md-6 mb-3">
        <TextInput
          label="Product Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter product name"
          isDisabled={loading}
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Product Label"
          name="label"
          value={state.label}
          onChange={handleChange}
          placeholder="Unique label"
          isDisabled={loading}
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Product Code"
          name="code"
          value={state.code}
          onChange={handleChange}
          placeholder="Unique code"
          isDisabled={loading}
        />
      </div>

      <div className="col-md-4 mb-3">
        <Select
          label="Category"
          name="product_category_id"
          value={state.product_category_id ?? 0}
          onChange={handleChange}
          options={categoryOptions}
          valueKey="value"
          labelKey="label"
          defaultValue={0}
          defaultText="Select category"
          defaultCheckDisabled
          isDisabled={loading}
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Department"
          name="department_id"
          value={state.department_id ?? 0}
          onChange={handleChange}
          options={departmentOptions}
          valueKey="value"
          labelKey="label"
          defaultValue={0}
          defaultText="Select department"
          defaultCheckDisabled
          isDisabled={loading}
        />
      </div>
      {/* <div className="col-md-4 mb-3">
        <Select
          label="Brand"
          name="product_brand_id"
          value={state.product_brand_id ?? 0}
          onChange={handleChange}
          options={[]}
          valueKey="value"
          labelKey="label"
          defaultValue={0}
          defaultText="Select brand"
          defaultCheckDisabled
          isDisabled={loading}
        />
      </div> */}

      {/* <div className="col-md-4 mb-3">
        <Select
          label="Primary Vendor"
          name="primary_vendor_id"
          value={state.primary_vendor_id ?? 0}
          onChange={handleChange}
          options={[]}
          valueKey="value"
          labelKey="label"
          defaultValue={0}
          defaultText="Select vendor"
          defaultCheckDisabled
          isDisabled={loading}
        />
      </div> */}
      <div className="col-md-4 mb-3">
        <Select
          label="Owner"
          name="owner"
          value={state.owner}
          onChange={handleChange}
          options={[
            { value: "store", label: "Store" },
            { value: "other", label: "Other" },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue="store"
          defaultCheckDisabled
          isDisabled={loading}
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Restock Quantity"
          name="restock_qty"
          type="number"
          min="0"
          value={state.restock_qty}
          onChange={handleChange}
          isDisabled={loading}
        />
      </div>

      <div className="col-md-4 mb-3">
        <TextInput
          label="Reorder Point"
          name="reorder_point"
          type="number"
          step="0.01"
          min="0"
          value={state.reorder_point}
          onChange={handleChange}
          isDisabled={loading}
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Maximum Stock Level"
          name="max_stock_level"
          type="number"
          step="0.01"
          min="0"
          value={state.max_stock_level}
          onChange={handleChange}
          isDisabled={loading}
        />
      </div>

      <div className="col-md-12 mb-3">
        <Textarea
          label="Description"
          name="description"
          value={state.description ?? ""}
          onChange={handleChange}
          placeholder="Describe the product, usage or storage notes"
          rows={3}
          isDisabled={loading}
        />
      </div>

      <ToggleCard
        title="Require Request on Delivery"
        description="If enabled, staff must raise a requisition before this item is received."
        icon="ri-article-line"
        checked={Boolean(state.request_on_delivery)}
        onChange={handleToggle("request_on_delivery")}
        disabled={loading}
        checkedLabel="Required"
        uncheckedLabel="Optional"
      />
      <ToggleCard
        title="Track Batches"
        description="Enable batch/lot tracking for this product."
        icon="ri-barcode-line"
        checked={Boolean(state.track_batches)}
        onChange={handleToggle("track_batches")}
        disabled={loading}
        checkedLabel="Enabled"
        uncheckedLabel="Disabled"
      />
      <ToggleCard
        title="Mark as Out of Stock"
        description="Flag this product as temporarily unavailable for requisitions."
        icon="ri-alert-line"
        iconColor="#eab308"
        checked={Boolean(state.out_of_stock)}
        onChange={handleToggle("out_of_stock")}
        disabled={loading}
        checkedLabel="Out of Stock"
        uncheckedLabel="Available"
      />
      <ToggleCard
        title="Block Product"
        description="Prevent this product from appearing in requisition and ordering workflows."
        icon="ri-prohibited-line"
        iconColor="#ef4444"
        checked={Boolean(state.is_blocked)}
        onChange={handleToggle("is_blocked")}
        disabled={loading}
        checkedLabel="Blocked"
        uncheckedLabel="Active"
      />
    </>
  );
};

export default Product;
