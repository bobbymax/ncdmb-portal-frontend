import { ProjectCategoryResponseData } from "@/app/Repositories/ProjectCategory/data";
import { ThresholdResponseData } from "@/app/Repositories/Threshold/data";
import { ProjectResponseData } from "app/Repositories/Project/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import Box from "../components/forms/Box";
import { useAuth } from "app/Context/AuthContext";
import Select from "../components/forms/Select";

interface DependencyProps {
  thresholds: ThresholdResponseData[];
  projectCategories: ProjectCategoryResponseData[];
}

const Project: React.FC<FormPageComponentProps<ProjectResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
  loading,
  mode,
}) => {
  const { staff } = useAuth();
  const { thresholds = [], projectCategories = [] } = useMemo(
    () => dependencies as DependencyProps,
    [dependencies]
  );

  const [category, setCategory] = useState<DataOptionsProps | null>(null);
  const [isInclusive, setIsInclusive] = useState<"yes" | "no">("no");
  const [threshold, setThreshold] = useState<ThresholdResponseData | null>(
    null
  );

  const handleCategoryChange = useCallback(
    (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
      const value = newValue as DataOptionsProps;
      setCategory(value);
      if (setState) {
        setState((prev) => ({
          ...prev,
          project_category_id: value.value,
        }));
      }
    },
    [setState]
  );

  useEffect(() => {
    if (state.total_proposed_amount > 0) {
      const sorted = thresholds.sort(
        (a, b) => Number(a.amount) - Number(b.amount)
      );
      const threshold: ThresholdResponseData | null =
        sorted.find(
          (t) => Number(state.total_proposed_amount) <= Number(t.amount)
        ) ?? null;

      if (setState) {
        setState((prev) => ({
          ...prev,
          threshold_id: threshold?.id ?? 0,
        }));
      }

      setThreshold(threshold);
    }
  }, [state.total_proposed_amount]);

  useEffect(() => {
    if (state.total_proposed_amount > 0 && isInclusive === "yes") {
      const vatValue = Number(state.total_proposed_amount) * (3 / 43);

      const formatter = new Intl.NumberFormat("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      if (setState) {
        setState((prev) => ({
          ...prev,
          vat_amount: parseFloat(vatValue.toFixed(2)) ?? 0,
        }));
      }
    }
  }, [state.total_proposed_amount, isInclusive]);

  useEffect(() => {
    if (state.sub_total_amount > 0 && state.service_charge_percentage > 0) {
      const adminFee =
        Number(state.sub_total_amount) *
        (Number(state.service_charge_percentage) / 100);
      const vatValue = adminFee * 0.075;

      const grandTotal = Number(state.sub_total_amount) + adminFee + vatValue;

      if (setState) {
        setState((prev) => ({
          ...prev,
          markup_amount: parseFloat(adminFee.toFixed(2)) ?? 0,
          total_proposed_amount: parseFloat(grandTotal.toFixed(2)) ?? 0,
          vat_amount: parseFloat(vatValue.toFixed(2)) ?? 0,
        }));
      }
    }
  }, [state.sub_total_amount, state.service_charge_percentage]);

  useEffect(() => {
    if (staff && setState) {
      setState((prev) => ({
        ...prev,
        department_id: staff.department_id,
        user_id: staff.id,
      }));
    }
  }, [staff]);

  return (
    <>
      <div className="col-md-6 mb-3">
        <div className="row">
          <div className="col-md-12 mb-3">
            <TextInput
              label="Title"
              name="title"
              value={state.title}
              onChange={handleChange}
              placeholder="Enter Project Title"
            />
          </div>
          <div className="col-md-12 mb-3">
            <Textarea
              label="What is this Project About?"
              name="description"
              value={state.description}
              onChange={handleChange}
              placeholder="Enter Project Description"
              rows={8}
            />
          </div>
          <div className="col-md-6 mb-3">
            <TextInput
              label="Proposed Start Date"
              name="proposed_start_date"
              value={state.proposed_start_date}
              onChange={handleChange}
              type="date"
            />
          </div>
          <div className="col-md-6 mb-3">
            <TextInput
              label="Proposed End Date"
              name="proposed_end_date"
              value={state.proposed_end_date}
              onChange={handleChange}
              type="date"
            />
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-3">
        <div className="row">
          <div className="col-md-12 mb-3">
            <MultiSelect
              label="Project Category"
              options={formatOptions(projectCategories, "id", "name")}
              value={category}
              onChange={handleCategoryChange}
              placeholder="Project Category"
              isSearchable
              isDisabled={loading}
            />
          </div>
          <div className="col-md-7 mb-3">
            <TextInput
              label="Proposed Total Amount"
              name="total_proposed_amount"
              value={state.total_proposed_amount}
              onChange={handleChange}
              isDisabled={state.sub_total_amount > 0}
            />
          </div>
          <div className="col-md-5 mb-3">
            <Select
              label="Type"
              name="type"
              valueKey="value"
              labelKey="label"
              value={state.type}
              onChange={handleChange}
              defaultValue=""
              defaultCheckDisabled
              options={[
                { value: "staff", label: "Staff" },
                { value: "third-party", label: "Third Party" },
              ]}
              size="sm"
            />
          </div>
          <div className="col-md-12 mb-5">
            <Box
              label="Vat Inclusive?"
              value={isInclusive}
              onChange={(e) => {
                const isChecked = e.target.checked ? "yes" : "no";
                setIsInclusive(isChecked);
              }}
              isChecked={isInclusive === "yes"}
              isDisabled={state.sub_total_amount > 0}
            />
          </div>
          <div className="col-md-7 mb-3">
            <TextInput
              label="Sub Total Amount"
              value={state.sub_total_amount}
              name="sub_total_amount"
              onChange={handleChange}
              isDisabled={isInclusive === "yes"}
            />
          </div>
          <div className="col-md-5 mb-3">
            <TextInput
              label="Service Charge %"
              type="number"
              name="service_charge_percentage"
              value={state.service_charge_percentage}
              onChange={handleChange}
              isDisabled={isInclusive === "yes"}
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInput
              label="Admin Fee"
              value={state.markup_amount}
              name="markup_amount"
              onChange={handleChange}
              isDisabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInput
              label="VAT Amount"
              value={state.vat_amount}
              name="vat_amount"
              onChange={handleChange}
              isDisabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInput
              label="Threshold"
              value={threshold?.name}
              name="vat_amount"
              onChange={handleChange}
              placeholder="Threshold Value"
              isDisabled
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Project;
