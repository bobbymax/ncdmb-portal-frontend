import {
  SettingResponseData,
  SettingInputType,
  SettingInputDataType,
} from "@/app/Repositories/Setting/data";
import SettingRepository from "@/app/Repositories/Setting/SettingRepository";
import { CardPageComponentProps } from "@/bootstrap";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import TextInput from "resources/views/components/forms/TextInput";
import Textarea from "resources/views/components/forms/Textarea";
import Select from "resources/views/components/forms/Select";
import Box from "resources/views/components/forms/Box";
import Button from "../components/forms/Button";
import { toast } from "react-toastify";
import { useStateContext } from "app/Context/ContentContext";

export interface DataOptionsProps {
  value: any;
  label: string;
}

export type SiteConfigProps = {
  [key: string]: any;
};

const SiteConfig: React.FC<
  CardPageComponentProps<SettingResponseData, SettingRepository>
> = ({ Repository, collection: settings, onManageRawData, View }) => {
  const [config, setConfig] = useState<SiteConfigProps>({});

  // Initialize config with current settings values
  useEffect(() => {
    if (settings && settings.length > 0) {
      const initialConfig: SiteConfigProps = {};
      settings.forEach((setting) => {
        initialConfig[setting.key] = convertValueToDataType(
          setting.value,
          setting.input_data_type
        );
      });
      setConfig(initialConfig);
    }
  }, [settings]);

  // Convert string value to appropriate data type
  const convertValueToDataType = (
    value: string,
    dataType: SettingInputDataType
  ): any => {
    switch (dataType) {
      case "number":
        return value ? Number(value) : 0;
      case "boolean":
        return value === "true" || value === "1";
      case "object":
        try {
          return value ? JSON.parse(value) : {};
        } catch {
          return {};
        }
      case "array":
        try {
          return value ? JSON.parse(value) : [];
        } catch {
          return [];
        }
      default:
        return value || "";
    }
  };

  // Handle input changes
  const handleInputChange = (
    key: string,
    value: any,
    dataType: SettingInputDataType
  ) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Render form input based on input type
  const renderFormInput = (setting: SettingResponseData) => {
    const { key, name, input_type, input_data_type, value, is_disabled } =
      setting;
    const currentValue =
      config[key] !== undefined
        ? config[key]
        : convertValueToDataType(value, input_data_type);

    const handleChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const newValue =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      handleInputChange(key, newValue, input_data_type);
    };

    switch (input_type) {
      case "text":
      case "email":
      case "password":
        return (
          <TextInput
            label={name}
            type={input_type}
            value={currentValue}
            onChange={handleChange}
            placeholder={`Enter ${name.toLowerCase()}`}
            name={key}
            isDisabled={is_disabled === 1}
          />
        );

      case "number":
        return (
          <TextInput
            label={name}
            type="number"
            value={currentValue}
            onChange={(e) => {
              const numValue = Number(e.target.value);
              handleInputChange(key, numValue, input_data_type);
            }}
            name={key}
            isDisabled={is_disabled === 1}
          />
        );

      case "date":
        return (
          <TextInput
            label={name}
            type="date"
            value={currentValue}
            onChange={handleChange}
            name={key}
            isDisabled={is_disabled === 1}
          />
        );

      case "checkbox":
        return (
          <Box
            label={name}
            type="checkbox"
            name={key}
            isChecked={Boolean(currentValue)}
            onChange={(e) =>
              handleInputChange(key, e.target.checked, input_data_type)
            }
            isDisabled={is_disabled === 1}
          />
        );

      case "radio":
        return (
          <Box
            label={name}
            type="radio"
            name={key}
            isChecked={Boolean(currentValue)}
            onChange={(e) =>
              handleInputChange(key, e.target.checked, input_data_type)
            }
            isDisabled={is_disabled === 1}
          />
        );

      case "textarea":
        return (
          <Textarea
            label={name}
            value={currentValue}
            onChange={handleChange}
            placeholder={`Enter ${name.toLowerCase()}`}
            name={key}
            isDisabled={is_disabled === 1}
            rows={4}
          />
        );

      case "select": {
        // Parse options from setting.configuration
        const configuration = setting.configuration as
          | { options?: DataOptionsProps[] }
          | undefined;
        const selectOptions = configuration?.options || [];

        return (
          <Select
            label={name}
            value={currentValue}
            onChange={handleChange}
            name={key}
            isDisabled={is_disabled === 1}
            options={selectOptions}
            valueKey="value"
            labelKey="label"
            defaultText={`Select ${name}`}
            defaultValue=""
            defaultCheckDisabled
          />
        );
      }

      case "file": {
        const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              handleInputChange(key, dataUrl, input_data_type);
            };
            reader.readAsDataURL(file);
          }
        };

        return (
          <TextInput
            label={name}
            type="file"
            onChange={handleFileChange}
            name={key}
            isDisabled={is_disabled === 1}
          />
        );
      }

      default:
        return (
          <TextInput
            label={name}
            type="text"
            value={currentValue}
            onChange={handleChange}
            placeholder={`Enter ${name.toLowerCase()}`}
            name={key}
            isDisabled={is_disabled === 1}
          />
        );
    }
  };

  // Sort settings by order
  const sortedSettings = settings
    ? [...settings].sort((a, b) => a.order - b.order)
    : [];

  // Check if all required settings have values
  const isFormValid = () => {
    if (!settings || settings.length === 0) return false;

    return settings.every((setting) => {
      const value = config[setting.key];

      // Check if value exists and is not empty
      if (value === undefined || value === null) return false;

      // Handle different data types
      switch (setting.input_data_type) {
        case "string":
          return String(value).trim() !== "";
        case "number":
          return !isNaN(Number(value)) && Number(value) !== 0;
        case "boolean":
          return true; // Boolean values are always valid (true/false)
        case "object":
        case "array":
          return Object.keys(value).length > 0;
        default:
          return String(value).trim() !== "";
      }
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await Repository.store("configure/settings", config);

      if (response.code === 200 && response.data) {
        toast.success("Configuration saved successfully");
      }
    } catch (error) {
      toast.error("Error saving configuration");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        {sortedSettings.map((setting) => (
          <div key={setting.key} className={`col-md-${setting.layout} mb-3`}>
            {renderFormInput(setting)}
            {setting.details && (
              <div className="form-text text-muted">{setting.details}</div>
            )}
          </div>
        ))}
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <Button
            label="Save Configuration"
            icon="ri-save-line"
            type="submit"
            variant="dark"
            // isDisabled={isFormValid()}
          />
        </div>
      </div>
    </form>
  );
};

export default SiteConfig;
