import React, { useEffect, useState } from "react";
import { BlockContentComponentPorps } from ".";
import { EventContentAreaProps } from "app/Hooks/useBuilder";
import { BlockDataType } from "app/Repositories/Block/data";
import TextInput from "resources/views/components/forms/TextInput";
import Textarea from "resources/views/components/forms/Textarea";
import Select from "resources/views/components/forms/Select";

const EventBlock: React.FC<BlockContentComponentPorps> = ({
  localContentState,
  updateLocal,
}) => {
  const identifier: BlockDataType = "event";
  const [state, setState] = useState<EventContentAreaProps>({
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
    setState((prev) => ({
      ...prev,
      ...data,
    }));

    updateLocal(data, identifier);
  };

  useEffect(() => {
    if (localContentState?.event) {
      setState((prev) => ({
        ...prev,
        ...localContentState.event,
      }));
    }
  }, [localContentState?.event]);

  return (
    <div className="row">
      <div className="col-md-12 mb-2">
        <TextInput
          label="Event Name"
          name="name"
          value={state.name}
          onChange={(e) => handleResult({ ...state, name: e.target.value })}
          placeholder="Enter the name of the event"
        />
      </div>
      <div className="col-md-12 mb-2">
        <TextInput
          label="Venue"
          name="venue"
          value={state.venue}
          onChange={(e) => handleResult({ ...state, venue: e.target.value })}
          placeholder="Enter the venue of the event"
        />
      </div>
      <div className="col-md-6 mb-2">
        <TextInput
          label="Start Date"
          name="start_date"
          type="date"
          value={state.start_date}
          onChange={(e) =>
            handleResult({ ...state, start_date: e.target.value })
          }
        />
      </div>
      <div className="col-md-6 mb-2">
        <TextInput
          label="End Date"
          name="end_date"
          type="date"
          value={state.end_date}
          onChange={(e) => handleResult({ ...state, end_date: e.target.value })}
        />
      </div>
      <div className="col-md-4 mb-2">
        <TextInput
          label="Time"
          name="start_time"
          type="time"
          value={state.start_time}
          onChange={(e) =>
            handleResult({ ...state, start_time: e.target.value })
          }
        />
      </div>
      <div className="col-md-8 mb-2">
        <TextInput
          label="Vendor"
          name="vendor_name"
          value={state.vendor_name}
          onChange={(e) =>
            handleResult({ ...state, vendor_name: e.target.value })
          }
          placeholder="Enter Vendor Name"
        />
      </div>
      <div className="col-md-6 mb-2">
        <Select
          label="Currency"
          name="currency"
          value={state.currency}
          valueKey="value"
          labelKey="label"
          onChange={(e) =>
            handleResult({
              ...state,
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
          value={state.estacode}
          valueKey="value"
          labelKey="label"
          onChange={(e) =>
            handleResult({
              ...state,
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
          value={state.address}
          onChange={(e) => handleResult({ ...state, address: e.target.value })}
          placeholder="Enter the address of the event"
        />
      </div>
    </div>
  );
};

export default EventBlock;
