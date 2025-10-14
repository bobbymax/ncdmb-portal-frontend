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
const analyticsData = [
  { day: "Mon", views: 2400, clicks: 1800, revenue: 2100 },
  { day: "Tue", views: 1398, clicks: 2210, revenue: 2900 },
  { day: "Wed", views: 9800, clicks: 2290, revenue: 2000 },
  { day: "Thu", views: 3908, clicks: 2000, revenue: 2780 },
  { day: "Fri", views: 4800, clicks: 2181, revenue: 1890 },
  { day: "Sat", views: 3800, clicks: 2500, revenue: 2390 },
  { day: "Sun", views: 4300, clicks: 2100, revenue: 3490 },
];

const userActivityData = {
  labels: ["Active Users", "Inactive"],
  datasets: [
    {
      data: [900, 100],
      backgroundColor: ["#667eea", "#e0e0e0"],
      borderWidth: 0,
    },
  ],
};

const viewsData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

const progressData = [
  { label: "Task Completion", value: 80, color: "#667eea" },
  { label: "Project Progress", value: 65, color: "#28c76f" },
  { label: "Team Performance", value: 45, color: "#ff9f43" },
  { label: "Customer Satisfaction", value: 90, color: "#ea5455" },
];

const Dashboard = () => {
  const [documents, setDocuments] = useState<DocumentResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noRecordFound, setNoRecordFound] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");

  const documentRepo = repo("document");

  console.log(documents);

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
        // Error fetching documents
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocs();
  }, []);

  // Skeleton loading component for dashboard
  const DashboardSkeleton = () => (
    <div className="dashboard-grid">
      {/* Top Analytics Cards Skeleton */}
      <div className="analytics-cards">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="analytics-card skeleton-card">
            <div className="card-icon skeleton-icon"></div>
            <div className="card-content">
              <div className="skeleton-line skeleton-value"></div>
              <div className="skeleton-line skeleton-label"></div>
              <div className="skeleton-line skeleton-change"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Chart Skeleton */}
      <div className="main-analytics-widget">
        <div className="widget-header">
          <div className="widget-title">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-subtitle"></div>
          </div>
          <div className="widget-actions">
            <div className="skeleton-line skeleton-date-picker"></div>
          </div>
        </div>
        <div className="widget-content">
          <div className="skeleton-chart" style={{ height: "300px" }}></div>
        </div>
      </div>

      {/* Status Cards Skeleton */}
      <div className="status-widget">
        <div className="widget-header">
          <div className="widget-title">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-subtitle"></div>
          </div>
        </div>
        <div className="widget-content">
          <div className="status-grid">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="status-item skeleton-status">
                <div className="status-icon skeleton-icon"></div>
                <div className="status-info">
                  <div className="skeleton-line skeleton-status-value"></div>
                  <div className="skeleton-line skeleton-status-label"></div>
                </div>
                <div className="skeleton-line skeleton-percentage"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modern-dashboard">
      {/* Header Section */}
      <div
        style={{
          padding: "10px 20px 25px 20px",
        }}
        className="flex align between"
      >
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
          {["day", "week", "month", "year"].map((timeframe) => (
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

      {/* Main Dashboard Grid with Skeleton Loading */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="dashboard-grid">
          {/* Top Analytics Cards */}
          <div className="analytics-cards">
            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-eye-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">44</div>
                <div className="card-label">Views</div>
                <div className="card-change positive">
                  <i className="ri-arrow-up-line"></i>
                  +12.5%
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-mouse-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">740</div>
                <div className="card-label">Total Clicks</div>
                <div className="card-change positive">
                  <i className="ri-arrow-up-line"></i>
                  +8.2%
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-money-dollar-circle-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">$9,101.50</div>
                <div className="card-label">Total Revenue</div>
                <div className="card-change positive">
                  <i className="ri-arrow-up-line"></i>
                  +15.3%
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-user-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">1,234</div>
                <div className="card-label">Active Users</div>
                <div className="card-change positive">
                  <i className="ri-arrow-up-line"></i>
                  +5.7%
                </div>
              </div>
            </div>
          </div>

          {/* Main Analytics Chart */}
          <div className="main-analytics-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Analytics</h3>
                <p>Performance overview for the selected period</p>
              </div>
              <div className="widget-actions">
                <div className="date-picker">
                  <i className="ri-calendar-line"></i>
                  <span>1 Jan 2022 +</span>
                </div>
              </div>
            </div>
            <div className="widget-content">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData}>
                  <defs>
                    <linearGradient
                      id="analyticsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#667eea"
                    strokeWidth={3}
                    fill="url(#analyticsGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#28c76f"
                    strokeWidth={2}
                    dot={{ fill: "#28c76f", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Activity Section */}
          <div className="user-activity-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>User Activity</h3>
                <p>Current user engagement metrics</p>
              </div>
            </div>
            <div className="widget-content">
              <div className="activity-charts">
                <div className="activity-chart">
                  <ResponsiveContainer width="100%" height={120}>
                    <Doughnut
                      data={userActivityData}
                      options={{
                        cutout: "70%",
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }}
                    />
                  </ResponsiveContainer>
                  <div className="chart-center">
                    <div className="center-value">
                      {userActivityData.datasets[0].data[0]}
                    </div>
                    <div className="center-label">Active Users</div>
                  </div>
                </div>

                <div className="activity-stats">
                  <div className="stat-item">
                    <div className="stat-value">85%</div>
                    <div className="stat-label">Engagement Rate</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">12.5k</div>
                    <div className="stat-label">Total Sessions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Views Chart */}
          <div className="views-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Views</h3>
                <p>Monthly view trends</p>
              </div>
            </div>
            <div className="widget-content">
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <Bar dataKey="value" fill="#667eea" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="progress-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Progress Overview</h3>
                <p>Team performance metrics</p>
              </div>
            </div>
            <div className="widget-content">
              <div className="progress-items">
                {progressData.map((item, index) => (
                  <div key={index} className="progress-item">
                    <div className="progress-header">
                      <span className="progress-label">{item.label}</span>
                      <span className="progress-value">{item.value}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Document Status Summary */}
          <div className="status-summary-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Document Status</h3>
                <p>Current document processing status</p>
              </div>
            </div>
            <div className="widget-content">
              <div className="status-grid">
                {statusCards.slice(0, 4).map((card, index) => (
                  <div key={index} className="status-item">
                    <div className="status-icon">
                      <i className={card.icon}></i>
                    </div>
                    <div className="status-info">
                      <div className="status-value">{card.count}</div>
                      <div className="status-label">{card.label}</div>
                    </div>
                    <div className="status-percentage">{card.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
