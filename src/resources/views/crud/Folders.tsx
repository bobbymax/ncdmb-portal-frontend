import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import { CardPageComponentProps } from "bootstrap";
import React, { useState, useMemo, useCallback } from "react";
import TextInput from "../components/forms/TextInput";
import FolderComponent from "../components/pages/FolderComponent";
import useFilters from "app/Hooks/useFilters";
import Select from "../components/forms/Select";
import RangeSlider from "../components/forms/RangeSlider";
import { formatCurrency, formatCurrencyCompact } from "app/Support/Helpers";
import moment from "moment";
import MultiSelect from "../components/forms/MultiSelect";
import Button from "../components/forms/Button";
import { useStateContext } from "app/Context/ContentContext";
import ResourceLoader from "../components/loaders/ResourceLoader";
import { useAuth } from "app/Context/AuthContext";
import "../../assets/css/folders-list-view.css";

const Folders: React.FC<
  CardPageComponentProps<DocumentResponseData, DocumentRepository>
> = ({ collection, onManageRawData }) => {
  const { setIsLoading, componentLoading } = useStateContext();
  const {
    collection: documents,
    searchValue,
    setSearchValue,
    categories,
    category,
    setCategory,
    currentAmount,
    setCurrentAmount,
    amountFilter,
    dateFilter,
    currentDate,
    setCurrentDate,
    owners,
    documentOwner,
    handleDocumentOwnersChange,
    isLoading,
    department,
    departments,
    handleDeptsChange,
    handleActionsChange,
    action,
    actions,
    resetFilters,
  } = useFilters(collection);

  // console.log(
  //   "Documents:",
  //   documents.length,
  //   "ComponentLoading:",
  //   componentLoading,
  //   "isLoading:",
  //   isLoading
  // );

  const { staff } = useAuth();

  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(
    new Set()
  );
  const [groupByActivity, setGroupByActivity] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [itemsPerGroup, setItemsPerGroup] = useState(20); // Show 20 items per group initially

  // Track when documents are initially loaded
  React.useEffect(() => {
    if (documents.length > 0 || !componentLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [documents.length, componentLoading]);

  // Group documents by workflow activity (awaiting action from current user)
  const groupedDocuments = useMemo(() => {
    if (!groupByActivity) return { "All Documents": documents };

    const grouped: Record<string, DocumentResponseData[]> = {
      "Awaiting My Action": [],
      "Awaiting Others": [],
      "In My Flow (From)": [],
      "In My Flow (Through)": [],
      "In My Flow (To)": [],
      Completed: [],
      "Other Documents": [],
    };

    documents.forEach((doc) => {
      let categorized = false;

      // Check if document is awaiting current user's action
      if (doc.config && doc.pointer && staff?.id) {
        const flowTypes: ("from" | "through" | "to")[] = [
          "from",
          "through",
          "to",
        ];

        for (const flowType of flowTypes) {
          const flowConfig = doc.config[flowType];

          if (flowConfig) {
            // Document is at this stage and awaiting current user
            if (
              flowConfig.identifier === doc.pointer &&
              flowConfig.user_id === staff.id
            ) {
              grouped["Awaiting My Action"].push(doc);
              categorized = true;
              break;
            }
            // Document is at this stage but awaiting someone else
            else if (flowConfig.identifier === doc.pointer) {
              grouped["Awaiting Others"].push(doc);
              categorized = true;
              break;
            }
            // Document is in my workflow flow but not at this stage yet
            else if (flowConfig.user_id === staff.id) {
              grouped[
                `In My Flow (${
                  flowType.charAt(0).toUpperCase() + flowType.slice(1)
                })`
              ].push(doc);
              categorized = true;
              break;
            }
          }
        }
      }

      // Check if completed
      if (!categorized && doc.is_completed) {
        grouped["Completed"].push(doc);
        categorized = true;
      }

      // Otherwise, it's other documents
      if (!categorized) {
        grouped["Other Documents"].push(doc);
      }
    });

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(grouped).filter(([_, docs]) => docs.length > 0)
    );
  }, [documents, groupByActivity, staff]);

  // Calculate statistics based on activity grouping
  const stats = useMemo(() => {
    const total = documents.length;

    let awaitingMyAction = 0;
    let awaitingOthers = 0;
    let completed = 0;
    let inMyWorkflow = 0;

    documents.forEach((doc) => {
      if (doc.is_completed) {
        completed++;
        return;
      }

      if (doc.config && doc.pointer && staff?.id) {
        const flowTypes: ("from" | "through" | "to")[] = [
          "from",
          "through",
          "to",
        ];
        let found = false;

        for (const flowType of flowTypes) {
          const flowConfig = doc.config[flowType];
          if (flowConfig) {
            if (
              flowConfig.identifier === doc.pointer &&
              flowConfig.user_id === staff.id
            ) {
              awaitingMyAction++;
              found = true;
              break;
            } else if (flowConfig.identifier === doc.pointer) {
              awaitingOthers++;
              found = true;
              break;
            } else if (flowConfig.user_id === staff.id) {
              inMyWorkflow++;
              found = true;
              break;
            }
          }
        }
      }
    });

    const totalAmount = documents.reduce(
      (sum, doc) => sum + (Number(doc.approved_amount) || 0),
      0
    );

    return {
      total,
      awaitingMyAction,
      awaitingOthers,
      completed,
      inMyWorkflow,
      totalAmount,
    };
  }, [documents, staff]);

  const handleOpenFolder = useCallback(
    (document: DocumentResponseData) => {
      setIsLoading(true);
      onManageRawData(
        document,
        "manage",
        `/desk/folders/category/${document.document_category_id}/document/${document.id}/edit`
      );
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    },
    [setIsLoading, onManageRawData]
  );

  const handleDocumentSelection = useCallback((docId: number) => {
    setSelectedDocuments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    // Handle bulk actions like archive, delete, etc.
    // Bulk action executed
    setSelectedDocuments(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(documents.map((doc) => doc.id)));
    }
  }, [selectedDocuments.size, documents]);

  const getActivityIcon = useCallback((groupName: string): string => {
    const iconMap: Record<string, string> = {
      "Awaiting My Action": "ri-alarm-warning-line",
      "Awaiting Others": "ri-group-line",
      "In My Flow (From)": "ri-send-plane-line",
      "In My Flow (Through)": "ri-route-line",
      "In My Flow (To)": "ri-inbox-line",
      Completed: "ri-checkbox-circle-line",
      "Other Documents": "ri-file-list-line",
      "All Documents": "ri-file-text-line",
    };
    return iconMap[groupName] || "ri-folder-line";
  }, []);

  const slugToTitleCase = useCallback((slug: string): string => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  const toggleGroupExpansion = useCallback((groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  }, []);

  // Memoize the displayed documents per group to avoid rendering all at once
  const getDisplayedDocs = useCallback(
    (groupDocs: DocumentResponseData[], groupName: string) => {
      const isExpanded = expandedGroups.has(groupName);
      return isExpanded ? groupDocs : groupDocs.slice(0, itemsPerGroup);
    },
    [expandedGroups, itemsPerGroup]
  );

  return (
    <div className="folder-desk">
      {/* Statistics Cards - Activity-Based Design */}
      <div className="stats-section-modern">
        <div className="stats-grid-modern">
          <div className="stat-card-modern urgent">
            <div className="stat-card-bg"></div>
            <div className="stat-card-content">
              <div className="stat-icon-modern">
                <i className="ri-alarm-warning-line"></i>
              </div>
              <div className="stat-info">
                <p className="stat-label">Awaiting My Action</p>
                <h3 className="stat-value">{stats.awaitingMyAction}</h3>
              </div>
            </div>
            <div className="stat-trend urgent">
              <i className="ri-time-line"></i>
              <span>Needs attention</span>
            </div>
          </div>

          <div className="stat-card-modern info">
            <div className="stat-card-bg"></div>
            <div className="stat-card-content">
              <div className="stat-icon-modern">
                <i className="ri-group-line"></i>
              </div>
              <div className="stat-info">
                <p className="stat-label">Awaiting Others</p>
                <h3 className="stat-value">{stats.awaitingOthers}</h3>
              </div>
            </div>
            <div className="stat-trend">
              <i className="ri-user-follow-line"></i>
              <span>In progress</span>
            </div>
          </div>

          <div className="stat-card-modern success">
            <div className="stat-card-bg"></div>
            <div className="stat-card-content">
              <div className="stat-icon-modern">
                <i className="ri-checkbox-circle-line"></i>
              </div>
              <div className="stat-info">
                <p className="stat-label">Completed</p>
                <h3 className="stat-value">{stats.completed}</h3>
              </div>
            </div>
            <div className="stat-trend positive">
              <i className="ri-check-double-line"></i>
              <span>Done</span>
            </div>
          </div>

          <div className="stat-card-modern primary">
            <div className="stat-card-bg"></div>
            <div className="stat-card-content">
              <div className="stat-icon-modern">
                <i className="ri-file-text-line"></i>
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Documents</p>
                <h3 className="stat-value">{stats.total}</h3>
              </div>
            </div>
            <div className="stat-trend">
              <i className="ri-wallet-3-line"></i>
              <span>{formatCurrencyCompact(stats.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="desk-main-modern">
        {/* Left Panel - Compact Filters */}
        <div className="desk-sidebar-compact">
          {/* Search */}
          <div className="sidebar-section">
            <div className="section-header-compact">
              <i className="ri-search-line"></i>
              <span>Search</span>
            </div>
            <div className="search-input-compact">
              <TextInput
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search..."
                size="sm"
                width={100}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="sidebar-section">
            <div className="section-header-compact">
              <i className="ri-filter-3-line"></i>
              <span>Filters</span>
              {(category ||
                documentOwner ||
                department ||
                action ||
                currentAmount !== amountFilter[0]) && (
                <button
                  className="reset-btn-compact"
                  onClick={() => resetFilters()}
                >
                  <i className="ri-refresh-line"></i>
                </button>
              )}
            </div>

            <div className="filter-compact">
              <Select
                label="Type"
                defaultValue=""
                options={categories}
                valueKey="value"
                labelKey="label"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                size="xl"
                defaultCheckDisabled
                defaultText="All"
              />
            </div>

            <div className="filter-compact">
              <label className="filter-label-compact">Amount</label>
              <RangeSlider
                label=""
                value={currentAmount}
                onChange={(e) => setCurrentAmount(Number(e.target.value))}
                min={Number(amountFilter[0])}
                max={Number(amountFilter[1])}
                name="amount"
              />
              <div className="range-value-compact">
                {formatCurrencyCompact(currentAmount)}
              </div>
            </div>

            <div className="filter-compact">
              <label className="filter-label-compact">Date</label>
              <RangeSlider
                label=""
                value={currentDate}
                onChange={(e) => setCurrentDate(Number(e.target.value))}
                min={Number(dateFilter[0]?.getTime())}
                max={Number(dateFilter[1]?.getTime())}
                name="date"
              />
              <div className="range-value-compact">
                {moment(currentDate).format("MMM DD, YYYY")}
              </div>
            </div>

            <div className="filter-compact">
              <MultiSelect
                label="Initiators"
                options={owners}
                value={documentOwner}
                onChange={handleDocumentOwnersChange}
                placeholder="All"
                isSearchable
                isDisabled={isLoading}
              />
            </div>

            <div className="filter-compact">
              <MultiSelect
                label="Departments"
                options={departments}
                value={department}
                onChange={handleDeptsChange}
                placeholder="All"
                isSearchable
                isDisabled={isLoading}
              />
            </div>
          </div>

          {/* Bulk Actions - Compact */}
          {selectedDocuments.size > 0 && (
            <div className="sidebar-section bulk-section">
              <div className="section-header-compact urgent">
                <i className="ri-checkbox-multiple-line"></i>
                <span>{selectedDocuments.size} Selected</span>
              </div>
              <div className="bulk-actions-compact">
                <button
                  className="bulk-action-compact archive"
                  onClick={() => handleBulkAction("archive")}
                  title="Archive"
                >
                  <i className="ri-archive-line"></i>
                </button>
                <button
                  className="bulk-action-compact export"
                  onClick={() => handleBulkAction("export")}
                  title="Export"
                >
                  <i className="ri-download-line"></i>
                </button>
                <button
                  className="bulk-action-compact share"
                  onClick={() => handleBulkAction("share")}
                  title="Share"
                >
                  <i className="ri-share-line"></i>
                </button>
                <button
                  className="bulk-action-compact delete"
                  onClick={() => handleBulkAction("delete")}
                  title="Delete"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          )}

          {/* Quick Access - Compact */}
          <div className="sidebar-section">
            <div className="section-header-compact">
              <i className="ri-flashlight-line"></i>
              <span>Quick</span>
            </div>
            <div className="quick-links-compact">
              <button className="quick-link-compact">
                <i className="ri-time-line"></i>
                <span>Recent</span>
              </button>
              <button className="quick-link-compact">
                <i className="ri-heart-line"></i>
                <span>Favorites</span>
              </button>
              <button className="quick-link-compact">
                <i className="ri-share-line"></i>
                <span>Shared</span>
              </button>
              <button className="quick-link-compact">
                <i className="ri-star-line"></i>
                <span>Important</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Document Display */}
        <div className="desk-content-modern">
          {/* Content Header */}
          <div className="content-header-modern">
            <div className="header-left">
              <div className="group-toggle-modern">
                <button
                  className={`group-btn ${groupByActivity ? "active" : ""}`}
                  onClick={() => setGroupByActivity(!groupByActivity)}
                >
                  <i
                    className={
                      groupByActivity
                        ? "ri-folders-line"
                        : "ri-file-list-3-line"
                    }
                  ></i>
                  <span>
                    {groupByActivity ? "Activity Groups" : "All Files"}
                  </span>
                </button>
              </div>

              <div className="showing-info">
                <i className="ri-information-line"></i>
                <span>Showing {documents.length} documents</span>
              </div>
            </div>

            <div className="header-right">
              <button
                className={`select-all-btn ${
                  selectedDocuments.size === documents.length ? "active" : ""
                }`}
                onClick={handleSelectAll}
              >
                <i className="ri-checkbox-multiple-line"></i>
                <span>
                  {selectedDocuments.size > 0
                    ? `${selectedDocuments.size} selected`
                    : "Select All"}
                </span>
              </button>
            </div>
          </div>

          {/* Documents Display */}
          {componentLoading || isLoading || initialLoading ? (
            <div className="documents-container-list">
              {/* Skeleton Loading for Activity Groups */}
              {[1, 2].map((groupIndex) => (
                <div key={groupIndex} className="activity-group skeleton">
                  <div className="activity-group-header skeleton">
                    <div className="group-header-left">
                      <div className="skeleton-icon"></div>
                      <div className="skeleton-text skeleton-title"></div>
                      <div className="skeleton-badge"></div>
                    </div>
                    <div className="group-header-right">
                      <div className="skeleton-text skeleton-value"></div>
                    </div>
                  </div>

                  <div className="document-list">
                    {[1, 2, 3, 4].map((itemIndex) => (
                      <div
                        key={itemIndex}
                        className="document-list-item skeleton"
                      >
                        <div className="doc-checkbox skeleton">
                          <div className="skeleton-checkbox"></div>
                        </div>
                        <div className="doc-info-main">
                          <div className="doc-title-row">
                            <div className="skeleton-text skeleton-doc-title"></div>
                            <div className="skeleton-text skeleton-doc-ref"></div>
                          </div>
                          <div className="doc-meta-row">
                            <div className="skeleton-text skeleton-meta"></div>
                            <div className="skeleton-text skeleton-meta"></div>
                            <div className="skeleton-text skeleton-meta"></div>
                            <div className="skeleton-text skeleton-meta"></div>
                          </div>
                        </div>
                        <div className="doc-status-section">
                          <div className="skeleton-text skeleton-amount"></div>
                          <div className="skeleton-badge"></div>
                        </div>
                        <div className="doc-action">
                          <div className="skeleton-button"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="empty-state-modern">
              <div className="empty-state-visual">
                <div className="empty-state-circle">
                  <i className="ri-folder-open-line"></i>
                </div>
              </div>
              <div className="empty-state-text">
                <h3>No Documents Found</h3>
                <p>
                  {searchValue ||
                  category ||
                  documentOwner ||
                  department ||
                  action
                    ? "No documents match your current filters. Try adjusting your search criteria."
                    : "Get started by creating your first document or importing existing ones."}
                </p>
              </div>
              <div className="empty-state-actions-modern">
                <button className="empty-action-btn primary">
                  <i className="ri-add-line"></i>
                  <span>Create Document</span>
                </button>
                <button className="empty-action-btn outline">
                  <i className="ri-download-line"></i>
                  <span>Import Documents</span>
                </button>
                {(searchValue ||
                  category ||
                  documentOwner ||
                  department ||
                  action) && (
                  <button
                    className="empty-action-btn outline"
                    onClick={() => resetFilters()}
                  >
                    <i className="ri-filter-off-line"></i>
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="documents-container-list">
              {Object.entries(groupedDocuments).map(
                ([groupName, groupDocs]) => (
                  <div key={groupName} className="activity-group">
                    {/* Activity Group Header */}
                    <div className="activity-group-header">
                      <div className="group-header-left">
                        <i className={getActivityIcon(groupName)}></i>
                        <h3>{groupName}</h3>
                        <span className="group-count-badge">
                          {groupDocs.length}
                        </span>
                      </div>
                      <div className="group-header-right">
                        <span className="group-value">
                          {formatCurrencyCompact(
                            groupDocs.reduce(
                              (sum, doc) =>
                                sum + (Number(doc.approved_amount) || 0),
                              0
                            )
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Document List Items */}
                    <div className="document-list">
                      {getDisplayedDocs(groupDocs, groupName).map(
                        (document) => (
                          <div
                            key={document.id}
                            className="document-list-item"
                            onClick={() => handleOpenFolder(document)}
                          >
                            {/* Checkbox */}
                            <div
                              className="doc-checkbox"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentSelection(document.id);
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedDocuments.has(document.id)}
                                onChange={() => {}}
                                className="list-checkbox"
                                id={`doc-list-${document.id}`}
                              />
                            </div>

                            {/* Document Info */}
                            <div className="doc-info-main">
                              <div className="doc-title-row">
                                <h4 className="doc-title">{document.title}</h4>
                                <span className="doc-ref">#{document.ref}</span>
                              </div>
                              <div className="doc-meta-row">
                                <span className="doc-type">
                                  <i className="ri-file-text-line"></i>
                                  {document.document_type?.name ||
                                    "Unknown Type"}
                                </span>
                                <span className="doc-owner">
                                  <i className="ri-user-line"></i>
                                  {document.owner?.name || "Unknown"}
                                </span>
                                <span className="doc-dept">
                                  <i className="ri-building-line"></i>
                                  {document.owner?.department ||
                                    document.dept ||
                                    "N/A"}
                                </span>
                                <span className="doc-date">
                                  <i className="ri-calendar-line"></i>
                                  {moment(document.created_at).format(
                                    "MMM DD, YYYY"
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Document Status & Amount */}
                            <div className="doc-status-section">
                              <div className="doc-amount">
                                {document.approved_amount
                                  ? formatCurrencyCompact(
                                      document.approved_amount
                                    )
                                  : "₦0.00"}
                              </div>
                              <div
                                className={`doc-status-badge ${document.status}`}
                              >
                                {slugToTitleCase(document.status || "unknown")}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="doc-action">
                              <button className="list-action-btn">
                                <span>Open</span>
                                <i className="ri-arrow-right-line"></i>
                              </button>
                            </div>
                          </div>
                        )
                      )}

                      {/* Load More Button */}
                      {groupDocs.length > itemsPerGroup &&
                        !expandedGroups.has(groupName) && (
                          <div className="text-center py-3">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroupExpansion(groupName);
                              }}
                              style={{
                                borderRadius: "8px",
                                padding: "8px 20px",
                                fontWeight: "500",
                                fontSize: "0.85rem",
                              }}
                            >
                              <i className="ri-arrow-down-s-line me-1"></i>
                              Load More ({groupDocs.length - itemsPerGroup}{" "}
                              remaining)
                            </button>
                          </div>
                        )}

                      {/* Show Less Button */}
                      {expandedGroups.has(groupName) &&
                        groupDocs.length > itemsPerGroup && (
                          <div className="text-center py-3">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroupExpansion(groupName);
                              }}
                              style={{
                                borderRadius: "8px",
                                padding: "8px 20px",
                                fontWeight: "500",
                                fontSize: "0.85rem",
                              }}
                            >
                              <i className="ri-arrow-up-s-line me-1"></i>
                              Show Less
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Folders;
