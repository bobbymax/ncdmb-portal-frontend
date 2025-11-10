import { InventoryLocationResponseData } from "@/app/Repositories/InventoryLocation/data";
import {
  InventoryIssueItemPayload,
  InventoryIssueResponseData,
} from "@/app/Repositories/InventoryIssue/data";
import { FormPageComponentProps } from "bootstrap";
import { formatOptions } from "app/Support/Helpers";
import React, { useEffect, useMemo, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import Select from "../components/forms/Select";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";

interface RequisitionItem {
  id: number;
  product_id: number;
  product?: { name: string };
  product_measurement_id?: number | null;
  measurement?: { name: string } | null;
  quantity_requested?: number;
  quantity_issued?: number;
}

interface RequisitionSummary {
  id: number;
  code: string;
  user_id?: number | null;
  user?: { id: number; name: string } | null;
  staff?: { id: number; name: string } | null;
  department?: { name: string } | null;
  items?: RequisitionItem[];
}

interface DependencyProps {
  requisitions: RequisitionSummary[];
  locations: InventoryLocationResponseData[];
  products: Array<{ id: number; name: string }>;
}

const InventoryIssue: React.FC<
  FormPageComponentProps<InventoryIssueResponseData>
> = ({ state, setState, handleChange, dependencies, loading, mode }) => {
  const { requisitions = [], locations = [] } = useMemo(
    () => (dependencies || {}) as DependencyProps,
    [dependencies]
  );

  const [selectedRequisition, setSelectedRequisition] =
    useState<RequisitionSummary | null>(null);
  const [locationOption, setLocationOption] =
    useState<DataOptionsProps | null>(null);

  useEffect(() => {
    if (mode === "update" && requisitions.length && state.requisition_id) {
      const match = requisitions.find((req) => req.id === state.requisition_id);
      if (match) {
        setSelectedRequisition(match);
      }
    }
  }, [mode, requisitions, state.requisition_id]);

  useEffect(() => {
    if (mode === "update" && locations.length && state.from_location_id) {
      const match = locations.find((loc) => loc.id === state.from_location_id);
      if (match) {
        setLocationOption({ value: match.id, label: match.name });
      }
    }
  }, [mode, locations, state.from_location_id]);

  const requisitionOptions = useMemo(
    () =>
      requisitions.map((req) => ({
        value: req.id,
        label: `${req.code}`,
      })),
    [requisitions]
  );

  const locationOptions = useMemo(
    () => formatOptions(locations, "id", "name"),
    [locations]
  );

  const updateItem = (index: number, payload: Partial<InventoryIssueItemPayload>) => {
    setState?.((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...payload };
      return { ...prev, items };
    });
  };

  const handleRequisitionChange = (option: unknown) => {
    const value = option as DataOptionsProps | null;
    const selected = requisitions.find((req) => req.id === (value?.value ?? 0)) ?? null;
    setSelectedRequisition(selected);

    setState?.((prev) => ({
      ...prev,
      requisition_id: selected?.id ?? 0,
      issued_to: selected?.staff?.id ?? selected?.user_id ?? null,
      items: (selected?.items ?? []).map((item) => ({
        requisition_item_id: item.id,
        product_id: item.product_id,
        product_name: item.product?.name ?? "",
        product_measurement_id: item.product_measurement_id ?? null,
        measurement_label: item.measurement?.name ?? "—",
        quantity: Math.max(
          Number(item.quantity_requested ?? 0) - Number(item.quantity_issued ?? 0),
          0
        ),
        unit_cost: null,
        batch_id: null,
      })),
    }));
  };

  return (
    <>
      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Requisition"
          value={
            selectedRequisition
              ? {
                  value: selectedRequisition.id,
                  label: selectedRequisition.code,
                }
              : null
          }
          onChange={handleRequisitionChange}
          options={requisitionOptions}
          placeholder="Select requisition"
          isDisabled={loading}
          isSearchable
        />
      </div>

      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Issue From Location"
          value={locationOption}
          onChange={(option) => {
            const value = option as DataOptionsProps | null;
            setLocationOption(value);
            setState?.((prev) => ({
              ...prev,
              from_location_id: (value?.value as number) ?? 0,
            }));
          }}
          options={locationOptions}
          placeholder="Select store"
          isDisabled={loading}
          isSearchable
        />
      </div>

      <div className="col-md-4 mb-3">
        <Select
          label="Recipient"
          name="issued_to"
          value={state.issued_to ?? ""}
          onChange={handleChange}
          options={
            selectedRequisition?.staff?.id
              ? [{
                  label: selectedRequisition.staff.name,
                  value: selectedRequisition.staff.id,
                }]
              : selectedRequisition?.user
              ? [{ label: selectedRequisition.user.name, value: selectedRequisition.user.id }]
              : []
          }
          valueKey="value"
          labelKey="label"
          defaultValue=""
          isDisabled={!selectedRequisition}
          defaultCheckDisabled
        />
        <small className="text-muted">
          Defaults to requisition owner when available.
        </small>
      </div>

      <div className="col-md-4 mb-3">
        <TextInput
          label="Issuance Date"
          name="issued_at"
          type="datetime-local"
          value={state.issued_at ? state.issued_at.slice(0, 16) : ""}
          onChange={handleChange}
        />
      </div>

      <div className="col-md-4 mb-3">
        <TextInput
          label="Reference"
          name="reference"
          value={state.reference ?? ""}
          onChange={handleChange}
          placeholder="Auto generated"
          isDisabled
        />
      </div>

      <div className="col-md-12 mb-3">
        <Textarea
          label="Remarks"
          name="remarks"
          value={state.remarks ?? ""}
          onChange={handleChange}
          rows={3}
          placeholder="Optional notes"
        />
      </div>

      <div className="col-md-12">
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <strong>Items to Issue</strong>
          </div>
          <div className="card-body p-0">
            {state.items.length === 0 ? (
              <div className="p-4 text-center text-muted">
                Select a requisition to load request lines.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-borderless align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "25%" }}>Product</th>
                      <th style={{ width: "15%" }}>Measurement</th>
                      <th style={{ width: "15%" }}>Quantity</th>
                      <th style={{ width: "15%" }}>Unit Cost</th>
                      <th style={{ width: "15%" }}>Total</th>
                      <th style={{ width: "15%" }} className="text-end">
                        Remaining
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.items.map((item, index) => {
                      const requested = selectedRequisition?.items?.find(
                        (reqItem) => reqItem.id === item.requisition_item_id
                      );
                      const outstanding = Math.max(
                        Number(requested?.quantity_requested ?? 0) -
                          Number(requested?.quantity_issued ?? 0),
                        0
                      );

                      return (
                        <tr key={`${item.requisition_item_id}-${index}`}>
                          <td>
                            <strong>{item.product_name}</strong>
                          </td>
                          <td>{item.measurement_label ?? "—"}</td>
                          <td>
                            <TextInput
                              type="number"
                              name={`items.${index}.quantity`}
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(event) =>
                                updateItem(index, {
                                  quantity: Number(event.target.value ?? 0),
                                })
                              }
                            />
                          </td>
                          <td>
                            <TextInput
                              type="number"
                              name={`items.${index}.unit_cost`}
                              min="0"
                              step="0.01"
                              value={item.unit_cost ?? ""}
                              onChange={(event) =>
                                updateItem(index, {
                                  unit_cost: event.target.value
                                    ? Number(event.target.value)
                                    : null,
                                })
                              }
                              placeholder="0.00"
                            />
                          </td>
                          <td>
                            ₦
                            {((item.unit_cost ?? 0) * Number(item.quantity ?? 0)).toFixed(2)}
                          </td>
                          <td className="text-end">
                            <small className="text-muted">
                              Outstanding: {outstanding.toFixed(2)}
                            </small>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InventoryIssue;
