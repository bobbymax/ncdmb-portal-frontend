import { BlockModalProps, useModal } from "app/Context/ModalContext";
import useFormOnChangeEvents from "app/Hooks/useFormOnChangeEvents";
import { ProjectResponseData } from "app/Repositories/Project/data";
import React, { useEffect, useMemo } from "react";
import { InvoiceItemResponseData } from "@/app/Repositories/Invoice/data";
import TextInput from "resources/views/components/forms/TextInput";
import Textarea from "resources/views/components/forms/Textarea";
import Button from "resources/views/components/forms/Button";

export type InvoiceBlockProps = {
  project: ProjectResponseData;
};

export type InvoiceExtraProps = {
  extras: InvoiceBlockProps;
};

const InvoiceBlockModal: React.FC<BlockModalProps<"invoice">> = ({
  type,
  data,
  isUpdating,
  addBlockComponent,
  dependencies,
}) => {
  const { getModalState } = useModal();
  const invoiceItemState: InvoiceItemResponseData = getModalState(type);
  const { state, handleChange, setState } =
    useFormOnChangeEvents(invoiceItemState);
  const { project } = useMemo(() => {
    const { extras = {} } = (dependencies ?? {}) as InvoiceExtraProps;
    const extraObjs = extras as InvoiceBlockProps;

    return {
      project: extraObjs.project ?? null,
    };
  }, [dependencies]);

  useEffect(() => {
    if (state.qty && state.unit_price) {
      const unitPrice = Number(state.unit_price);
      const qty = Number(state.qty);
      const totalAmount = unitPrice * qty;
      setState((prev) => ({
        ...prev,
        total_amount: totalAmount,
      }));
    }
  }, [state.qty, state.unit_price]);

  useEffect(() => {
    if (data) {
      setState((prev) => ({
        ...prev,
        ...(data as InvoiceItemResponseData),
      }));
    }
  }, [data]);

  return (
    <div className="row">
      <div className="col-md-12 mb-3">
        <Textarea
          value={state.description}
          onChange={handleChange}
          name="description"
          rows={4}
          placeholder="Description"
          label="Description"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          value={state.unit_price}
          onChange={handleChange}
          name="unit_price"
          placeholder="Unit Price"
          label="Unit Price"
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          value={state.qty}
          onChange={handleChange}
          name="qty"
          placeholder="Quantity"
          label="Quantity"
          type="number"
        />
      </div>
      <div className="col-md-5 mb-3">
        <TextInput
          value={state.total_amount}
          onChange={handleChange}
          name="total_amount"
          placeholder="Total Amount"
          label="Total Amount"
        />
      </div>
      <div className="col-md-12 mb-3">
        <Button
          handleClick={() => {
            addBlockComponent(state, isUpdating ? "update" : "store");
          }}
          label={isUpdating ? "Update Invoice Item" : "Add Invoice Item"}
          variant="dark"
          size="sm"
          icon={isUpdating ? "ri-door-open-line" : "ri-alarm-add-line"}
        />
      </div>
    </div>
  );
};

export default InvoiceBlockModal;
