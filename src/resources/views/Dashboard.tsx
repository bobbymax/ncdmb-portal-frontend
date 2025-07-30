import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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
import { Bar as ChartJsBar, Doughnut } from "react-chartjs-2";
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

// Sample data for the dashboard widgets
const websiteAnalyticsData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 2000 },
  { name: "Apr", sales: 2780 },
  { name: "May", sales: 1890 },
  { name: "Jun", sales: 2390 },
];

const earningData = [
  { day: "Mo", earnings: 65 },
  { day: "Tu", earnings: 59 },
  { day: "We", earnings: 80 },
  { day: "Th", earnings: 81 },
  { day: "Fr", earnings: 56 },
  { day: "Sa", earnings: 55 },
  { day: "Su", earnings: 40 },
];

const supportData = [
  { name: "Completed", value: 85, fill: "#28c76f" },
  { name: "Remaining", value: 15, fill: "#e0e0e0" },
];

const Dashboard = () => {
  const [documents, setDocuments] = useState<DocumentResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noRecordFound, setNoRecordFound] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");

  const documentRepo = repo("Document");

  const groupedByStatus = useMemo(() => {
    return documents.reduce((acc, doc) => {
      const status = doc.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [documents]);

  const statusCards = useMemo(() => {
    const total = documents.length;
    return Object.entries(groupedByStatus).map(([status, count]) => ({
      status,
      count,
      label: toTitleCase(status),
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      icon: getStatusIcon(status),
      color: getStatusColor(status),
    }));
  }, [groupedByStatus, documents.length]);

  function getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      pending: "ri-time-line",
      approved: "ri-check-line",
      rejected: "ri-close-line",
      processing: "ri-loader-line",
      completed: "ri-check-double-line",
      draft: "ri-file-line",
      unknown: "ri-question-line",
    };
    return iconMap[status.toLowerCase()] || "ri-question-line";
  }

  function getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: "warning",
      approved: "success",
      rejected: "danger",
      processing: "info",
      completed: "success",
      draft: "secondary",
      unknown: "dark",
    };
    return colorMap[status.toLowerCase()] || "dark";
  }

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

  return (
    <div className="modern-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <i className="ri-dashboard-line"></i>
            Analytics Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Real-time overview of your document management system
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="timeframe-selector">
          {["week", "month", "quarter", "year"].map((timeframe) => (
            <button
              key={timeframe}
              className={`timeframe-btn ${
                selectedTimeframe === timeframe ? "active" : ""
              }`}
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <ResourceLoader
        isLoading={isLoading || (documents.length === 0 && !noRecordFound)}
        message="Loading Dashboard..."
        variant="spinner"
        size="large"
      >
        <div className="dashboard-grid">
          {/* Website Analytics Widget */}
          <div className="dashboard-widget website-analytics">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Website Analytics</h3>
                <p>Total 28.5% Conversion Rate</p>
              </div>
              <div className="widget-visual">
                <div className="analytics-sphere">
                  <div className="sphere-cube"></div>
                  <div className="sphere-cube"></div>
                  <div className="sphere-cube"></div>
                  <div className="sphere-cube"></div>
                  <div className="sphere-cube"></div>
                </div>
              </div>
            </div>
            <div className="widget-content">
              <div className="spending-metrics">
                <div className="metric-item">
                  <span className="metric-label">12h Spend</span>
                  <span className="metric-value">$2,420</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">18 Order Size</span>
                  <span className="metric-value">$156</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">127 Order</span>
                  <span className="metric-value">$12,749</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">2.3k Items</span>
                  <span className="metric-value">$45,230</span>
                </div>
              </div>
            </div>
          </div>

          {/* Average Daily Sales Widget */}
          <div className="dashboard-widget daily-sales">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Average Daily Sales</h3>
                <p>Total Sales This Month</p>
              </div>
            </div>
            <div className="widget-content">
              <div className="sales-value">$28,450</div>
              <div className="sales-chart">
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient
                        id="salesGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#28c76f"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#28c76f"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#28c76f"
                      fill="url(#salesGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sales Overview Widget */}
          <div className="dashboard-widget sales-overview">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Sales Overview</h3>
              </div>
            </div>
            <div className="widget-content">
              <div className="sales-main-value">
                $42.5k
                <span className="sales-increase">+18.2%</span>
              </div>
              <div className="sales-comparison">
                <div className="comparison-item">
                  <span className="comparison-label">Order</span>
                  <span className="comparison-value">62.2% (6,440)</span>
                </div>
                <div className="comparison-vs">VS</div>
                <div className="comparison-item">
                  <span className="comparison-label">Visits</span>
                  <span className="comparison-value">25.5% (12,749)</span>
                </div>
              </div>
              <div className="sales-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill order"
                    style={{ width: "62.2%" }}
                  ></div>
                  <div
                    className="progress-fill visits"
                    style={{ width: "25.5%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Earning Reports Widget */}
          <div className="dashboard-widget earning-reports">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Earning Reports</h3>
                <p>Weekly Earnings Overview</p>
              </div>
            </div>
            <div className="widget-content">
              <div className="earning-main">
                <div className="earning-value">$468</div>
                <div className="earning-increase">+4.2%</div>
              </div>
              <p className="earning-description">
                You informed of this week compared to last week
              </p>
              <div className="earning-chart">
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={earningData}>
                    <Bar
                      dataKey="earnings"
                      fill="#28c76f"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="earning-metrics">
                <div className="earning-metric">
                  <span className="metric-label">Earnings</span>
                  <span className="metric-value">$545.69</span>
                  <div className="metric-progress">
                    <div
                      className="progress-fill"
                      style={{ width: "80%", backgroundColor: "#28c76f" }}
                    ></div>
                  </div>
                </div>
                <div className="earning-metric">
                  <span className="metric-label">Profit</span>
                  <span className="metric-value">$256.34</span>
                  <div className="metric-progress">
                    <div
                      className="progress-fill"
                      style={{ width: "60%", backgroundColor: "#28c76f" }}
                    ></div>
                  </div>
                </div>
                <div className="earning-metric">
                  <span className="metric-label">Expense</span>
                  <span className="metric-value">$74.19</span>
                  <div className="metric-progress">
                    <div
                      className="progress-fill"
                      style={{ width: "30%", backgroundColor: "#ea5455" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Tracker Widget */}
          <div className="dashboard-widget support-tracker">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Support Tracker</h3>
                <p>Last 7 Days</p>
              </div>
            </div>
            <div className="widget-content">
              <div className="support-main">
                <div className="support-total">164</div>
                <div className="support-progress">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={supportData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {supportData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="progress-center">85%</div>
                </div>
                <div className="progress-label">Completed Task</div>
              </div>
              <div className="support-metrics">
                <div className="support-metric">
                  <span className="metric-label">New Tickets</span>
                  <span className="metric-value">142</span>
                </div>
                <div className="support-metric">
                  <span className="metric-label">Open Tickets</span>
                  <span className="metric-value">28</span>
                </div>
                <div className="support-metric">
                  <span className="metric-label">Response Time</span>
                  <span className="metric-value">1 Day</span>
                </div>
              </div>
              <button className="buy-now-btn">Buy Now</button>
            </div>
          </div>
        </div>
      </ResourceLoader>
    </div>
  );
};

export default Dashboard;
