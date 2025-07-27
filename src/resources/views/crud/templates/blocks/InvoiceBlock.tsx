import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BlockContentComponentPorps } from ".";
import { BlockDataType } from "@/app/Repositories/Block/data";
import { useModal } from "app/Context/ModalContext";
import { ProjectResponseData } from "@/app/Repositories/Project/data";
import { InvoiceContentAreaProps } from "@/app/Hooks/useBuilder";
import {
  InvoiceItemResponseData,
  InvoiceResponseData,
} from "@/app/Repositories/Invoice/data";
import InvoiceBlockModal from "../../modals/blocks/InvoiceBlockModal";
import Button from "resources/views/components/forms/Button";
import TextInput from "resources/views/components/forms/TextInput";
import { formatCurrency } from "app/Support/Helpers";

// Type guards for better type safety
const isProject = (resource: unknown): resource is ProjectResponseData => {
  return Boolean(
    resource && typeof resource === "object" && "invoice" in resource
  );
};

const isInvoiceItem = (detail: unknown): detail is InvoiceItemResponseData => {
  return Boolean(detail && typeof detail === "object" && "id" in detail);
};

const generateUniqueId = (existingItems: InvoiceItemResponseData[]): number => {
  const maxId = Math.max(...existingItems.map((item) => item.id || 0), 0);
  return maxId + 1;
};

