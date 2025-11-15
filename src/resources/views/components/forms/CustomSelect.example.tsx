/**
 * CustomSelect Component Usage Examples
 * 
 * This file demonstrates how to use the CustomSelect component
 * with various configurations and option types.
 */

import React, { useState } from "react";
import CustomSelect, { CustomSelectOption } from "./CustomSelect";

// Example 1: Single Selection with Basic Options
export const SingleSelectExample: React.FC = () => {
  const [value, setValue] = useState<string | number | null>(null);

  const options: CustomSelectOption[] = [
    {
      value: 1,
      title: "Project Alpha",
      avatar: {
        type: "icon",
        content: "ri-folder-line",
      },
      type: "Development",
      status: {
        label: "Active",
        variant: "success",
      },
      user: "John Doe",
      date: "2024-01-15",
    },
    {
      value: 2,
      title: "Project Beta",
      avatar: {
        type: "text",
        content: "PB",
      },
      type: "Marketing",
      status: {
        label: "Pending",
        variant: "warning",
      },
      user: "Jane Smith",
      date: "2024-01-20",
    },
  ];

  const handleChange = (newValue: string | number | (string | number)[] | null) => {
    setValue(newValue as string | number | null);
  };

  return (
    <CustomSelect
      label="Select Project"
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Choose a project..."
    />
  );
};

// Example 2: Multiple Selection
export const MultipleSelectExample: React.FC = () => {
  const [value, setValue] = useState<(string | number)[] | null>(null);

  const options: CustomSelectOption[] = [
    {
      value: "user-1",
      title: "John Doe",
      avatar: {
        type: "text",
        content: "JD",
      },
      type: "Developer",
      status: {
        label: "Available",
        variant: "success",
      },
    },
    {
      value: "user-2",
      title: "Jane Smith",
      avatar: {
        type: "image",
        content: "/path/to/image.jpg",
      },
      type: "Designer",
      status: {
        label: "Busy",
        variant: "warning",
      },
    },
  ];

  const handleChange = (newValue: string | number | (string | number)[] | null) => {
    setValue(newValue as (string | number)[] | null);
  };

  return (
    <CustomSelect
      label="Select Team Members"
      options={options}
      value={value}
      onChange={handleChange}
      multiple={true}
      placeholder="Select team members..."
    />
  );
};

// Example 3: Minimal Options (Title Only)
export const MinimalSelectExample: React.FC = () => {
  const [value, setValue] = useState<string | number | null>(null);

  const options: CustomSelectOption[] = [
    { value: 1, title: "Option 1" },
    { value: 2, title: "Option 2" },
    { value: 3, title: "Option 3" },
  ];

  const handleChange = (newValue: string | number | (string | number)[] | null) => {
    setValue(newValue as string | number | null);
  };

  return (
    <CustomSelect
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Select an option..."
    />
  );
};

// Example 4: With All Optional Fields
export const FullFeaturedExample: React.FC = () => {
  const [value, setValue] = useState<string | number | null>(null);

  const options: CustomSelectOption[] = [
    {
      value: "task-1",
      title: "Complete Documentation",
      avatar: {
        type: "icon",
        content: "ri-file-text-line",
      },
      type: "Task",
      status: {
        label: "In Progress",
        variant: "info",
      },
      user: "Alice Johnson",
      date: "2024-01-25",
    },
    {
      value: "task-2",
      title: "Review Code Changes",
      avatar: {
        type: "icon",
        content: "ri-code-s-slash-line",
      },
      type: "Review",
      status: {
        label: "Pending",
        variant: "warning",
      },
      user: "Bob Williams",
      date: "2024-01-26",
    },
    {
      value: "task-3",
      title: "Deploy to Production",
      avatar: {
        type: "icon",
        content: "ri-rocket-line",
      },
      type: "Deployment",
      status: {
        label: "Completed",
        variant: "success",
      },
      user: "Charlie Brown",
      date: "2024-01-24",
    },
  ];

  const handleChange = (newValue: string | number | (string | number)[] | null) => {
    setValue(newValue as string | number | null);
  };

  return (
    <CustomSelect
      label="Select Task"
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Search tasks..."
      isSearchable={true}
    />
  );
};

// Example 5: Disabled State
export const DisabledSelectExample: React.FC = () => {
  const options: CustomSelectOption[] = [
    { value: 1, title: "Option 1" },
    { value: 2, title: "Option 2" },
  ];

  return (
    <CustomSelect
      label="Disabled Select"
      options={options}
      isDisabled={true}
      placeholder="This is disabled"
    />
  );
};

