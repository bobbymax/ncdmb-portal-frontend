import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import { CardPageComponentProps } from "bootstrap";
import React, { useState, useMemo } from "react";
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

  const [activeView, setActiveView] = useState<"grid" | "list">("grid");
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(
    new Set()
  );
  const [groupByType, setGroupByType] = useState(true);

  // Group documents by document type
  const groupedDocuments = useMemo(() => {
    if (!groupByType) return { "All Documents": documents };

    const grouped: Record<string, DocumentResponseData[]> = {};

    documents.forEach((doc) => {
      const typeName = doc.document_type?.name || "Uncategorized";
      if (!grouped[typeName]) {
        grouped[typeName] = [];
      }
      grouped[typeName].push(doc);
    });

    return grouped;
  }, [documents, groupByType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const archived = documents.filter((doc) => doc.is_archived === 1).length;
    const active = total - archived;
    const totalAmount = documents.reduce(
      (sum, doc) => sum + (Number(doc.approved_amount) || 0),
      0
    );

    return { total, archived, active, totalAmount };
  }, [documents]);

  const handleOpenFolder = (document: DocumentResponseData) => {
    setIsLoading(true);
    onManageRawData(
      document,
      "manage",
      `/desk/folders/category/${document.document_category_id}/document/${document.id}/edit`
    );
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleDocumentSelection = (docId: number) => {
    setSelectedDocuments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const handleBulkAction = (action: string) => {
    // Handle bulk actions like archive, delete, etc.
    // Bulk action executed
    setSelectedDocuments(new Set());
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(documents.map((doc) => doc.id)));
    }
  };

  return (
    <div className="folder-desk">
      {/* Statistics Cards - Sleek Design */}
      <div className="stats-section-modern">
        <div className="stats-grid-modern">
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
              <i className="ri-arrow-up-line"></i>
              <span>12%</span>
            </div>
          </div>

          <div className="stat-card-modern success">
            <div className="stat-card-bg"></div>
            <div className="stat-card-content">
              <div className="stat-icon-modern">
                <i className="ri-checkbox-circle-line"></i>
              </div>
              <div className="stat-info">
                <p className="stat-label">Active</p>
                <h3 className="stat-value">{stats.active}</h3>
              </div>
            </div>
            <div className="stat-trend positive">
              <i className="ri-arrow-up-line"></i>
              <span>8%</span>
            </div>
          </div>

          <div className="stat-card-modern warning">
            <div className="stat-card-bg"></div>
            <div className="stat-card-content">
              <div className="stat-icon-modern">
                <i className="ri-archive-line"></i>
              </div>
              <div className="stat-info">
                <p className="stat-label">Archived</p>
                <h3 className="stat-value">{stats.archived}</h3>
              </div>
            </div>
            <div className="stat-trend">
              <i className="ri-arrow-down-line"></i>
              <span>3%</span>
            </div>
          </div>

          <div className="stat-card-modern info">
            <div className="stat-card-bg"></div>
            <div className="stat-card-content">
              <div className="stat-icon-modern">
                <i className="ri-money-dollar-circle-line"></i>
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Value</p>
                <h3 className="stat-value">
                  {formatCurrencyCompact(stats.totalAmount)}
                </h3>
              </div>
            </div>
            <div className="stat-trend positive">
              <i className="ri-arrow-up-line"></i>
              <span>15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="desk-main-modern">
        {/* Left Panel - Filters & Actions */}
        <div className="desk-sidebar-modern">
          <div className="sidebar-card">
            <div className="sidebar-header">
              <i className="ri-filter-3-line"></i>
              <h3>Filters</h3>
            </div>

            <div className="search-box-modern">
              <i className="ri-search-line search-icon"></i>
              <TextInput
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search documents..."
                size="sm"
                width={100}
              />
            </div>

            <div className="filter-group">
              <Select
                label="Document Type"
                defaultValue=""
                options={categories}
                valueKey="value"
                labelKey="label"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                size="xs"
                defaultCheckDisabled
                defaultText="All Types"
              />
            </div>

            <div className="filter-group">
              <RangeSlider
                label="Amount Range"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(Number(e.target.value))}
                min={Number(amountFilter[0])}
                max={Number(amountFilter[1])}
                name="amount"
              />
              <div className="amount-display">
                <span className="amount-label">Current:</span>
                <span className="amount-value">
                  {formatCurrencyCompact(currentAmount)}
                </span>
              </div>
            </div>

            <div className="filter-group">
              <RangeSlider
                label="Date Range"
                value={currentDate}
                onChange={(e) => setCurrentDate(Number(e.target.value))}
                min={Number(dateFilter[0]?.getTime())}
                max={Number(dateFilter[1]?.getTime())}
                name="date"
              />
              <div className="date-display">
                <span className="date-label">Before:</span>
                <span className="date-value">
                  {moment(currentDate).format("LL")}
                </span>
              </div>
            </div>

            <div className="filter-group">
              <MultiSelect
                label="Initiators"
                options={owners}
                value={documentOwner}
                onChange={handleDocumentOwnersChange}
                placeholder="Select initiators"
                isSearchable
                isDisabled={isLoading}
              />
            </div>

            <div className="filter-group">
              <MultiSelect
                label="Departments"
                options={departments}
                value={department}
                onChange={handleDeptsChange}
                placeholder="Select departments"
                isSearchable
                isDisabled={isLoading}
              />
            </div>

            <div className="filter-group">
              <MultiSelect
                label="Actions"
                options={actions}
                value={action}
                onChange={handleActionsChange}
                placeholder="Select actions"
                isSearchable
                isDisabled={isLoading}
              />
            </div>

            <div className="filter-actions-modern">
              <Button
                label="Reset All"
                variant="outline"
                handleClick={() => resetFilters()}
                size="xs"
                icon="ri-refresh-line"
              />
            </div>
          </div>

          {/* Bulk Actions Panel */}
          {selectedDocuments.size > 0 && (
            <div className="sidebar-card bulk-card">
              <div className="sidebar-header">
                <i className="ri-checkbox-multiple-line"></i>
                <h3>Bulk Actions</h3>
                <span className="badge-count">{selectedDocuments.size}</span>
              </div>

              <div className="bulk-actions-modern">
                <button
                  className="bulk-btn archive"
                  onClick={() => handleBulkAction("archive")}
                >
                  <i className="ri-archive-line"></i>
                  <span>Archive</span>
                </button>
                <button
                  className="bulk-btn export"
                  onClick={() => handleBulkAction("export")}
                >
                  <i className="ri-download-line"></i>
                  <span>Export</span>
                </button>
                <button
                  className="bulk-btn share"
                  onClick={() => handleBulkAction("share")}
                >
                  <i className="ri-share-line"></i>
                  <span>Share</span>
                </button>
                <button
                  className="bulk-btn delete"
                  onClick={() => handleBulkAction("delete")}
                >
                  <i className="ri-delete-bin-line"></i>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="sidebar-card quick-card">
            <div className="sidebar-header">
              <i className="ri-flashlight-line"></i>
              <h3>Quick Access</h3>
            </div>

            <div className="quick-links">
              <button className="quick-link">
                <i className="ri-time-line"></i>
                <span>Recent</span>
                <div className="quick-link-badge">12</div>
              </button>
              <button className="quick-link">
                <i className="ri-heart-line"></i>
                <span>Favorites</span>
                <div className="quick-link-badge">8</div>
              </button>
              <button className="quick-link">
                <i className="ri-share-line"></i>
                <span>Shared</span>
                <div className="quick-link-badge">5</div>
              </button>
              <button className="quick-link">
                <i className="ri-star-line"></i>
                <span>Important</span>
                <div className="quick-link-badge">3</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Document Display */}
        <div className="desk-content-modern">
          {/* Content Header */}
          <div className="content-header-modern">
            <div className="header-left">
              <div className="view-toggle-modern">
                <button
                  className={`view-btn ${
                    activeView === "grid" ? "active" : ""
                  }`}
                  onClick={() => setActiveView("grid")}
                  title="Grid View"
                >
                  <i className="ri-layout-grid-line"></i>
                </button>
                <button
                  className={`view-btn ${
                    activeView === "list" ? "active" : ""
                  }`}
                  onClick={() => setActiveView("list")}
                  title="List View"
                >
                  <i className="ri-list-check"></i>
                </button>
              </div>

              <div className="group-toggle-modern">
                <button
                  className={`group-btn ${groupByType ? "active" : ""}`}
                  onClick={() => setGroupByType(!groupByType)}
                >
                  <i
                    className={
                      groupByType ? "ri-folder-line" : "ri-file-list-line"
                    }
                  ></i>
                  <span>{groupByType ? "Grouped" : "All Files"}</span>
                </button>
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
          {isLoading ? (
            <div className="loading-state-modern">
              <ResourceLoader
                isLoading={true}
                message="Loading documents..."
                variant="character"
                size="large"
              >
                <div></div>
              </ResourceLoader>
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
            <div className="documents-container-modern">
              {Object.entries(groupedDocuments).map(
                ([groupName, groupDocs]) => (
                  <div key={groupName} className="document-group-modern">
                    {groupByType && (
                      <div className="group-header-modern">
                        <div className="group-title-area">
                          <i className="ri-folder-3-line"></i>
                          <h3>{groupName}</h3>
                          <span className="group-badge">
                            {groupDocs.length}
                          </span>
                        </div>
                        <div className="group-line"></div>
                      </div>
                    )}

                    <div
                      className={`documents-grid-modern ${
                        activeView === "list" ? "list-view" : ""
                      }`}
                    >
                      {groupDocs.map((document) => (
                        <div
                          key={document.id}
                          className="document-wrapper-modern"
                        >
                          <div className="document-selector-modern">
                            <input
                              type="checkbox"
                              checked={selectedDocuments.has(document.id)}
                              onChange={() =>
                                handleDocumentSelection(document.id)
                              }
                              className="modern-checkbox"
                              id={`doc-${document.id}`}
                            />
                            <label
                              htmlFor={`doc-${document.id}`}
                              className="checkbox-label"
                            ></label>
                          </div>

                          <FolderComponent
                            loader={componentLoading}
                            document={document}
                            openFolder={handleOpenFolder}
                          />
                        </div>
                      ))}
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