const InvoiceBlock: React.FC<BlockContentComponentPorps> = ({
  resource,
  localContentState,
  updateLocal,
}) => {
  const { openBlock, closeModal } = useModal();
  const vatRate = 0.075;
  const identifier: BlockDataType = "invoice";
  const [project, setProject] = useState<ProjectResponseData | null>(null);

  const [state, setState] = useState<InvoiceContentAreaProps>({
    invoice: project?.invoice ?? null,
    project,
    items: project?.invoice?.items ?? [],
    sub_total: 0,
    total: 0,
    vat: 0,
    service_charge: 0,
    markup: 0,
    currency:
      (project?.invoice?.currency as "NGN" | "USD" | "EUR" | "GBP" | "NA") ??
      "NGN",
  });

  // Calculate totals whenever items or markup changes
  const calculatedTotals = useMemo(() => {
    if (!state.items || state.items.length === 0) {
      return {
        sub_total: 0,
        total: 0,
        vat: 0,
        service_charge: 0,
      };
    }

    let vat_amount: number = 0;
    let service_charge_amount: number = 0;

    const sub_total = state.items.reduce(
      (acc, item) => acc + (item.total_amount || 0),
      0
    );

    if (state.markup === 0) {
      vat_amount = sub_total * vatRate;
    } else if (state.markup > 0) {
      service_charge_amount = sub_total * (state.markup / 100);
      vat_amount = service_charge_amount * vatRate;
    }

    const total = sub_total + vat_amount + service_charge_amount;

    return {
      sub_total,
      total,
      vat: vat_amount,
      service_charge: service_charge_amount,
    };
  }, [state.items, state.markup, vatRate]);

  // Update state with calculated totals
  useEffect(() => {
    const updatedState: InvoiceContentAreaProps = {
      ...state,
      ...calculatedTotals,
    };
    setState(updatedState);
    updateLocal(updatedState, identifier);
  }, [calculatedTotals]);

  const handleBlockChange = useCallback(
    (detail: unknown, mode?: "store" | "update") => {
      console.log(detail);

      try {
        // if (!isInvoiceItem(detail)) {
        //   console.error("Invalid invoice item data received");
        //   return;
        // }

        setState((prev) => {
          const currentItems = prev.items ?? [];

          const newItems =
            mode === "store"
              ? [
                  ...currentItems,
                  {
                    ...(detail as InvoiceItemResponseData),
                    id: generateUniqueId(currentItems),
                  },
                ]
              : currentItems.map((item) =>
                  item.id === (detail as InvoiceItemResponseData).id
                    ? (detail as InvoiceItemResponseData)
                    : item
                );

          const updatedState = {
            ...prev,
            items: newItems,
            invoice: {
              ...(prev.invoice as InvoiceResponseData),
              items: newItems,
            } as InvoiceResponseData,
          };

          // Update parent component immediately with the new state
          updateLocal(updatedState, identifier);

          return updatedState;
        });

        closeModal();
      } catch (error) {
        console.error("Error updating invoice:", error);
      }
    },
    [updateLocal, identifier, closeModal]
  );

  const handleInvoiceChange = useCallback(
    (item?: InvoiceItemResponseData) => {
      try {
        if (!project) {
          console.error("No project available for invoice operations");
          return;
        }

        openBlock(
          InvoiceBlockModal,
          {
            title: item ? "Update Invoice Item" : "Add Invoice Item",
            type: identifier,
            blockState: state,
            data: item,
            isUpdating: !!item,
            addBlockComponent: handleBlockChange,
            dependencies: {
              partials: [],
              extras: {
                project,
              },
            },
          },
          identifier
        );
      } catch (error) {
        console.error("Error opening invoice modal:", error);
      }
    },
    [project, identifier, state, handleBlockChange, openBlock]
  );

  const handleMarkupChange = useCallback(
    (value: number) => {
      const updatedState: InvoiceContentAreaProps = {
        ...state,
        markup: value,
      };
      setState(updatedState);
      updateLocal(updatedState, identifier);
    },
    [state, updateLocal, identifier]
  );

  const handleRemoveItem = useCallback(
    (itemId: number) => {
      const updatedState: InvoiceContentAreaProps = {
        ...state,
        items: state.items.filter((item) => item.id !== itemId),
      };
      setState(updatedState);
      updateLocal(updatedState, identifier);
    },
    [state, updateLocal, identifier]
  );

  useEffect(() => {
    if (project) {
      setState((prev) => ({
        ...prev,
        invoice: project.invoice ?? prev.invoice,
        items: project.invoice?.items ?? prev.items,
        project,
      }));
    }
  }, [project]);

  useEffect(() => {
    if (resource) {
      setProject(resource as ProjectResponseData);
    }
  }, [resource]);

  // Early return if no project
  if (!project) {
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="alert alert-warning">
            No project data available for invoice operations.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-md-12 mb-4">
        <div className="flex end align">
          <Button
            label="Add Invoice Item"
            icon="ri-add-line"
            handleClick={() => handleInvoiceChange()}
            variant="info"
            size="xs"
          />
        </div>
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Service Charge %"
          value={state.markup}
          onChange={(e) => handleMarkupChange(Number(e.target.value))}
          type="number"
          min={0}
          max={100}
        />
      </div>
      <div className="col-md-12 mb-3">
        <div className="invoice__items">
          {state.items.map((item) => (
            <div key={item.id} className="invoice__item__card">
              <div className="invoice__item__content">
                <div className="invoice__item__description">
                  {item.description || "No description"}
                </div>
                <div className="invoice__item__amount">
                  {formatCurrency(
                    item.total_amount,
                    state.currency as "NGN" | "USD" | "GBP" | undefined
                  )}
                </div>
              </div>
              <div className="invoice__item__actions">
                <button
                  className="invoice__item__remove"
                  onClick={() => handleRemoveItem(item.id)}
                  title="Remove item"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          ))}
          {state.items.length === 0 && (
            <div className="invoice__item__empty">
              <p>No invoice items added yet.</p>
            </div>
          )}
        </div>
      </div>
      <div className="col-md-12 mb-3">
        <div className="invoice-summary">
          <p>
            <strong>Sub Total:</strong> {state.currency}{" "}
            {state.sub_total.toFixed(2)}
          </p>
          <p>
            <strong>Service Charge ({state.markup}%):</strong> {state.currency}{" "}
            {state.service_charge.toFixed(2)}
          </p>
          <p>
            <strong>VAT:</strong> {state.currency} {state.vat.toFixed(2)}
          </p>
          <p>
            <strong>Total:</strong> {state.currency} {state.total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBlock;
