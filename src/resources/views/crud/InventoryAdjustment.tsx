import { InventoryAdjustmentResponseData } from "@/app/Repositories/InventoryAdjustment/data";
import { FormPageComponentProps } from "bootstrap";
import { formatOptions } from "app/Support/Helpers";
import React, { useEffect, useMemo, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import Select from "../components/forms/Select";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import Button from "../components/forms/Button";

interface DependencyProps {
  locations: Array<{ id: number; name: string }>;
  products: Array<{
    id: number;
    name: string;
    measurements?: Array<{ id: number; measurement?: { name: string } }>;
  }>;
}

const InventoryAdjustment: React.FC<
  FormPageComponentProps<InventoryAdjustmentResponseData>
> = ({ state, setState, handleChange, dependencies, loading }) => {
  const { locations = [], products = [] } = useMemo(
    () => (dependencies || {}) as DependencyProps,
    [dependencies]
  );

  const [locationSelection, setLocationSelection] =
    useState<DataOptionsProps | null>(null);

  useEffect(() => {
    if (state.location_id) {
      const match = locations.find((loc) => loc.id === state.location_id);
      if (match) {
        setLocationSelection({ value: match.id, label: match.name });
      }
    }
  }, [state.location_id, locations]);

  const locationOptions = useMemo(
    () => formatOptions(locations, "id", "name"),
    [locations]
  );

  const productOptions = useMemo(
    () => formatOptions(products, "id", "name"),
    [products]
  );

  const updateLine = (index: number, payload: Partial<typeof state.lines[number]>) => {
    setState?.((prev) => {
      const lines = [...prev.lines];
      lines[index] = { ...lines[index], ...payload };
      return { ...prev, lines };
    });
  };

  const addLine = () => {
    setState?.((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          product_id: 0,
          product_measurement_id: null,
          quantity: 0,
          direction: "plus" as const,
          unit_cost: null,
        },
      ],
    }));
  };

  const removeLine = (index: number) => {
    setState?.((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Warehouse / Location"
          placeholder="Select location"
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
          label="Reason"
          name="reason"
          value={state.reason}
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          defaultText="Select reason"
          options={[
            { label: "Cycle Count", value: "cycle_count" },
            { label: "Damage", value: "damage" },
            { label: "Shrinkage", value: "shrinkage" },
            { label: "Rebalance", value: "rebalance" },
            { label: "Other", value: "other" },
          ]}
          valueKey="value"
          labelKey="label"
        />
      </div>

      <div className="col-md-6 mb-3">
        <TextInput
          label="Adjustment Date"
          name="adjusted_at"
          type="datetime-local"
          value={state.adjusted_at ? state.adjusted_at.slice(0, 16) : ""}
          onChange={handleChange}
        />
      </div>

      <div className="col-md-12 mb-3">
        <Textarea
          label="Notes"
          name="notes"
          value={state.notes ?? ""}
          onChange={handleChange}
          rows={3}
          placeholder="Document why this adjustment is necessary"
        />
      </div>

      <div className="col-md-12">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="mb-0">Adjustment Lines</h6>
          <Button
            label="Add Line"
            variant="success"
            icon="ri-add-line"
            size="sm"
            handleClick={addLine}
            isDisabled={loading}
          />
        </div>
        {state.lines.length === 0 ? (
          <div className="alert alert-info">No lines added yet.</div>
        ) : (
          state.lines.map((line, index) => {
            const product = products.find((prod) => prod.id === line.product_id);
            const measurementOptions = product?.measurements?.map((measurement) => ({
              value: measurement.id,
              label: measurement.measurement?.name ?? `Measurement #${measurement.id}`,
            }));

            return (
              <div className="card shadow-sm mb-3" key={`${line.product_id}-${index}`}>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-5">
                      <MultiSelect
                        label="Product"
                        options={productOptions}
                        value={
                          line.product_id
                            ? {
                                value: line.product_id,
                                label:
                                  products.find((p) => p.id === line.product_id)?.name ?? "",
                              }
                            : null
                        }
                        onChange={(option) => {
                          const value = option as DataOptionsProps | null;
                          updateLine(index, {
                            product_id: (value?.value as number) ?? 0,
                            product_measurement_id: null,
                          });
                        }}
                        isSearchable
                        placeholder="Select product"
                      />
                    </div>
                    <div className="col-md-3">
                      <Select
                        label="Direction"
                        name={`lines.${index}.direction`}
                        value={line.direction}
                        onChange={(event) =>
                          updateLine(index, {
                            direction: event.target.value as "plus" | "minus",
                          })
                        }
                        options={[
                          { label: "Increase", value: "plus" },
                          { label: "Decrease", value: "minus" },
                        ]}
                        valueKey="value"
                        labelKey="label"
                        defaultValue=""
                        defaultCheckDisabled
                        defaultText="Select direction"
                      />
                    </div>
                    <div className="col-md-2">
                      <TextInput
                        label="Quantity"
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.quantity}
                        onChange={(event) =>
                          updateLine(index, {
                            quantity: Number(event.target.value ?? 0),
                          })
                        }
                        name={`lines.${index}.quantity`}
                      />
                    </div>
                    <div className="col-md-2">
                      <TextInput
                        label="Unit Cost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.unit_cost ?? ""}
                        onChange={(event) =>
                          updateLine(index, {
                            unit_cost: event.target.value
                              ? Number(event.target.value)
                              : null,
                          })
                        }
                        name={`lines.${index}.unit_cost`}
                      />
                    </div>
                    <div className="col-md-6">
                      <Select
                        label="Measurement"
                        name={`lines.${index}.product_measurement_id`}
                        value={line.product_measurement_id ?? 0}
                        onChange={(event) =>
                          updateLine(index, {
                            product_measurement_id: Number(event.target.value ?? 0) || null,
                          })
                        }
                        options={measurementOptions ?? []}
                        valueKey="value"
                        labelKey="label"
                        defaultValue={0}
                        defaultCheckDisabled
                        isDisabled={!measurementOptions?.length}
                      />
                    </div>
                    <div className="col-md-12 d-flex justify-content-end">
                      <Button
                        label="Remove"
                        variant="danger"
                        size="sm"
                        icon="ri-delete-bin-6-line"
                        handleClick={() => removeLine(index)}
                        isDisabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default InventoryAdjustment;
