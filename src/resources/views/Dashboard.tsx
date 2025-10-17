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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { repo, toTitleCase } from "../../bootstrap/repositories";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { useAuth } from "app/Context/AuthContext";
import "../assets/css/dashboard-flat.css";

const Dashboard = () => {
  const { staff } = useAuth();
  const [documents, setDocuments] = useState<DocumentResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noRecordFound, setNoRecordFound] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");

  const documentRepo = repo("document");

  // Helper function to format Naira currency
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to format Naira currency in compact form (K, M, B)
  const formatNairaCompact = (amount: number | undefined | null) => {
    // Handle null, undefined, or NaN values
    if (!amount || isNaN(amount)) {
      return "₦0.00";
    }

    const numAmount = Number(amount);

    if (numAmount >= 1000000000) {
      // Billions
      return `₦${(numAmount / 1000000000).toFixed(2)}B`;
    } else if (numAmount >= 1000000) {
      // Millions
      return `₦${(numAmount / 1000000).toFixed(2)}M`;
    } else if (numAmount >= 1000) {
      // Thousands
      return `₦${(numAmount / 1000).toFixed(2)}K`;
    } else {
      // Less than 1000
      return `₦${numAmount.toFixed(2)}`;
    }
  };

  // Helper function to transform slug to title case
  const slugToTitleCase = (slug: string): string => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Calculate total value of documents
  const totalDocumentValue = useMemo(() => {
    return documents.reduce((total, doc) => {
      const docValue = doc.approved_amount || 0;
      const paymentsValue =
        doc.payments?.reduce(
          (sum, payment) => sum + (payment.total_approved_amount || 0),
          0
        ) || 0;
      return total + Math.max(docValue, paymentsValue);
    }, 0);
  }, [documents]);

  // Calculate user's documents and their value
  const userDocuments = useMemo(() => {
    return documents.filter((doc) => doc.owner?.id === staff?.id);
  }, [documents, staff]);

  const userDocumentValue = useMemo(() => {
    return userDocuments.reduce((total, doc) => {
      const docValue = doc.approved_amount || 0;
      const paymentsValue =
        doc.payments?.reduce(
          (sum, payment) => sum + (payment.total_approved_amount || 0),
          0
        ) || 0;
      return total + Math.max(docValue, paymentsValue);
    }, 0);
  }, [userDocuments]);

  // Group documents by status
  const groupedByStatus = useMemo(() => {
    return documents.reduce((acc, doc) => {
      const status = doc.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [documents]);

  // Group documents by document type
  const groupedByDocumentType = useMemo(() => {
    return documents.reduce((acc, doc) => {
      const typeName = doc.document_type?.name || "Unknown Type";
      if (!acc[typeName]) {
        acc[typeName] = { count: 0, value: 0 };
      }
      acc[typeName].count += 1;

      const docValue = doc.approved_amount || 0;
      const paymentsValue =
        doc.payments?.reduce(
          (sum, payment) => sum + (payment.total_approved_amount || 0),
          0
        ) || 0;
      acc[typeName].value += Math.max(docValue, paymentsValue);

      return acc;
    }, {} as Record<string, { count: number; value: number }>);
  }, [documents]);

  // Prepare data for document type chart
  const documentTypeChartData = useMemo(() => {
    return Object.entries(groupedByDocumentType).map(([name, data]) => ({
      name,
      count: data.count,
      value: data.value,
    }));
  }, [groupedByDocumentType]);

  // Prepare data for status chart
  const statusChartData = useMemo(() => {
    return Object.entries(groupedByStatus).map(([status, count]) => ({
      name: slugToTitleCase(status),
      value: count,
      color: getStatusColorHex(status),
    }));
  }, [groupedByStatus]);

  const statusCards = useMemo(() => {
    const total = documents.length;
    return Object.entries(groupedByStatus).map(([status, count]) => ({
      status,
      count,
      label: slugToTitleCase(status),
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
      "payment-committed": "ri-money-dollar-circle-line",
      "payment-approved": "ri-check-double-line",
      submitted: "ri-send-plane-line",
      reviewed: "ri-eye-line",
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
      "payment-committed": "primary",
      "payment-approved": "success",
      submitted: "info",
      reviewed: "primary",
      unknown: "dark",
    };
    return colorMap[status.toLowerCase()] || "dark";
  }

  function getStatusColorHex(status: string): string {
    const colorMap: Record<string, string> = {
      pending: "#ff9f43",
      approved: "#28c76f",
      rejected: "#ea5455",
      processing: "#00cfe8",
      completed: "#28c76f",
      draft: "#6c757d",
      "payment-committed": "#667eea",
      "payment-approved": "#28c76f",
      submitted: "#00cfe8",
      reviewed: "#667eea",
      unknown: "#343a40",
    };
    return colorMap[status.toLowerCase()] || "#343a40";
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

  // Calculate additional metrics
  const totalDocumentTypes = useMemo(() => {
    return Object.keys(groupedByDocumentType).length;
  }, [groupedByDocumentType]);

  const topDocumentType = useMemo(() => {
    const types = Object.entries(groupedByDocumentType);
    if (types.length === 0) return { name: "N/A", count: 0 };
    return types.reduce(
      (max, [name, data]) =>
        data.count > max.count ? { name, count: data.count } : max,
      { name: types[0][0], count: types[0][1].count }
    );
  }, [groupedByDocumentType]);

  const totalDocumentStatuses = useMemo(() => {
    return Object.keys(groupedByStatus).length;
  }, [groupedByStatus]);

  const totalValueByType = useMemo(() => {
    return Object.values(groupedByDocumentType).reduce(
      (sum, data) => sum + data.value,
      0
    );
  }, [groupedByDocumentType]);

  // Calculate documents awaiting current user's action
  const documentsNeedingAttention = useMemo(() => {
    if (!staff?.id) return [];

    return documents.filter((doc) => {
      if (!doc.config || !doc.pointer || doc.is_completed) return false;

      const flowTypes: ("from" | "through" | "to")[] = [
        "from",
        "through",
        "to",
      ];

      for (const flowType of flowTypes) {
        const flowConfig = doc.config[flowType];
        if (
          flowConfig &&
          flowConfig.identifier === doc.pointer &&
          flowConfig.user_id === staff.id
        ) {
          return true;
        }
      }
      return false;
    });
  }, [documents, staff]);

  const documentsNeedingAttentionValue = useMemo(() => {
    return documentsNeedingAttention.reduce((total, doc) => {
      const docValue = doc.approved_amount || 0;
      const paymentsValue =
        doc.payments?.reduce(
          (sum, payment) => sum + (payment.total_approved_amount || 0),
          0
        ) || 0;
      return total + Math.max(docValue, paymentsValue);
    }, 0);
  }, [documentsNeedingAttention]);

  // ============================================
  // 1. TIME-BASED TRENDS ANALYTICS
  // ============================================
  const monthlyTrend = useMemo(() => {
    const last6Months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();

      const docsInMonth = documents.filter((doc) => {
        if (!doc.created_at) return false;
        const docDate = new Date(doc.created_at);
        return (
          docDate.getMonth() === date.getMonth() &&
          docDate.getFullYear() === date.getFullYear()
        );
      });

      last6Months.push({
        month: `${monthName} ${year}`,
        count: docsInMonth.length,
        value: docsInMonth.reduce((sum, doc) => {
          const docValue = doc.approved_amount || 0;
          const paymentsValue =
            doc.payments?.reduce(
              (pSum, payment) => pSum + (payment.total_approved_amount || 0),
              0
            ) || 0;
          return sum + Math.max(docValue, paymentsValue);
        }, 0),
      });
    }
    return last6Months;
  }, [documents]);

  const documentsThisMonth = useMemo(() => {
    const now = new Date();
    return documents.filter((doc) => {
      if (!doc.created_at) return false;
      const docDate = new Date(doc.created_at);
      return (
        docDate.getMonth() === now.getMonth() &&
        docDate.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [documents]);

  const documentsThisWeek = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return documents.filter((doc) => {
      if (!doc.created_at) return false;
      const docDate = new Date(doc.created_at);
      return docDate >= weekAgo;
    }).length;
  }, [documents]);

  // ============================================
  // 2. DEPARTMENT ANALYTICS
  // ============================================
  const departmentAnalytics = useMemo(() => {
    const deptMap = documents.reduce((acc, doc) => {
      const dept = doc.owner?.department || doc.dept || "Unknown";
      if (!acc[dept]) {
        acc[dept] = { count: 0, value: 0 };
      }
      acc[dept].count += 1;

      const docValue = doc.approved_amount || 0;
      const paymentsValue =
        doc.payments?.reduce(
          (sum, payment) => sum + (payment.total_approved_amount || 0),
          0
        ) || 0;
      acc[dept].value += Math.max(docValue, paymentsValue);

      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    return Object.entries(deptMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value);
  }, [documents]);

  const topDepartments = useMemo(() => {
    return departmentAnalytics.slice(0, 5);
  }, [departmentAnalytics]);

  // ============================================
  // 3. PAYMENT ANALYTICS
  // ============================================
  const paymentAnalytics = useMemo(() => {
    const payments = documents.flatMap((doc) => doc.payments || []);

    const methodDistribution = payments.reduce((acc, payment) => {
      const method = payment.payment_method || "unknown";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const currencyDistribution = payments.reduce((acc, payment) => {
      const currency = payment.currency || "NGN";
      acc[currency] = (acc[currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPaid = payments.reduce(
      (sum, p) => sum + (p.total_amount_paid || 0),
      0
    );
    const totalApproved = payments.reduce(
      (sum, p) => sum + (p.total_approved_amount || 0),
      0
    );
    const averagePayment =
      payments.length > 0 ? totalApproved / payments.length : 0;

    return {
      methodDistribution: Object.entries(methodDistribution).map(
        ([name, value]) => ({
          name: name
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          value,
        })
      ),
      currencyDistribution: Object.entries(currencyDistribution).map(
        ([name, value]) => ({
          name,
          value,
        })
      ),
      totalPaid,
      totalApproved,
      averagePayment,
      totalPayments: payments.length,
    };
  }, [documents]);

  // ============================================
  // 4. WORKFLOW BOTTLENECKS
  // ============================================
  const workflowAnalytics = useMemo(() => {
    const docsWithWorkflow = documents.filter((doc) => doc.workflow);
    const processingDocs = documents.filter(
      (doc) => !doc.is_completed && doc.created_at
    );

    const avgProcessingTime =
      processingDocs.reduce((sum, doc) => {
        const created = new Date(doc.created_at!);
        const now = new Date();
        const days = Math.floor(
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0) / (processingDocs.length || 1);

    const stuckDocuments = processingDocs.filter((doc) => {
      if (!doc.created_at) return false;
      const created = new Date(doc.created_at);
      const now = new Date();
      const days = Math.floor(
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );
      return days > 30; // Stuck if over 30 days
    });

    return {
      totalWithWorkflow: docsWithWorkflow.length,
      inProgress: processingDocs.length,
      avgProcessingDays: Math.round(avgProcessingTime),
      stuckCount: stuckDocuments.length,
      efficiencyScore:
        documents.length > 0
          ? Math.round(
              ((documents.length - stuckDocuments.length) / documents.length) *
                100
            )
          : 0,
    };
  }, [documents]);

  // ============================================
  // 5. COMPLETION RATES
  // ============================================
  const completionAnalytics = useMemo(() => {
    const completed = documents.filter((doc) => doc.is_completed);
    const completionRate =
      documents.length > 0
        ? Math.round((completed.length / documents.length) * 100)
        : 0;

    const completedDocs = documents.filter(
      (doc) => doc.is_completed && doc.created_at && doc.updated_at
    );

    const avgDaysToComplete =
      completedDocs.reduce((sum, doc) => {
        const created = new Date(doc.created_at!);
        const updated = new Date(doc.updated_at!);
        const days = Math.floor(
          (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0) / (completedDocs.length || 1);

    const byType = Object.entries(groupedByDocumentType)
      .map(([name, data]) => {
        const typeCompleted = documents.filter(
          (doc) => doc.document_type?.name === name && doc.is_completed
        ).length;
        return {
          name,
          rate:
            data.count > 0 ? Math.round((typeCompleted / data.count) * 100) : 0,
          completed: typeCompleted,
          total: data.count,
        };
      })
      .sort((a, b) => b.rate - a.rate);

    return {
      completionRate,
      completed: completed.length,
      pending: documents.length - completed.length,
      avgDaysToComplete: Math.round(avgDaysToComplete),
      byType,
    };
  }, [documents, groupedByDocumentType]);

  // ============================================
  // 6. BUDGET UTILIZATION
  // ============================================
  const budgetAnalytics = useMemo(() => {
    const byYear = documents.reduce((acc, doc) => {
      const year = doc.budget_year || new Date().getFullYear();
      if (!acc[year]) {
        acc[year] = { allocated: 0, used: 0, count: 0 };
      }

      const docValue = doc.approved_amount || 0;
      const paymentsValue =
        doc.payments?.reduce(
          (sum, payment) => sum + (payment.total_approved_amount || 0),
          0
        ) || 0;

      acc[year].allocated += Math.max(docValue, paymentsValue);
      acc[year].used +=
        doc.payments?.reduce(
          (sum, payment) => sum + (payment.total_amount_paid || 0),
          0
        ) || 0;
      acc[year].count += 1;

      return acc;
    }, {} as Record<number, { allocated: number; used: number; count: number }>);

    const currentYear = new Date().getFullYear();
    const currentYearData = byYear[currentYear] || {
      allocated: 0,
      used: 0,
      count: 0,
    };
    const utilizationRate =
      currentYearData.allocated > 0
        ? Math.round((currentYearData.used / currentYearData.allocated) * 100)
        : 0;

    return {
      byYear: Object.entries(byYear)
        .map(([year, data]) => ({
          year: parseInt(year),
          ...data,
          utilization:
            data.allocated > 0
              ? Math.round((data.used / data.allocated) * 100)
              : 0,
        }))
        .sort((a, b) => b.year - a.year),
      currentYear: {
        ...currentYearData,
        year: currentYear,
        utilization: utilizationRate,
      },
    };
  }, [documents]);

  // Skeleton loading component for dashboard
  const DashboardSkeleton = () => (
    <div className="dashboard-grid">
      {/* Top Analytics Cards Skeleton */}
      <div className="analytics-cards">
        {[...Array(8)].map((_, index) => (
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
      <div className="analytics__header">
        <h1>
          <i className="ri-dashboard-3-line"></i>
          Insights
        </h1>
        <p>
          Real-time overview of your document management system. Get a quick
          overview of your document management system.
        </p>
      </div>
      {/* Main Dashboard Grid with Skeleton Loading */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="dashboard-grid">
          {/* Top Analytics Cards */}
          <div className="analytics-cards">
            {/* 1. Total number of all documents */}
            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-file-list-3-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">{documents.length}</div>
                <div className="card-label">Total Documents</div>
                <div className="card-change">
                  <i className="ri-file-line"></i>
                  All Documents
                </div>
              </div>
              <button className="card-action-btn" onClick={() => {}}>
                <i className="ri-arrow-right-line"></i>
                View All
              </button>
            </div>

            {/* 2. Total Value of all documents */}
            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-money-dollar-circle-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">
                  {formatNairaCompact(totalDocumentValue)}
                </div>
                <div className="card-label">Total Document Value</div>
                <div className="card-change positive">
                  <i className="ri-arrow-up-line"></i>
                  Total Approved
                </div>
              </div>
              <button className="card-action-btn" onClick={() => {}}>
                <i className="ri-arrow-right-line"></i>
                View Details
              </button>
            </div>

            {/* 3. Total number of documents grouped by document type */}
            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-folder-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">{totalDocumentTypes}</div>
                <div className="card-label">Document Types</div>
                <div className="card-change">
                  <i className="ri-list-check"></i>
                  {topDocumentType.name}
                </div>
              </div>
              <button className="card-action-btn" onClick={() => {}}>
                <i className="ri-arrow-right-line"></i>
                View Types
              </button>
            </div>

            {/* 4. Total value of documents grouped by document type */}
            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-bar-chart-box-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">
                  {formatNairaCompact(totalValueByType)}
                </div>
                <div className="card-label">Value by Type</div>
                <div className="card-change positive">
                  <i className="ri-funds-line"></i>
                  Across {totalDocumentTypes} types
                </div>
              </div>
              <button className="card-action-btn" onClick={() => {}}>
                <i className="ri-arrow-right-line"></i>
                View Breakdown
              </button>
            </div>

            {/* 5. Total number of documents grouped by status */}
            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-bubble-chart-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">{totalDocumentStatuses}</div>
                <div className="card-label">Document Statuses</div>
                <div className="card-change">
                  <i className="ri-pulse-line"></i>
                  {Object.keys(groupedByStatus)
                    .map((status) => slugToTitleCase(status))
                    .join(", ")
                    .substring(0, 20)}
                  ...
                </div>
              </div>
              <button className="card-action-btn" onClick={() => {}}>
                <i className="ri-arrow-right-line"></i>
                By Status
              </button>
            </div>

            {/* 6. Total number of logged in user's documents */}
            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-user-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">{userDocuments.length}</div>
                <div className="card-label">My Documents</div>
                <div className="card-change">
                  <i className="ri-user-line"></i>
                  {staff?.name || "User"}
                </div>
              </div>
              <button className="card-action-btn" onClick={() => {}}>
                <i className="ri-arrow-right-line"></i>
                My Files
              </button>
            </div>

            {/* 7. Total value of logged in user's documents */}
            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-wallet-3-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">
                  {formatNairaCompact(userDocumentValue)}
                </div>
                <div className="card-label">My Document Value</div>
                <div className="card-change positive">
                  <i className="ri-arrow-up-line"></i>
                  Personal Total
                </div>
              </div>
              <button className="card-action-btn" onClick={() => {}}>
                <i className="ri-arrow-right-line"></i>
                View Mine
              </button>
            </div>

            {/* 8. Documents needing current user's attention */}
            <div className="analytics-card">
              <div className="card-icon">
                <i className="ri-alarm-warning-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">
                  {documentsNeedingAttention.length}
                </div>
                <div className="card-label">Needs My Attention</div>
                <div className="card-change urgent">
                  <i className="ri-time-line"></i>
                  {formatNairaCompact(documentsNeedingAttentionValue)}
                </div>
              </div>
              <button className="card-action-btn" onClick={() => {}}>
                <i className="ri-arrow-right-line"></i>
                Take Action
              </button>
            </div>
          </div>

          {/* Main Analytics Chart - Document Types */}
          <div className="main-analytics-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Documents by Type</h3>
                <p>Document count and value breakdown by type</p>
              </div>
              <div className="widget-actions">
                <div className="date-picker">
                  <i className="ri-bar-chart-line"></i>
                  <span>{documentTypeChartData.length} Types</span>
                </div>
              </div>
            </div>
            <div className="widget-content">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={documentTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#666" }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                    label={{
                      value: "Count",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 12, fill: "#666" },
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                    tickFormatter={(value) =>
                      `₦${(value / 1000000).toFixed(1)}M`
                    }
                    label={{
                      value: "Value (₦)",
                      angle: 90,
                      position: "insideRight",
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
                    formatter={(value: any, name: string) => {
                      if (name === "value") {
                        return [formatNaira(value), "Value"];
                      }
                      return [value, "Count"];
                    }}
                  />
                  <ReLegend />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    fill="#667eea"
                    radius={[4, 4, 0, 0]}
                    name="Document Count"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="value"
                    fill="#28c76f"
                    radius={[4, 4, 0, 0]}
                    name="Total Value"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Document Status Distribution */}
          <div className="user-activity-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Document Status Distribution</h3>
                <p>Documents grouped by current status</p>
              </div>
            </div>
            <div className="widget-content">
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={(entry: any) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                  <p>No status data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Document Type Value Chart */}
          <div className="views-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Document Value by Type</h3>
                <p>Financial breakdown by document type</p>
              </div>
            </div>
            <div className="widget-content">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={documentTypeChartData}>
                  <defs>
                    <linearGradient
                      id="valueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#28c76f" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#28c76f"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#666" }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                    tickFormatter={(value) =>
                      `₦${(value / 1000000).toFixed(1)}M`
                    }
                  />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg, white)",
                      border: "1px solid var(--tooltip-border, #e0e0e0)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      color: "var(--text-primary)",
                    }}
                    formatter={(value: any) => [formatNaira(value), "Value"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#28c76f"
                    strokeWidth={2}
                    fill="url(#valueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="progress-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Top Document Types by Value</h3>
                <p>Highest value document types</p>
              </div>
            </div>
            <div className="widget-content">
              <div className="progress-items">
                {documentTypeChartData
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((item, index) => {
                    const percentage =
                      totalDocumentValue > 0
                        ? Math.round((item.value / totalDocumentValue) * 100)
                        : 0;
                    const colors = [
                      "#667eea",
                      "#28c76f",
                      "#ff9f43",
                      "#ea5455",
                      "#00cfe8",
                    ];
                    return (
                      <div key={index} className="progress-item">
                        <div className="progress-header">
                          <span className="progress-label">{item.name}</span>
                          <span className="progress-value">
                            {formatNairaCompact(item.value)}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: colors[index % colors.length],
                            }}
                          ></div>
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginTop: "4px",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>
                            {item.count} document{item.count !== 1 ? "s" : ""}
                          </span>
                          <span>{percentage}% of total</span>
                        </div>
                      </div>
                    );
                  })}
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

          {/* 1. Time-Based Trends Widget */}
          <div className="trends-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Document Trends</h3>
                <p>
                  Monthly document creation and value trends (Last 6 months)
                </p>
              </div>
              <div className="widget-actions">
                <div className="trend-stats">
                  <span className="trend-stat">
                    <i className="ri-calendar-line"></i>
                    This Month: <strong>{documentsThisMonth}</strong>
                  </span>
                  <span className="trend-stat">
                    <i className="ri-calendar-week-line"></i>
                    This Week: <strong>{documentsThisWeek}</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="widget-content">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient
                      id="trendGradient1"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#667eea"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="trendGradient2"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#28c76f" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#28c76f"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#666" }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                    tickFormatter={(value) =>
                      `₦${(value / 1000000).toFixed(1)}M`
                    }
                  />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg, white)",
                      border: "1px solid var(--tooltip-border, #e0e0e0)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      color: "var(--text-primary)",
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === "value") {
                        return [formatNaira(value), "Value"];
                      }
                      return [value, "Count"];
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    stroke="#667eea"
                    strokeWidth={2}
                    fill="url(#trendGradient1)"
                    name="count"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="value"
                    stroke="#28c76f"
                    strokeWidth={2}
                    fill="url(#trendGradient2)"
                    name="value"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Department Analytics Widget */}
          <div className="department-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Top Departments</h3>
                <p>Document value by department</p>
              </div>
            </div>
            <div className="widget-content">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topDepartments} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                    tickFormatter={(value) =>
                      `₦${(value / 1000000).toFixed(1)}M`
                    }
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
                    formatter={(value: any, name: string) => {
                      if (name === "value") {
                        return [formatNaira(value), "Value"];
                      }
                      return [value, "Documents"];
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#667eea"
                    radius={[0, 4, 4, 0]}
                    name="value"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Payment Analytics Widget */}
          <div className="payment-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Payment Analytics</h3>
                <p>Payment methods and financial overview</p>
              </div>
            </div>
            <div className="widget-content">
              <div className="payment-overview">
                <div className="payment-stats">
                  <div className="payment-stat-card">
                    <div className="stat-icon">
                      <i className="ri-money-dollar-circle-line"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">
                        {formatNairaCompact(paymentAnalytics.totalApproved)}
                      </div>
                      <div className="stat-label">Total Approved</div>
                    </div>
                  </div>
                  <div className="payment-stat-card">
                    <div className="stat-icon">
                      <i className="ri-check-double-line"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">
                        {formatNairaCompact(paymentAnalytics.totalPaid)}
                      </div>
                      <div className="stat-label">Total Paid</div>
                    </div>
                  </div>
                  <div className="payment-stat-card">
                    <div className="stat-icon">
                      <i className="ri-bar-chart-line"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">
                        {formatNairaCompact(paymentAnalytics.averagePayment)}
                      </div>
                      <div className="stat-label">Average Payment</div>
                    </div>
                  </div>
                  <div className="payment-stat-card">
                    <div className="stat-icon">
                      <i className="ri-file-list-line"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">
                        {paymentAnalytics.totalPayments}
                      </div>
                      <div className="stat-label">Total Payments</div>
                    </div>
                  </div>
                </div>
                {paymentAnalytics.methodDistribution.length > 0 && (
                  <div className="payment-chart">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={paymentAnalytics.methodDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={(entry: any) =>
                            `${entry.name}: ${entry.value}`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {paymentAnalytics.methodDistribution.map(
                            (entry, index) => {
                              const colors = [
                                "#667eea",
                                "#28c76f",
                                "#ff9f43",
                                "#00cfe8",
                                "#ea5455",
                              ];
                              return (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={colors[index % colors.length]}
                                />
                              );
                            }
                          )}
                        </Pie>
                        <ReTooltip
                          contentStyle={{
                            backgroundColor: "var(--tooltip-bg, white)",
                            border: "1px solid var(--tooltip-border, #e0e0e0)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            color: "var(--text-primary)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Workflow Bottlenecks Widget */}
          <div className="workflow-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Workflow Performance</h3>
                <p>Processing efficiency and bottleneck analysis</p>
              </div>
            </div>
            <div className="widget-content">
              <div className="workflow-metrics">
                <div className="workflow-metric">
                  <div className="metric-icon">
                    <i className="ri-loader-line"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {workflowAnalytics.inProgress}
                    </div>
                    <div className="metric-label">In Progress</div>
                  </div>
                </div>
                <div className="workflow-metric">
                  <div className="metric-icon">
                    <i className="ri-time-line"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {workflowAnalytics.avgProcessingDays} days
                    </div>
                    <div className="metric-label">Avg Processing</div>
                  </div>
                </div>
                <div className="workflow-metric warning">
                  <div className="metric-icon">
                    <i className="ri-alert-line"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {workflowAnalytics.stuckCount}
                    </div>
                    <div className="metric-label">Stuck (30+ days)</div>
                  </div>
                </div>
                <div className="workflow-metric success">
                  <div className="metric-icon">
                    <i className="ri-speed-line"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {workflowAnalytics.efficiencyScore}%
                    </div>
                    <div className="metric-label">Efficiency Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Completion Rates Widget */}
          <div className="completion-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Completion Analytics</h3>
                <p>Document completion rates and performance</p>
              </div>
            </div>
            <div className="widget-content">
              <div className="completion-overview">
                <div className="completion-gauge">
                  <div className="gauge-container">
                    <svg viewBox="0 0 200 200" className="gauge-svg">
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="rgba(0,0,0,0.1)"
                        strokeWidth="20"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#28c76f"
                        strokeWidth="20"
                        strokeDasharray={`${
                          (completionAnalytics.completionRate / 100) * 502.65
                        } 502.65`}
                        strokeLinecap="round"
                        transform="rotate(-90 100 100)"
                      />
                    </svg>
                    <div className="gauge-text">
                      <div className="gauge-value">
                        {completionAnalytics.completionRate}%
                      </div>
                      <div className="gauge-label">Completed</div>
                    </div>
                  </div>
                  <div className="completion-details">
                    <div className="detail-item">
                      <i className="ri-check-line"></i>
                      <span>{completionAnalytics.completed} Completed</span>
                    </div>
                    <div className="detail-item">
                      <i className="ri-time-line"></i>
                      <span>{completionAnalytics.pending} Pending</span>
                    </div>
                    <div className="detail-item">
                      <i className="ri-calendar-line"></i>
                      <span>
                        {completionAnalytics.avgDaysToComplete} days avg
                      </span>
                    </div>
                  </div>
                </div>
                <div className="completion-by-type">
                  <h4>Completion by Type</h4>
                  {completionAnalytics.byType.slice(0, 5).map((item, index) => (
                    <div key={index} className="type-completion">
                      <div className="type-header">
                        <span className="type-name">{item.name}</span>
                        <span className="type-rate">{item.rate}%</span>
                      </div>
                      <div className="type-bar">
                        <div
                          className="type-fill"
                          style={{
                            width: `${item.rate}%`,
                            backgroundColor:
                              item.rate > 75
                                ? "#28c76f"
                                : item.rate > 50
                                ? "#ff9f43"
                                : "#ea5455",
                          }}
                        ></div>
                      </div>
                      <div className="type-info">
                        {item.completed} of {item.total} documents
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 6. Budget Utilization Widget */}
          <div className="budget-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Budget Utilization</h3>
                <p>Budget allocation and spending trends</p>
              </div>
            </div>
            <div className="widget-content">
              <div className="budget-overview">
                <div className="current-year-budget">
                  <h4>{budgetAnalytics.currentYear.year} Budget</h4>
                  <div className="budget-stats">
                    <div className="budget-stat">
                      <div className="stat-label">Allocated</div>
                      <div className="stat-value">
                        {formatNairaCompact(
                          budgetAnalytics.currentYear.allocated
                        )}
                      </div>
                    </div>
                    <div className="budget-stat">
                      <div className="stat-label">Used</div>
                      <div className="stat-value">
                        {formatNairaCompact(budgetAnalytics.currentYear.used)}
                      </div>
                    </div>
                    <div className="budget-stat">
                      <div className="stat-label">Utilization</div>
                      <div className="stat-value">
                        {budgetAnalytics.currentYear.utilization}%
                      </div>
                    </div>
                  </div>
                  <div className="budget-progress">
                    <div
                      className="budget-progress-fill"
                      style={{
                        width: `${budgetAnalytics.currentYear.utilization}%`,
                        backgroundColor:
                          budgetAnalytics.currentYear.utilization > 90
                            ? "#ea5455"
                            : budgetAnalytics.currentYear.utilization > 70
                            ? "#ff9f43"
                            : "#28c76f",
                      }}
                    ></div>
                  </div>
                </div>
                <div className="budget-by-year">
                  <h4>Historical Budget</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={budgetAnalytics.byYear.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#666" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#666" }}
                        tickFormatter={(value) =>
                          `₦${(value / 1000000).toFixed(1)}M`
                        }
                      />
                      <ReTooltip
                        contentStyle={{
                          backgroundColor: "var(--tooltip-bg, white)",
                          border: "1px solid var(--tooltip-border, #e0e0e0)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          color: "var(--text-primary)",
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === "allocated" || name === "used") {
                            return [
                              formatNaira(value),
                              name === "allocated" ? "Allocated" : "Used",
                            ];
                          }
                          return [value, name];
                        }}
                      />
                      <Bar
                        dataKey="allocated"
                        fill="#667eea"
                        radius={[4, 4, 0, 0]}
                        name="allocated"
                      />
                      <Bar
                        dataKey="used"
                        fill="#28c76f"
                        radius={[4, 4, 0, 0]}
                        name="used"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
