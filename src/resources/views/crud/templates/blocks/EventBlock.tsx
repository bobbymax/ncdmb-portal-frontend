import React, { useEffect, useState } from "react";
import { BlockContentComponentPorps } from ".";
import { EventContentAreaProps } from "app/Hooks/useBuilder";
import { BlockDataType } from "app/Repositories/Block/data";
import TextInput from "resources/views/components/forms/TextInput";
import Textarea from "resources/views/components/forms/Textarea";
import Select from "resources/views/components/forms/Select";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";

const EventBlock: React.FC<BlockContentComponentPorps> = ({
  localContentState,
  updateLocal,
  blockId,
}) => {
  const { state, actions } = useTemplateBoard();
  const identifier: BlockDataType = "event";

  // Find the current block content from global state
  const currentBlock = state.contents.find((content) => content.id === blockId);
  const currentContent = currentBlock?.content?.event as EventContentAreaProps;

  const [localState, setLocalState] = useState<EventContentAreaProps>({
    name: "",
    venue: "",
    start_date: "",
    end_date: "",
    start_time: "",
    address: "",
    location: "",
    type: "local",
    currency: "NGN",
    source: "vendors",
    vendor_name: "",
    country: "",
    estacode: "USD",
  });

  const handleResult = (data: EventContentAreaProps) => {
    setLocalState((prev) => ({
      ...prev,
      ...data,
    }));

    // Update global state directly
    if (currentBlock) {
      actions.updateContent(currentBlock.id, data, identifier);
    }

    // Also update local state in parent for compatibility
    updateLocal(data, identifier);
  };

  useEffect(() => {
    if (currentContent) {
      setLocalState((prev) => ({
        ...prev,
        ...currentContent,
      }));
    } else if (localContentState?.event) {
      setLocalState((prev) => ({
        ...prev,
        ...localContentState.event,
      }));
    }
  }, [currentContent, localContentState?.event]);

  return (
    <div className="row">
      <div className="col-md-12 mb-2">
        <TextInput
          label="Event Name"
          name="name"
          value={localState.name}
          onChange={(e) =>
            handleResult({ ...localState, name: e.target.value })
          }
          placeholder="Enter the name of the event"
        />
      </div>
      <div className="col-md-12 mb-2">
        <TextInput
          label="Venue"
          name="venue"
          value={localState.venue}
          onChange={(e) =>
            handleResult({ ...localState, venue: e.target.value })
          }
          placeholder="Enter the venue of the event"
        />
      </div>
      <div className="col-md-6 mb-2">
        <TextInput
          label="Start Date"
          name="start_date"
          type="date"
          value={localState.start_date}
          onChange={(e) =>
            handleResult({ ...localState, start_date: e.target.value })
          }
        />
      </div>
      <div className="col-md-6 mb-2">
        <TextInput
          label="End Date"
          name="end_date"
          type="date"
          value={localState.end_date}
          onChange={(e) =>
            handleResult({ ...localState, end_date: e.target.value })
          }
        />
      </div>
      <div className="col-md-4 mb-2">
        <TextInput
          label="Time"
          name="start_time"
          type="time"
          value={localState.start_time}
          onChange={(e) =>
            handleResult({ ...localState, start_time: e.target.value })
          }
        />
      </div>
      <div className="col-md-8 mb-2">
        <TextInput
          label="Vendor"
          name="vendor_name"
          value={localState.vendor_name}
          onChange={(e) =>
            handleResult({ ...localState, vendor_name: e.target.value })
          }
          placeholder="Enter Vendor Name"
        />
      </div>
      <div className="col-md-6 mb-2">
        <Select
          label="Currency"
          name="currency"
          value={localState.currency}
          valueKey="value"
          labelKey="label"
          onChange={(e) =>
            handleResult({
              ...localState,
              currency: e.target.value as "NGN" | "USD" | "EUR" | "GBP" | "NA",
            })
          }
          options={[
            { value: "NGN", label: "Naira (NGN)" },
            { value: "USD", label: "Dollar (USD)" },
            { value: "EUR", label: "Euro (EUR)" },
            { value: "GBP", label: "Pound (GBP)" },
            { value: "NA", label: "Not Applicable" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-6 mb-2">
        <Select
          label="Estacode"
          name="estacode"
          value={localState.estacode}
          valueKey="value"
          labelKey="label"
          onChange={(e) =>
            handleResult({
              ...localState,
              estacode: e.target.value as "NGN" | "USD" | "EUR" | "GBP" | "NA",
            })
          }
          options={[
            { value: "NGN", label: "Naira (NGN)" },
            { value: "USD", label: "Dollar (USD)" },
            { value: "EUR", label: "Euro (EUR)" },
            { value: "GBP", label: "Pound (GBP)" },
            { value: "NA", label: "Not Applicable" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-12 mb-2">
        <Textarea
          label="Address"
          name="address"
          rows={3}
          value={localState.address}
          onChange={(e) =>
            handleResult({ ...localState, address: e.target.value })
          }
          placeholder="Enter the address of the event"
        />
      </div>
    </div>
  );
};

export default EventBlock;
