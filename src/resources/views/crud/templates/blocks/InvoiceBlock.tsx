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
import { useTemplateBoard } from "app/Context/TemplateBoardContext";

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
  blockId,
}) => {
  const { state, actions } = useTemplateBoard();
  const { openBlock, closeModal } = useModal();
  const vatRate = 0.075;
  const identifier: BlockDataType = "invoice";
  const [project, setProject] = useState<ProjectResponseData | null>(null);

  // Find the current block content from global state
  const currentBlock = state.contents.find((content) => content.id === blockId);
  const currentContent = currentBlock?.content
    ?.invoice as InvoiceContentAreaProps;

  const [localState, setLocalState] = useState<InvoiceContentAreaProps>({
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
    if (!localState.items || localState.items.length === 0) {
      return {
        sub_total: 0,
        total: 0,
        vat: 0,
        service_charge: 0,
      };
    }

    let vat_amount: number = 0;
    let service_charge_amount: number = 0;

    const sub_total = localState.items.reduce(
      (acc, item) => acc + (item.total_amount || 0),
      0
    );

    if (localState.markup === 0) {
      vat_amount = sub_total * vatRate;
    } else if (localState.markup > 0) {
      service_charge_amount = sub_total * (localState.markup / 100);
      vat_amount = service_charge_amount * vatRate;
    }

    const total = sub_total + vat_amount + service_charge_amount;

    return {
      sub_total,
      total,
      vat: vat_amount,
      service_charge: service_charge_amount,
    };
  }, [localState.items, localState.markup, vatRate]);

  // Use calculated totals for display and parent updates
  const displayState = useMemo(
    () => ({
      ...localState,
      ...calculatedTotals,
    }),
    [localState, calculatedTotals]
  );

  // Update parent component with calculated totals when they change
  useEffect(() => {
    // Update global state
    if (blockId) {
      actions.updateContent(blockId, displayState, "invoice");
    }

    // Also update local state for backward compatibility
    updateLocal(displayState, identifier);
  }, [displayState, updateLocal, identifier, blockId, actions]);

  const handleBlockChange = useCallback(
    (detail: unknown, mode?: "store" | "update") => {
      try {
        setLocalState((prev) => {
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

          // Update global state
          if (blockId) {
            actions.updateContent(blockId, updatedState, "invoice");
          }

          // Update parent component immediately with the new state
          updateLocal(updatedState, identifier);

          return updatedState;
        });

        closeModal();
      } catch (error) {
        console.error("Error updating invoice:", error);
      }
    },
    [updateLocal, identifier, closeModal, blockId, actions]
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
            blockState: localState,
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
    [project, identifier, localState, handleBlockChange, openBlock]
  );

  const handleMarkupChange = useCallback(
    (value: number) => {
      const updatedState: InvoiceContentAreaProps = {
        ...localState,
        markup: value,
      };
      setLocalState(updatedState);

      // Update global state
      if (blockId) {
        actions.updateContent(blockId, updatedState, "invoice");
      }

      updateLocal(updatedState, identifier);
    },
    [localState, updateLocal, identifier, blockId, actions]
  );

  const handleRemoveItem = useCallback(
    (itemId: number) => {
      const updatedState: InvoiceContentAreaProps = {
        ...localState,
        items: localState.items.filter((item) => item.id !== itemId),
      };
      setLocalState(updatedState);

      // Update global state
      if (blockId) {
        actions.updateContent(blockId, updatedState, "invoice");
      }

      updateLocal(updatedState, identifier);
    },
    [localState, updateLocal, identifier, blockId, actions]
  );

  useEffect(() => {
    if (currentContent) {
      setLocalState((prev) => ({
        ...prev,
        ...currentContent,
        project: currentContent.project ?? project,
      }));
    } else if (project) {
      setLocalState((prev) => ({
        ...prev,
        invoice: project.invoice ?? prev.invoice,
        items: project.invoice?.items ?? prev.items,
        project,
      }));
    }
  }, [currentContent, project]);

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
          value={localState.markup}
          onChange={(e) => handleMarkupChange(Number(e.target.value))}
          type="number"
          min={0}
          max={100}
        />
      </div>
      <div className="col-md-12 mb-3">
        <div className="invoice__items">
          {localState.items.map((item) => (
            <div key={item.id} className="invoice__item__card">
              <div className="invoice__item__content">
                <div className="invoice__item__description">
                  {item.description || "No description"}
                </div>
                <div className="invoice__item__amount">
                  {formatCurrency(
                    item.total_amount,
                    localState.currency as "NGN" | "USD" | "GBP" | undefined
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
          {localState.items.length === 0 && (
            <div className="invoice__item__empty">
              <p>No invoice items added yet.</p>
            </div>
          )}
        </div>
      </div>
      <div className="col-md-12 mb-3">
        <div className="invoice-summary">
          <p>
            <strong>Sub Total:</strong> {localState.currency}{" "}
            {localState.sub_total.toFixed(2)}
          </p>
          <p>
            <strong>Service Charge ({localState.markup}%):</strong>{" "}
            {localState.currency} {localState.service_charge.toFixed(2)}
          </p>
          <p>
            <strong>VAT:</strong> {localState.currency}{" "}
            {localState.vat.toFixed(2)}
          </p>
          <p>
            <strong>Total:</strong> {localState.currency}{" "}
            {localState.total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBlock;
