import { InventoryReturnResponseData } from "@/app/Repositories/InventoryReturn/data";
import { FormPageComponentProps } from "bootstrap";
import { formatOptions } from "app/Support/Helpers";
import React, { useMemo, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import Select from "../components/forms/Select";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";

interface DependencyProps {
  locations: Array<{ id: number; name: string }>;
  products: Array<{
    id: number;
    name: string;
    measurements?: Array<{ id: number; measurement?: { name: string } }>;
  }>;
  issues: Array<{ id: number; reference?: string }>;
  supplies: Array<{ id: number; delivery_reference?: string; product_id: number }>;
}

const InventoryReturn: React.FC<
  FormPageComponentProps<InventoryReturnResponseData>
> = ({ state, setState, handleChange, dependencies, loading }) => {
  const { locations = [], products = [], issues = [], supplies = [] } = useMemo(
    () => (dependencies || {}) as DependencyProps,
    [dependencies]
  );

  const productOptions = useMemo(
    () => formatOptions(products, "id", "name"),
    [products]
  );

  const locationOptions = useMemo(
    () => formatOptions(locations, "id", "name"),
    [locations]
  );

  const issueOptions = useMemo(
    () =>
      issues.map((issue) => ({
        value: issue.id,
        label: issue.reference ?? `Issue #${issue.id}`,
      })),
    [issues]
  );

  const supplyOptions = useMemo(
    () =>
      supplies.map((supply) => ({
        value: supply.id,
        label: supply.delivery_reference
          ? `Supply ${supply.delivery_reference}`
          : `Supply #${supply.id}`,
      })),
    [supplies]
  );

  const selectedProduct = products.find((prod) => prod.id === state.product_id);
  const measurementOptions = selectedProduct?.measurements?.map((measurement) => ({
    value: measurement.id,
    label: measurement.measurement?.name ?? `Measurement #${measurement.id}`,
  }));

  const [locationSelection, setLocationSelection] =
    useState<DataOptionsProps | null>(null);

  return (
    <>
      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Related Issue"
          placeholder="Optional linked issue"
          options={issueOptions}
          value={
            state.inventory_issue_id
              ? {
                  value: state.inventory_issue_id,
                  label:
                    issues.find((issue) => issue.id === state.inventory_issue_id)
                      ?.reference ?? `Issue #${state.inventory_issue_id}`,
                }
              : null
          }
          onChange={(option) => {
            const value = option as DataOptionsProps | null;
            setState?.((prev) => ({
              ...prev,
              inventory_issue_id: value?.value ?? null,
            }));
          }}
          isClearable
          isSearchable
          isDisabled={loading}
        />
      </div>

      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Original Supply"
          placeholder="Optional supply reference"
          options={supplyOptions}
          value={
            state.store_supply_id
              ? {
                  value: state.store_supply_id,
                  label:
                    supplies.find((sup) => sup.id === state.store_supply_id)
                      ?.delivery_reference ?? `Supply #${state.store_supply_id}`,
                }
              : null
          }
          onChange={(option) => {
            const value = option as DataOptionsProps | null;
            setState?.((prev) => ({
              ...prev,
              store_supply_id: value?.value ?? null,
            }));
          }}
          isClearable
          isSearchable
          isDisabled={loading}
        />
      </div>

      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Return Location"
          placeholder="Select destination"
          options={locationOptions}
          value={locationSelection}
          onChange={(option) => {
            const value = option as DataOptionsProps | null;
            setLocationSelection(value);
            setState?.((prev) => ({
              ...prev,
              location_id: (value?.value as number) ?? 0,
            }));
          }}
          isSearchable
          isDisabled={loading}
        />
      </div>

      <div className="col-md-6 mb-3">
        <Select
          label="Return Type"
          name="type"
          value={state.type}
          onChange={handleChange}
          defaultValue="internal"
          defaultCheckDisabled
          options={[
            { label: "Internal", value: "internal" },
            { label: "From Project", value: "from_project" },
            { label: "To Supplier", value: "to_supplier" },
          ]}
          valueKey="value"
          labelKey="label"
        />
      </div>

      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Product"
          placeholder="Select product"
          options={productOptions}
          value={
            state.product_id
              ? {
                  value: state.product_id,
                  label:
                    products.find((product) => product.id === state.product_id)
                      ?.name ?? "",
                }
              : null
          }
          onChange={(option) => {
            const value = option as DataOptionsProps | null;
            setState?.((prev) => ({
              ...prev,
              product_id: (value?.value as number) ?? 0,
              product_measurement_id: null,
            }));
          }}
          isSearchable
        />
      </div>

      <div className="col-md-6 mb-3">
        <Select
          label="Measurement"
          name="product_measurement_id"
          value={state.product_measurement_id ?? 0}
          onChange={handleChange}
          defaultValue={0}
          defaultCheckDisabled
          options={measurementOptions ?? []}
          valueKey="value"
          labelKey="label"
          isDisabled={!measurementOptions?.length}
        />
      </div>

      <div className="col-md-4 mb-3">
        <TextInput
          label="Quantity"
          name="quantity"
          type="number"
          step="0.01"
          min="0"
          value={state.quantity}
          onChange={handleChange}
        />
      </div>

      <div className="col-md-4 mb-3">
        <TextInput
          label="Unit Cost"
          name="unit_cost"
          type="number"
          step="0.01"
          min="0"
          value={state.unit_cost ?? ""}
          onChange={handleChange}
        />
      </div>

      <div className="col-md-4 mb-3">
        <TextInput
          label="Returned At"
          name="returned_at"
          type="datetime-local"
          value={state.returned_at ? state.returned_at.slice(0, 16) : ""}
          onChange={handleChange}
        />
      </div>

      <div className="col-md-12 mb-3">
        <Textarea
          label="Reason"
          name="reason"
          value={state.reason ?? ""}
          onChange={handleChange}
          rows={3}
          placeholder="Document why this return occurred"
        />
      </div>
    </>
  );
};

export default InventoryReturn;
