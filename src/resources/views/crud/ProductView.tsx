import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
} from "recharts";
import { ProductResponseData } from "@/app/Repositories/Product/data";
import { FormPageComponentProps } from "@/bootstrap";
import Button from "../components/forms/Button";
import { MeasurementTypeResponseData } from "@/app/Repositories/MeasurementType/data";
import { ProductMeasurementResponseData } from "@/app/Repositories/ProductMeasurement/data";
import Modal from "../components/Modal";
import Select from "../components/forms/Select";
import TextInput from "../components/forms/TextInput";
import { toast } from "react-toastify";
import { repo } from "bootstrap/repositories";
import { useNavigate } from "react-router-dom";

interface InventoryStatCard {
  title: string;
  value: string;
  descriptor: string;
  buttonLabel: string;
  subMeta?: { label: string; value: string }[];
}

type DependencyProps = {
  measurementTypes: MeasurementTypeResponseData[];
};

type ExtendedProductState = ProductResponseData & {
  measurements?: ProductMeasurementResponseData[];
};

const ProductView: React.FC<FormPageComponentProps<ProductResponseData>> = ({
  state,
  setState,
  dependencies,
}) => {
  const productRepo = useMemo(() => repo("product"), []);
  const navigate = useNavigate();
  const stats: InventoryStatCard[] = [
    {
      title: "Available Stock",
      value: "320",
      descriptor: "units across all warehouses",
      buttonLabel: "Request for More",
    },
    {
      title: "Incoming Stock",
      value: "45",
      descriptor: "expected in the next 7 days",
      buttonLabel: "Restock Product",
    },
    {
      title: "Distribution Analysis",
      value: "135",
      descriptor: "issued this quarter",
      subMeta: [
        { label: "Pending", value: "28" },
        { label: "Rejected", value: "12" },
      ],
      buttonLabel: "View Breakdown",
    },
    {
      title: "Requisitioned Times",
      value: "30",
      descriptor: "requests logged this month",
      buttonLabel: "Generate Report",
    },
  ];

  const { chartData, usingFallback, summary } = useMemo(() => {
    const stocks = Array.isArray(state?.stocks) ? state?.stocks ?? [] : [];
    const formatted = stocks
      .filter((stock) => typeof stock === "object" && stock !== null)
      .sort((a, b) => {
        const dateA = a.created_at ? Date.parse(a.created_at) : 0;
        const dateB = b.created_at ? Date.parse(b.created_at) : 0;
        return dateA - dateB;
      })
      .map((stock, index) => {
        const dateLabel = stock.created_at
          ? new Intl.DateTimeFormat("en-NG", {
              month: "short",
              day: "numeric",
            }).format(new Date(stock.created_at))
          : `Batch ${index + 1}`;
        return {
          label: dateLabel,
          opening: Number(stock.opening_stock_balance ?? 0),
          closing: Number(stock.closing_stock_balance ?? 0),
          stockOut: Boolean(stock.out_of_stock),
        };
      });

    const fallback = [
      { label: "Week 1", opening: 210, closing: 240, stockOut: false },
      { label: "Week 2", opening: 240, closing: 260, stockOut: false },
      { label: "Week 3", opening: 260, closing: 225, stockOut: true },
      { label: "Week 4", opening: 230, closing: 280, stockOut: false },
      { label: "Week 5", opening: 280, closing: 310, stockOut: false },
    ];

    const dataset = formatted.length > 0 ? formatted : fallback;
    const first = dataset[0];
    const last = dataset[dataset.length - 1];
    const closingValues = dataset.map((item) => item.closing);
    const lowestClosing = Math.min(...closingValues);
    const highestClosing = Math.max(...closingValues);
    const averageClosing =
      closingValues.reduce((total, val) => total + val, 0) /
      closingValues.length;
    const stockOutEvents = dataset.filter((item) => item.stockOut).length;
    const trendPercent =
      first && first.closing !== 0
        ? ((last.closing - first.closing) / Math.max(first.closing, 1)) * 100
        : 0;

    return {
      chartData: dataset,
      usingFallback: formatted.length === 0,
      summary: {
        trendPercent,
        trendDirection:
          trendPercent > 3
            ? "positive"
            : trendPercent < -3
            ? "negative"
            : "flat",
        startLabel: first.label,
        endLabel: last.label,
        latestClosing: last.closing,
        averageClosing: Number.isFinite(averageClosing)
          ? Math.round(averageClosing)
          : 0,
        highestClosing,
        lowestClosing,
        stockOutEvents,
        recordCount: dataset.length,
      },
    };
  }, [state?.stocks]);

  const { measurementTypes = [] } = useMemo(() => {
    return (dependencies || {}) as DependencyProps;
  }, [dependencies]);

  const measurementOptions = useMemo(
    () =>
      measurementTypes.map((type) => ({
        id: type.id,
        name: type.name || type.label || `Type ${type.id}`,
      })),
    [measurementTypes]
  );

  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [measurementForm, setMeasurementForm] = useState<{
    measurement_type_id: number | "";
    quantity: string;
  }>({
    measurement_type_id: "",
    quantity: "",
  });

  const productState =
    (state as ExtendedProductState) ?? ({} as ExtendedProductState);
  const measurementRecords = productState.measurements ?? [];

  const resetMeasurementForm = () => {
    setMeasurementForm({
      measurement_type_id: "",
      quantity: "",
    });
  };

  const handleOpenMeasurementModal = () => {
    resetMeasurementForm();
    setShowMeasurementModal(true);
  };

  const handleCloseMeasurementModal = () => {
    setShowMeasurementModal(false);
  };

  const handleMeasurementInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMeasurementForm((prev) => ({
      ...prev,
      [name]:
        name === "measurement_type_id" && value !== "" ? Number(value) : value,
    }));
  };

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      measurementForm.measurement_type_id === "" ||
      measurementForm.quantity.trim() === ""
    ) {
      return;
    }

    const newMeasurement: ProductMeasurementResponseData = {
      id: Date.now(),
      product_id: state?.id ?? 0,
      measurement_type_id: Number(measurementForm.measurement_type_id),
      quantity: Number(measurementForm.quantity),
    };

    setState?.((prevState) => {
      const current =
        (prevState as ExtendedProductState) ?? ({} as ExtendedProductState);
      const currentMeasurements = current.measurements ?? [];

      return {
        ...current,
        measurements: [...currentMeasurements, newMeasurement],
      };
    });

    handleCloseMeasurementModal();
  };

  const formatMeasurementLabel = (
    measurement: ProductMeasurementResponseData
  ) => {
    const match = measurementOptions.find(
      (option) => option.id === measurement.measurement_type_id
    );

    return `${measurement.quantity} ${match?.name ?? "Units"}`;
  };

  const handleUpdateProduct = async () => {
    try {
      const response = await productRepo.update(
        "products",
        state.id,
        productRepo.formatDataOnSubmit(state)
      );

      if (response.code === 200) {
        toast.success("Product updated successfully");
        navigate("/inventory/products");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    }
  };

  console.log(state.measurements);

  return (
    <>
      <div className="card__button__toolbar flex align between">
        <div className="measurements__list">
          {measurementRecords.length === 0 ? (
            <span className="measurement-empty">
              No measurements logged yet.
            </span>
          ) : (
            <div className="measurement-strip-container">
              {measurementRecords.map((measurement, index) => (
                <div
                  className="measurement-strip"
                  key={`${measurement.id}-${index}`}
                >
                  <span className="measurement-strip-icon">
                    <i className="ri-ruler-line" />
                  </span>
                  <div className="measurement-strip-body">
                    <span className="measurement-strip-value">
                      {formatMeasurementLabel(measurement)}
                    </span>
                    <small className="measurement-strip-meta">
                      Logged{" "}
                      {measurement.created_at
                        ? new Intl.DateTimeFormat("en-NG", {
                            month: "short",
                            day: "numeric",
                          }).format(new Date(measurement.created_at))
                        : "just now"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex align gap-md">
          <Button
            label="Add Measurement"
            icon="ri-function-add-line"
            variant="danger"
            size="sm"
            handleClick={handleOpenMeasurementModal}
          />
          <Button
            label="Update Product"
            icon="ri-edit-line"
            variant="dark"
            size="sm"
            handleClick={handleUpdateProduct}
          />
        </div>
      </div>
      <div className="inventory-insight-grid">
        {stats.map(
          ({ title, value, descriptor, buttonLabel, subMeta }, index) => (
            <article className="inventory-insight-card" key={title}>
              <header className="inventory-insight-header">
                <span className="inventory-insight-title">{title}</span>
              </header>
              <div className="inventory-insight-body">
                <span className="inventory-insight-value">{value}</span>
                <span className="inventory-insight-caption">{descriptor}</span>

                {subMeta && (
                  <div className="inventory-insight-meta">
                    {subMeta.map((meta) => (
                      <div
                        className="inventory-insight-meta-item"
                        key={meta.label}
                      >
                        <span className="inventory-insight-meta-value">
                          {meta.value}
                        </span>
                        <span className="inventory-insight-meta-label">
                          {meta.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <footer className="inventory-insight-footer">
                <Button
                  label={buttonLabel}
                  variant={index === 0 ? "success" : "dark"}
                  size="sm"
                />
              </footer>
            </article>
          )
        )}
      </div>

      <section className="inventory-insight-trend">
        <div className="inventory-insight-chart-card">
          <header className="inventory-insight-chart-header">
            <div>
              <h4>Stock Movement Trend</h4>
              <p>
                Tracking closing balances across{" "}
                {usingFallback
                  ? "recent weeks (sample data)"
                  : `${summary.recordCount} recorded updates`}
              </p>
            </div>
            <span
              className={`inventory-insight-trend-badge inventory-insight-trend-badge--${summary.trendDirection}`}
            >
              {summary.trendPercent > 0 ? "+" : ""}
              {summary.trendPercent.toFixed(1)}%
            </span>
          </header>

          <div className="inventory-insight-chart">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient
                    id="inventoryLineGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ecfdf4" strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#475569" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#475569" }}
                />
                <ReTooltip
                  formatter={(value: number) => [`${value} units`, "Closing"]}
                  labelStyle={{ color: "#0f172a" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(22,101,52,0.12)",
                    boxShadow: "0 12px 30px -18px rgba(15,118,110,0.45)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="closing"
                  stroke="url(#inventoryLineGradient)"
                  strokeWidth={3}
                  dot={{
                    stroke: "#0f172a",
                    strokeWidth: 2,
                    fill: "#22c55e",
                  }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="opening"
                  stroke="#047857"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="inventory-insight-analysis">
          <div className="inventory-insight-analysis-header">
            <h5>Inventory Narrative</h5>
            <p>
              {summary.latestClosing} units in closing stock as of{" "}
              {summary.endLabel}.{" "}
              {summary.trendDirection === "positive"
                ? "Closing balances are climbing steadily—supply is keeping up with demand."
                : summary.trendDirection === "negative"
                ? "Closings are trending downward; consider accelerating replenishment."
                : "Inventory is holding steady with only mild fluctuations."}
            </p>
          </div>
          <div className="inventory-insight-analysis-grid">
            <div className="inventory-insight-analysis-card">
              <span className="analysis-label">High / Low</span>
              <span className="analysis-value">
                {summary.highestClosing} / {summary.lowestClosing}
              </span>
              <small>Units since {summary.startLabel}</small>
            </div>
            <div className="inventory-insight-analysis-card">
              <span className="analysis-label">Average Closing</span>
              <span className="analysis-value">{summary.averageClosing}</span>
              <small>
                {summary.averageClosing >= summary.latestClosing
                  ? "Slightly above current levels"
                  : "Below current levels"}
              </small>
            </div>
            <div className="inventory-insight-analysis-card">
              <span className="analysis-label">Stock-out Alerts</span>
              <span className="analysis-value">{summary.stockOutEvents}</span>
              <small>
                {summary.stockOutEvents > 0
                  ? "Flagged events to investigate"
                  : "No outages recorded"}
              </small>
            </div>
          </div>
          <div className="inventory-insight-footnote">
            {usingFallback
              ? "Live stock movement data will appear here once product movements are recorded."
              : "Insights generated from live stock movement records."}
          </div>
        </aside>
      </section>

      <Modal
        title="Add Product Measurement"
        show={showMeasurementModal}
        close={handleCloseMeasurementModal}
        size="md"
      >
        <form className="measurement-form" onSubmit={handleAddMeasurement}>
          <Select
            label="Measurement Type"
            name="measurement_type_id"
            value={measurementForm.measurement_type_id}
            onChange={handleMeasurementInputChange}
            defaultValue=""
            defaultText="Select measurement type"
            options={measurementOptions}
            valueKey="id"
            labelKey="name"
            size="md"
            defaultCheckDisabled
          />
          <TextInput
            label="Quantity"
            name="quantity"
            type="number"
            min={0}
            step="any"
            value={measurementForm.quantity}
            onChange={handleMeasurementInputChange}
            placeholder="Enter quantity"
            size="md"
          />

          <div className="measurement-form-actions">
            <Button
              label="Cancel"
              variant="outline"
              size="sm"
              type="button"
              handleClick={handleCloseMeasurementModal}
            />
            <Button
              label="Add Measurement"
              variant="success"
              size="sm"
              type="submit"
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ProductView;
