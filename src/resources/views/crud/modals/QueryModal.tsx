import React, { useState } from "react";
import { ModalValueProps } from "app/Context/ModalContext";
import Textarea from "resources/views/components/forms/Textarea";
import Select from "resources/views/components/forms/Select";
import Button from "resources/views/components/forms/Button";

interface QueryFormData {
  message: string;
  priority: "low" | "medium" | "high";
}

const QueryModal: React.FC<ModalValueProps<QueryFormData>> = ({
  title,
  data,
  isUpdating,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<QueryFormData>({
    message: data?.message || "",
    priority: data?.priority || "medium",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      alert("Please enter a query message");
      return;
    }

    onSubmit(
      {
        ...formData,
        timestamp: new Date().toISOString(),
      },
      isUpdating ? "update" : "store"
    );
  };

  const priorityOptions = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" },
  ];

  return (
    <form onSubmit={handleSubmit} className="query-modal-form">
      <div className="mb-3">
        <Textarea
          label="Query Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Describe the issue or question about this payment..."
          rows={5}
        />
      </div>

      <div className="mb-3">
        <Select
          label="Priority Level"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={priorityOptions}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultText="Select priority..."
        />
      </div>

      <div className="d-flex justify-content-end gap-2">
        <Button
          type="submit"
          label={isUpdating ? "Update Query" : "Add Query"}
          variant="warning"
          icon="ri-question-line"
        />
      </div>
    </form>
  );
};

export default QueryModal;
