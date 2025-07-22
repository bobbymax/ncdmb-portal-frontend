import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar as ReBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  ResponsiveContainer,
} from "recharts";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar as ChartJsBar, Pie } from "react-chartjs-2";
import {
  extractModelName,
  repo,
  toTitleCase,
} from "../../bootstrap/repositories";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import pluralize from "pluralize";
import ResourceLoader from "./components/loaders/ResourceLoader";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const expenseData = [
  { month: "Jan", Fixed: 5000, Variable: 2000 },
  { month: "Feb", Fixed: 4800, Variable: 2500 },
  { month: "Mar", Fixed: 5200, Variable: 2300 },
  { month: "Apr", Fixed: 5100, Variable: 1900 },
];

const budgetData = [
  { category: "Travel", Actual: 1400, Budget: 1000 },
  { category: "Supplies", Actual: 800, Budget: 1200 },
  { category: "Marketing", Actual: 2300, Budget: 2000 },
  { category: "Utilities", Actual: 950, Budget: 950 },
];

const accountsData = [
  { range: "0-30 Days", Receivables: 12000, Payables: 9000 },
  { range: "31-60 Days", Receivables: 8000, Payables: 7000 },
  { range: "61-90 Days", Receivables: 5000, Payables: 3000 },
  { range: ">90 Days", Receivables: 2000, Payables: 1000 },
];

const chartJsBudgetData = {
  labels: budgetData.map((item) => item.category),
  datasets: [
    {
      label: "Budget",
      data: budgetData.map((item) => item.Budget),
      backgroundColor: "#8884d8",
    },
    {
      label: "Actual",
      data: budgetData.map((item) => item.Actual),
      backgroundColor: "#ff8042",
    },
  ],
};

const chartJsOptions: ChartOptions<"bar"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Budget vs Actual",
    },
  },
};

const tabs = [
  { key: "expenses", label: "Expenses (Recharts)" },
  { key: "budget", label: "Budget vs Actual (Chart.js)" },
  { key: "accounts", label: "Accounts Aging (Recharts)" },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("expenses");
  const [documents, setDocuments] = useState<DocumentResponseData[]>([]);
  const [noRecordFound, setNoRecordFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const documentRepo = useMemo(() => repo("document"), []);

  const groupedData = useMemo(() => {
    if (documents.length < 1) return {};

    return documents.reduce((acc, doc) => {
      const type = extractModelName(doc.documentable_type);
      const status = doc.status ?? "unknown";

      if (!acc[type]) acc[type] = {};
      if (!acc[type][status]) acc[type][status] = 0;

      acc[type][status]++;
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }, [documents]);

  const groupedByStatus = useMemo(() => {
    if (documents.length < 1) return {};

    return documents.reduce((acc, doc) => {
      const status = doc.status ?? "unknown";

      if (!acc[status]) acc[status] = 0;
      acc[status]++;
      return acc;
    }, {} as Record<string, number>);
  }, [documents]);

  const pieChartDataSets = Object.entries(groupedData).map(
    ([type, statusCounts]) => {
      const labels = Object.keys(statusCounts);
      const data = Object.values(statusCounts);

      return {
        label: toTitleCase(type),
        chartData: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: ["#4dc9f6", "#f67019", "#f53794", "#537bc4"],
            },
          ],
        },
      };
    }
  );

  useEffect(() => {
    const fetchDocs = async () => {
      setIsLoading(true);
      try {
        const response = await documentRepo.collection("documents");

        if (response) {
          const documents = response.data as DocumentResponseData[];

          if (documents.length === 0) {
            setNoRecordFound(true);
          }
          setDocuments(documents);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocs();
  }, []);

  console.log(groupedByStatus);

  return (
    <>
      <ResourceLoader
        isLoading={isLoading || (documents.length === 0 && !noRecordFound)}
        message="Loading Insights..."
        variant="spinner"
        size="large"
      >
        <div className="insights mb-3">
          <h1 className="mb-5">Insights</h1>
          <div
            className="flex align"
            style={{
              flexWrap: "wrap",
            }}
          >
            {Object.entries(groupedByStatus).map(([status, count]) => (
              <div
                key={status}
                className="chart__item insights__card mb-3 flex column align center"
                style={{
                  width: "25%",
                }}
              >
                <h1 style={{ fontSize: 64 }}>{count}</h1>
                <small
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    fontSize: 10,
                    display: "block",
                  }}
                  className="card__title"
                >
                  {toTitleCase(status)}
                </small>
              </div>
            ))}
          </div>
        </div>
      </ResourceLoader>
      <ResourceLoader
        isLoading={isLoading || (documents.length === 0 && !noRecordFound)}
        message="Loading Charts..."
        variant="dots"
        size="medium"
      >
        <div
          className="flex align gap-lg"
          style={{
            flexWrap: "wrap",
          }}
        >
          {pieChartDataSets.map((item) => (
            <div key={item.label} className="chart__item mb-3">
              <h5 className="chart__title">{pluralize.plural(item.label)}</h5>
              <Pie
                style={{
                  marginTop: 15,
                }}
                data={item.chartData}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                      labels: {
                        color: "#333",
                        font: { size: 12 },
                      },
                      position: "right",
                    },
                    tooltip: {
                      titleFont: { size: 14 },
                      bodyFont: { size: 12 },
                      backgroundColor: "#000",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                    },
                  },
                }}
              />
            </div>
          ))}
        </div>
      </ResourceLoader>
      {/** <div className="row">
        <div className="flex gap-md mb-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: activeTab === tab.key ? "#333" : "#fff",
                color: activeTab === tab.key ? "#fff" : "#333",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "expenses" && (
          <div
            className="col-md-6"
            style={{ background: "#fff", padding: "1rem", borderRadius: "8px" }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={expenseData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ReTooltip />
                <ReLegend />
                <ReBar dataKey="Fixed" fill="#8884d8" />
                <ReBar dataKey="Variable" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "budget" && (
          <div
            className="col-md-6"
            style={{ background: "#fff", padding: "1rem", borderRadius: "8px" }}
          >
            <ChartJsBar
              options={chartJsOptions}
              data={chartJsBudgetData}
              height={300}
            />
          </div>
        )}

        {activeTab === "accounts" && (
          <div
            className="col-md-6"
            style={{ background: "#fff", padding: "1rem", borderRadius: "8px" }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={accountsData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <ReTooltip />
                <ReLegend />
                <ReBar dataKey="Receivables" fill="#8884d8" />
                <ReBar dataKey="Payables" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>*/}
    </>
  );
};

export default Dashboard;
