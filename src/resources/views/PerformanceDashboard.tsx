import React, { useMemo } from "react";
import { useResources } from "app/Context/ResourceContext";
import { FundResponseData } from "app/Repositories/Fund/data";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import "../assets/css/dashboard-flat.css";
import { ExpenditureResponseData } from "@/app/Repositories/Expenditure/data";

const PerformanceDashboard = () => {
  // Pull funds from cached resources
  const { resources, areLoaded, isLoading } = useResources([
    "funds",
    "expenditures",
  ]);

  const funds = resources.funds as FundResponseData[];
  const expenditures = resources.expenditures as ExpenditureResponseData[];

  console.log(expenditures);
  // KPI Statistics
  const kpiStats = useMemo(() => {
    if (!funds || funds.length === 0) {
      return {
        totalApproved: 0,
        totalCommitted: 0,
        totalActual: 0,
        utilizationRate: 0,
      };
    }

    const totalApproved = funds.reduce(
      (sum, fund) => sum + Number(fund.total_approved_amount || 0),
      0
    );
    const totalCommitted = funds.reduce(
      (sum, fund) => sum + Number(fund.total_commited_amount || 0),
      0
    );
    const totalActual = funds.reduce(
      (sum, fund) => sum + Number(fund.total_actual_amount || 0),
      0
    );
    const utilizationRate =
      totalApproved > 0 ? ((totalActual / totalApproved) * 100).toFixed(1) : 0;

    return {
      totalApproved,
      totalCommitted,
      totalActual,
      utilizationRate: Number(utilizationRate),
    };
  }, [funds]);

  // Budget by Type (for Pie Chart)
  const budgetByType = useMemo(() => {
    if (!funds || funds.length === 0) return [];

    const types = ["capital", "recurrent", "personnel"];
    return types.map((type) => {
      const typeFunds = funds.filter((f) => f.type === type);
      const total = typeFunds.reduce(
        (sum, f) => sum + Number(f.total_approved_amount || 0),
        0
      );
      return {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: total,
        count: typeFunds.length,
      };
    });
  }, [funds]);

  // Utilization by Type (for Bar Chart)
  const utilizationByType = useMemo(() => {
    if (!funds || funds.length === 0) return [];

    const types = ["capital", "recurrent", "personnel"];
    return types.map((type) => {
      const typeFunds = funds.filter((f) => f.type === type);
      const approved = typeFunds.reduce(
        (sum, f) => sum + Number(f.total_approved_amount || 0),
        0
      );
      const committed = typeFunds.reduce(
        (sum, f) => sum + Number(f.total_commited_amount || 0),
        0
      );
      const actual = typeFunds.reduce(
        (sum, f) => sum + Number(f.total_actual_amount || 0),
        0
      );

      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        approved: approved / 1000000, // Convert to millions
        committed: committed / 1000000,
        actual: actual / 1000000,
      };
    });
  }, [funds]);

  // Department Performance (Top 5)
  const departmentPerformance = useMemo(() => {
    if (!funds || funds.length === 0) return [];

    const deptMap = new Map<
      string,
      { approved: number; actual: number; name: string }
    >();

    funds.forEach((fund) => {
      const deptName = fund.owner || "Unknown Department";
      if (!deptMap.has(deptName)) {
        deptMap.set(deptName, {
          approved: 0,
          actual: 0,
          name: deptName,
        });
      }

      const deptData = deptMap.get(deptName)!;
      deptData.approved += Number(fund.total_approved_amount || 0);
      deptData.actual += Number(fund.total_actual_amount || 0);
    });

    return Array.from(deptMap.values())
      .map((dept) => ({
        name: dept.name,
        value: dept.approved / 1000000,
        count: funds.filter((f) => f.owner === dept.name).length,
        utilization:
          dept.approved > 0
            ? Number(((dept.actual / dept.approved) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [funds]);

  // Budget Year Trend
  const budgetYearTrend = useMemo(() => {
    if (!funds || funds.length === 0) return [];

    const yearMap = new Map<
      number,
      { approved: number; actual: number; count: number }
    >();

    funds.forEach((fund) => {
      const year = fund.budget_year;
      if (!yearMap.has(year)) {
        yearMap.set(year, { approved: 0, actual: 0, count: 0 });
      }

      const yearData = yearMap.get(year)!;
      yearData.approved += Number(fund.total_approved_amount || 0);
      yearData.actual += Number(fund.total_actual_amount || 0);
      yearData.count += 1;
    });

    return Array.from(yearMap.entries())
      .map(([year, data]) => ({
        year: year.toString(),
        approved: data.approved / 1000000, // Convert to millions
        actual: data.actual / 1000000,
        count: data.count,
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [funds]);

  // Fund Status Overview
  const fundStatus = useMemo(() => {
    if (!funds || funds.length === 0) {
      return {
        active: 0,
        exhausted: 0,
        logistics: 0,
        avgUtilization: 0,
      };
    }

    const active = funds.filter((f) => f.is_exhausted === 0).length;
    const exhausted = funds.filter((f) => f.is_exhausted === 1).length;
    const logistics = funds.filter((f) => f.is_logistics === 1).length;

    const totalUtil = funds.reduce((sum, fund) => {
      const approved = Number(fund.total_approved_amount || 0);
      const actual = Number(fund.total_actual_amount || 0);
      return sum + (approved > 0 ? (actual / approved) * 100 : 0);
    }, 0);

    const avgUtilization =
      funds.length > 0 ? Number((totalUtil / funds.length).toFixed(1)) : 0;

    return { active, exhausted, logistics, avgUtilization };
  }, [funds]);

  // Budget Health Indicators
  const healthIndicators = useMemo(() => {
    if (!funds || funds.length === 0) {
      return {
        underUtilized: { count: 0, value: 0 },
        wellUtilized: { count: 0, value: 0 },
        overCommitted: { count: 0, value: 0 },
        critical: { count: 0, value: 0 },
      };
    }

    const underUtilized = { count: 0, value: 0 };
    const wellUtilized = { count: 0, value: 0 };
    const overCommitted = { count: 0, value: 0 };
    const critical = { count: 0, value: 0 };

    funds.forEach((fund) => {
      const approved = Number(fund.total_approved_amount || 0);
      const committed = Number(fund.total_commited_amount || 0);
      const actual = Number(fund.total_actual_amount || 0);
      const utilRate = approved > 0 ? (actual / approved) * 100 : 0;

      if (utilRate < 50) {
        underUtilized.count++;
        underUtilized.value += approved;
      } else if (utilRate >= 50 && utilRate <= 90) {
        wellUtilized.count++;
        wellUtilized.value += approved;
      }

      if (committed > approved) {
        overCommitted.count++;
        overCommitted.value += committed - approved;
      }

      if (utilRate > 90) {
        critical.count++;
        critical.value += approved;
      }
    });

    return { underUtilized, wellUtilized, overCommitted, critical };
  }, [funds]);

  // Format currency
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format currency in compact form (K, M, B)
  const formatNairaCompact = (amount: number | undefined | null) => {
    if (!amount || isNaN(amount)) {
      return "₦0.00";
    }

    const numAmount = Number(amount);

    if (numAmount >= 1000000000) {
      return `₦${(numAmount / 1000000000).toFixed(2)}B`;
    } else if (numAmount >= 1000000) {
      return `₦${(numAmount / 1000000).toFixed(2)}M`;
    } else if (numAmount >= 1000) {
      return `₦${(numAmount / 1000).toFixed(2)}K`;
    } else {
      return `₦${numAmount.toFixed(2)}`;
    }
  };

  // Chart colors
  const PIE_COLORS = ["#667eea", "#28c76f", "#ff9f43"];

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Header Section */}
      <div className="analytics__header">
        <h1>
          <i className="ri-line-chart-line"></i>
          Budget Performance
        </h1>
        <p>
          Real-time insights into fund allocation, utilization, and performance
          across all departments
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Top Analytics Cards */}
        <div className="analytics-cards">
          {/* Total Allocated */}
          <div className="analytics-card">
            <div className="card-icon">
              <i className="ri-wallet-line"></i>
            </div>
            <div className="card-content">
              <div className="card-value">
                {formatNairaCompact(kpiStats.totalApproved)}
              </div>
              <div className="card-label">Total Allocated</div>
              <div className="card-change">
                <i className="ri-funds-line"></i>
                Budget Allocation
              </div>
            </div>
          </div>

          {/* Total Committed */}
          <div className="analytics-card">
            <div className="card-icon">
              <i className="ri-time-line"></i>
            </div>
            <div className="card-content">
              <div className="card-value">
                {formatNairaCompact(kpiStats.totalCommitted)}
              </div>
              <div className="card-label">Total Committed</div>
              <div className="card-change">
                <i className="ri-hourglass-line"></i>
                Committed Spending
              </div>
            </div>
          </div>

          {/* Actual Spent */}
          <div className="analytics-card">
            <div className="card-icon">
              <i className="ri-money-dollar-circle-line"></i>
            </div>
            <div className="card-content">
              <div className="card-value">
                {formatNairaCompact(kpiStats.totalActual)}
              </div>
              <div className="card-label">Actual Spent</div>
              <div className="card-change positive">
                <i className="ri-arrow-up-line"></i>
                Total Expenditure
              </div>
            </div>
          </div>

          {/* Utilization Rate */}
          <div className="analytics-card">
            <div className="card-icon">
              <i className="ri-pie-chart-line"></i>
            </div>
            <div className="card-content">
              <div className="card-value">{kpiStats.utilizationRate}%</div>
              <div className="card-label">Utilization Rate</div>
              <div className="card-change">
                <i className="ri-bar-chart-line"></i>
                Overall Performance
              </div>
            </div>
          </div>

          {/* Active Funds */}
          <div className="analytics-card">
            <div className="card-icon">
              <i className="ri-checkbox-circle-line"></i>
            </div>
            <div className="card-content">
              <div className="card-value">{fundStatus.active}</div>
              <div className="card-label">Active Funds</div>
              <div className="card-change">
                <i className="ri-check-line"></i>
                Currently Active
              </div>
            </div>
          </div>

          {/* Exhausted Funds */}
          <div className="analytics-card">
            <div className="card-icon">
              <i className="ri-close-circle-line"></i>
            </div>
            <div className="card-content">
              <div className="card-value">{fundStatus.exhausted}</div>
              <div className="card-label">Exhausted Funds</div>
              <div className="card-change urgent">
                <i className="ri-alert-line"></i>
                Depleted
              </div>
            </div>
          </div>

          {/* Logistics Funds */}
          <div className="analytics-card">
            <div className="card-icon">
              <i className="ri-truck-line"></i>
            </div>
            <div className="card-content">
              <div className="card-value">{fundStatus.logistics}</div>
              <div className="card-label">Logistics Funds</div>
              <div className="card-change">
                <i className="ri-roadster-line"></i>
                For Logistics
              </div>
            </div>
          </div>

          {/* Average Utilization */}
          <div className="analytics-card">
            <div className="card-icon">
              <i className="ri-percent-line"></i>
            </div>
            <div className="card-content">
              <div className="card-value">{fundStatus.avgUtilization}%</div>
              <div className="card-label">Avg Utilization</div>
              <div className="card-change">
                <i className="ri-line-chart-line"></i>
                Across All Funds
              </div>
            </div>
          </div>
        </div>

        {/* Budget Allocation by Type - Pie Chart */}
        <div className="user-activity-widget">
          <div className="widget-header">
            <div className="widget-title">
              <h3>Budget Allocation by Type</h3>
              <p>
                Distribution of funds across capital, recurrent, and personnel
              </p>
            </div>
          </div>
          <div className="widget-content">
            {budgetByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={budgetByType}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry: any) =>
                      `${entry.name} (${entry.count}): ${formatNairaCompact(
                        entry.value
                      )}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {budgetByType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg, white)",
                      border: "1px solid var(--tooltip-border, #e0e0e0)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      color: "var(--text-primary)",
                    }}
                    formatter={(value: number) => formatNairaCompact(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                <i
                  className="ri-pie-chart-line"
                  style={{ fontSize: "48px", marginBottom: "16px" }}
                ></i>
                <p>No budget data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Utilization by Type - Bar Chart */}
        <div className="main-analytics-widget">
          <div className="widget-header">
            <div className="widget-title">
              <h3>Budget Utilization by Type</h3>
              <p>Comparison of approved, committed, and actual spending</p>
            </div>
            <div className="widget-actions">
              <div className="date-picker">
                <i className="ri-bar-chart-line"></i>
                <span>In Millions (₦M)</span>
              </div>
            </div>
          </div>
          <div className="widget-content">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={utilizationByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="type"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#666" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  label={{
                    value: "Amount (₦M)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12, fill: "#666" },
                  }}
                />
                <ReTooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, white)",
                    border: "1px solid var(--tooltip-border, #e0e0e0)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    color: "var(--text-primary)",
                  }}
                  formatter={(value: any) => [`₦${value.toFixed(2)}M`, ""]}
                />
                <ReLegend />
                <Bar
                  dataKey="approved"
                  fill="#667eea"
                  radius={[4, 4, 0, 0]}
                  name="Approved"
                />
                <Bar
                  dataKey="committed"
                  fill="#ff9f43"
                  radius={[4, 4, 0, 0]}
                  name="Committed"
                />
                <Bar
                  dataKey="actual"
                  fill="#28c76f"
                  radius={[4, 4, 0, 0]}
                  name="Actual"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Departments - Bar Chart */}
        <div className="department-widget">
          <div className="widget-header">
            <div className="widget-title">
              <h3>Top 5 Departments</h3>
              <p>Departments with highest budget allocation</p>
            </div>
          </div>
          <div className="widget-content">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  label={{
                    value: "Amount (₦M)",
                    position: "insideBottom",
                    style: { fontSize: 12, fill: "#666" },
                  }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#666" }}
                  width={150}
                />
                <ReTooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, white)",
                    border: "1px solid var(--tooltip-border, #e0e0e0)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    color: "var(--text-primary)",
                  }}
                  formatter={(value: any) => [
                    `₦${value.toFixed(2)}M`,
                    "Allocated",
                  ]}
                />
                <Bar
                  dataKey="value"
                  fill="#667eea"
                  radius={[0, 4, 4, 0]}
                  name="Allocated"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Year Trend - Area Chart */}
        <div className="trends-widget">
          <div className="widget-header">
            <div className="widget-title">
              <h3>Budget Trend Over Years</h3>
              <p>Historical budget allocation and spending patterns</p>
            </div>
            <div className="widget-actions">
              <div className="trend-stats">
                <span className="trend-stat">
                  <i className="ri-calendar-line"></i>
                  Years: <strong>{budgetYearTrend.length}</strong>
                </span>
              </div>
            </div>
          </div>
          <div className="widget-content">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={budgetYearTrend}>
                <defs>
                  <linearGradient
                    id="approvedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="actualGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#28c76f" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#28c76f" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#666" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  label={{
                    value: "Amount (₦M)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12, fill: "#666" },
                  }}
                />
                <ReTooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, white)",
                    border: "1px solid var(--tooltip-border, #e0e0e0)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    color: "var(--text-primary)",
                  }}
                  formatter={(value: any, name: string) => [
                    `₦${value.toFixed(2)}M`,
                    name === "approved" ? "Approved" : "Actual",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke="#667eea"
                  strokeWidth={2}
                  fill="url(#approvedGradient)"
                  name="approved"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#28c76f"
                  strokeWidth={2}
                  fill="url(#actualGradient)"
                  name="actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Health Indicators */}
        <div className="status-summary-widget">
          <div className="widget-header">
            <div className="widget-title">
              <h3>Budget Health Indicators</h3>
              <p>Performance metrics and alerts across all funds</p>
            </div>
          </div>
          <div className="widget-content">
            <div className="status-grid">
              <div className="status-item">
                <div className="status-icon">
                  <i className="ri-arrow-down-circle-line"></i>
                </div>
                <div className="status-info">
                  <div className="status-value">
                    {healthIndicators.underUtilized.count}
                  </div>
                  <div className="status-label">Under-Utilized</div>
                </div>
                <div className="status-percentage">
                  {formatNairaCompact(healthIndicators.underUtilized.value)}
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon">
                  <i className="ri-check-double-line"></i>
                </div>
                <div className="status-info">
                  <div className="status-value">
                    {healthIndicators.wellUtilized.count}
                  </div>
                  <div className="status-label">Well-Utilized</div>
                </div>
                <div className="status-percentage">
                  {formatNairaCompact(healthIndicators.wellUtilized.value)}
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon">
                  <i className="ri-alert-line"></i>
                </div>
                <div className="status-info">
                  <div className="status-value">
                    {healthIndicators.overCommitted.count}
                  </div>
                  <div className="status-label">Over-Committed</div>
                </div>
                <div className="status-percentage">
                  {formatNairaCompact(healthIndicators.overCommitted.value)}
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon">
                  <i className="ri-error-warning-line"></i>
                </div>
                <div className="status-info">
                  <div className="status-value">
                    {healthIndicators.critical.count}
                  </div>
                  <div className="status-label">Critical (&gt;90%)</div>
                </div>
                <div className="status-percentage">
                  {formatNairaCompact(healthIndicators.critical.value)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
