import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
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

  // Get current content from global state
  const currentContent = useMemo(() => {
    const block = state.contents.find((content) => content.id === blockId);
    return block?.content?.invoice as InvoiceContentAreaProps;
  }, [blockId, state.contents]);

  // Helper function to calculate totals
  const calculateTotals = useCallback(
    (items: InvoiceItemResponseData[], markup: number) => {
      if (!items || items.length === 0) {
        return {
          sub_total: 0,
          total: 0,
          vat: 0,
          service_charge: 0,
        };
      }

      const sub_total = items.reduce(
        (acc: number, item: InvoiceItemResponseData) =>
          acc + (item.total_amount || 0),
        0
      );

      let vat_amount = 0;
      let service_charge_amount = 0;

      if (markup === 0) {
        vat_amount = sub_total * vatRate;
      } else if (markup > 0) {
        service_charge_amount = sub_total * (markup / 100);
        vat_amount = service_charge_amount * vatRate;
      }

      const total = sub_total + vat_amount + service_charge_amount;

      return {
        sub_total,
        total,
        vat: vat_amount,
        service_charge: service_charge_amount,
      };
    },
    [vatRate]
  );

  // Initialize global state if it doesn't exist
  useEffect(() => {
    if (blockId && !currentContent && project) {
      const initialItems = project.invoice?.items ?? [];
      const initialTotals = calculateTotals(initialItems, 0); // Start with 0 markup

      const initialInvoiceData: InvoiceContentAreaProps = {
        invoice: project.invoice ?? null,
        project,
        items: initialItems,
        ...initialTotals,
        markup: 0, // Start with 0 markup for new blocks
        currency:
          (project.invoice?.currency as "NGN" | "USD" | "EUR" | "GBP" | "NA") ??
          "NGN",
      };

      actions.updateContent(blockId, initialInvoiceData, "invoice");
    }
  }, [blockId, currentContent, project, actions, calculateTotals]);

  // Helper function to update global state
  const updateGlobalState = useCallback(
    (updates: Partial<InvoiceContentAreaProps>) => {
      if (!blockId || !currentContent) return;

      const updatedContent = {
        ...currentContent,
        ...updates,
      };

      actions.updateContent(blockId, updatedContent, "invoice");
    },
    [blockId, currentContent, actions]
  );

  const handleBlockChange = useCallback(
    (detail: unknown, mode?: "store" | "update") => {
      try {
        if (!currentContent || !blockId) return;

        const currentItems = currentContent.items ?? [];

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

        // Calculate new totals based on updated items
        // Preserve the existing markup value to prevent resetting to 0
        const currentMarkup = currentContent.markup || 0;
        const totals = calculateTotals(newItems, currentMarkup);

        const updatedContent = {
          ...currentContent,
          items: newItems,
          ...totals,
          markup: currentMarkup, // Explicitly preserve the markup AFTER totals
          invoice: {
            ...(currentContent.invoice as InvoiceResponseData),
            items: newItems,
          } as InvoiceResponseData,
        };

        // Update global state immediately
        actions.updateContent(blockId, updatedContent, "invoice");

        // Also update parent component
        updateLocal(updatedContent, identifier);

        closeModal();
      } catch (error) {
        console.error("Error updating invoice:", error);
      }
    },
    [
      currentContent,
      calculateTotals,
      actions,
      blockId,
      updateLocal,
      identifier,
      closeModal,
    ]
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
            blockState: currentContent || {
              invoice: null,
              project: null,
              items: [],
              sub_total: 0,
              total: 0,
              vat: 0,
              service_charge: 0,
              markup: 0,
              currency: "NGN",
            },
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
    [project, identifier, handleBlockChange, openBlock, currentContent]
  );

  const handleMarkupChange = useCallback(
    (value: number) => {
      if (!currentContent || !blockId) return;

      // Calculate new totals based on updated markup
      const totals = calculateTotals(currentContent.items, value);

      const updatedContent = {
        ...currentContent,
        markup: value,
        ...totals,
      };

      // Update global state immediately
      actions.updateContent(blockId, updatedContent, "invoice");
    },
    [currentContent, blockId, actions, calculateTotals]
  );

  const handleRemoveItem = useCallback(
    (itemId: number) => {
      if (!currentContent || !blockId) return;

      const newItems = currentContent.items.filter(
        (item) => item.id !== itemId
      );

      // Calculate new totals based on updated items
      // Preserve the existing markup value to prevent resetting to 0
      const currentMarkup = currentContent.markup || 0;
      const totals = calculateTotals(newItems, currentMarkup);

      const updatedContent = {
        ...currentContent,
        items: newItems,
        ...totals,
        markup: currentMarkup, // Explicitly preserve the markup AFTER totals
      };

      // Update global state immediately
      actions.updateContent(blockId, updatedContent, "invoice");
    },
    [currentContent, blockId, actions, calculateTotals]
  );

  // Update project when resource changes
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
          value={currentContent?.markup ?? 0}
          onChange={(e) => handleMarkupChange(Number(e.target.value))}
          type="number"
          min={0}
          max={100}
        />
      </div>
      <div className="col-md-12 mb-3">
        <div className="invoice__items">
          {(currentContent?.items ?? []).map((item) => (
            <div key={item.id} className="invoice__item__card">
              <div className="invoice__item__content">
                <div className="invoice__item__description">
                  {item.description || "No description"}
                </div>
                <div className="invoice__item__amount">
                  {formatCurrency(
                    item.total_amount,
                    currentContent?.currency as
                      | "NGN"
                      | "USD"
                      | "GBP"
                      | undefined
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
          {(currentContent?.items ?? []).length === 0 && (
            <div className="invoice__item__empty">
              <p>No invoice items added yet.</p>
            </div>
          )}
        </div>
      </div>
      <div className="col-md-12 mb-3">
        <div className="invoice-summary">
          <p>
            <strong>Sub Total:</strong> {currentContent?.currency ?? "NGN"}{" "}
            {(currentContent?.sub_total ?? 0).toFixed(2)}
          </p>
          <p>
            <strong>Service Charge ({currentContent?.markup ?? 0}%):</strong>{" "}
            {currentContent?.currency ?? "NGN"}{" "}
            {(currentContent?.service_charge ?? 0).toFixed(2)}
          </p>
          <p>
            <strong>VAT:</strong> {currentContent?.currency ?? "NGN"}{" "}
            {(currentContent?.vat ?? 0).toFixed(2)}
          </p>
          <p>
            <strong>Total:</strong> {currentContent?.currency ?? "NGN"}{" "}
            {(currentContent?.total ?? 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBlock;
