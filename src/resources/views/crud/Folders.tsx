import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import { CardPageComponentProps } from "bootstrap";
import React, { useState, useMemo } from "react";
import TextInput from "../components/forms/TextInput";
import FolderComponent from "../components/pages/FolderComponent";
import useFilters from "app/Hooks/useFilters";
import Select from "../components/forms/Select";
import RangeSlider from "../components/forms/RangeSlider";
import { formatCurrency } from "app/Support/Helpers";
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
      (sum, doc) => sum + (doc.amount || 0),
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
    console.log(
      `Bulk action: ${action} on ${selectedDocuments.size} documents`
    );
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
    <div className="document-desk">
      {/* Statistics Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="ri-file-text-line"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Documents</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">
              <i className="ri-checkbox-circle-line"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.active}</h3>
              <p>Active Documents</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon archived">
              <i className="ri-archive-line"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.archived}</h3>
              <p>Archived</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amount">
              <i className="ri-money-dollar-circle-line"></i>
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(stats.totalAmount)}</h3>
              <p>Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="desk-main">
        {/* Left Panel - Filters & Actions */}
        <div className="desk-sidebar">
          <div className="sidebar-section">
            <h3 className="section-title">
              <i className="ri-search-line"></i>
              Search & Filters
            </h3>

            <div className="filter-group">
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
                  {formatCurrency(currentAmount)}
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

            <div className="filter-actions">
              <Button
                label="Reset Filters"
                variant="danger"
                handleClick={() => resetFilters()}
                size="xs"
                icon="ri-filter-off-line"
              />
            </div>
          </div>

          {/* Bulk Actions Panel */}
          {selectedDocuments.size > 0 && (
            <div className="sidebar-section bulk-actions">
              <h3 className="section-title">
                <i className="ri-checkbox-multiple-line"></i>
                Bulk Actions ({selectedDocuments.size})
              </h3>

              <div className="bulk-actions-grid">
                <Button
                  label="Archive"
                  variant="warning"
                  handleClick={() => handleBulkAction("archive")}
                  size="xs"
                  icon="ri-archive-line"
                />
                <Button
                  label="Export"
                  variant="outline"
                  handleClick={() => handleBulkAction("export")}
                  size="xs"
                  icon="ri-download-line"
                />
                <Button
                  label="Share"
                  variant="info"
                  handleClick={() => handleBulkAction("share")}
                  size="xs"
                  icon="ri-share-line"
                />
                <Button
                  label="Delete"
                  variant="danger"
                  handleClick={() => handleBulkAction("delete")}
                  size="xs"
                  icon="ri-delete-bin-line"
                />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="sidebar-section">
            <h3 className="section-title">
              <i className="ri-flashlight-line"></i>
              Quick Actions
            </h3>

            <div className="quick-actions">
              <Button
                label="Recent Documents"
                variant="outline"
                handleClick={() => console.log("Show recent")}
                size="xs"
                icon="ri-time-line"
              />
              <Button
                label="Favorites"
                variant="outline"
                handleClick={() => console.log("Show favorites")}
                size="xs"
                icon="ri-heart-line"
              />
              <Button
                label="Shared with Me"
                variant="outline"
                handleClick={() => console.log("Show shared")}
                size="xs"
                icon="ri-share-line"
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Document Display */}
        <div className="desk-content">
          {/* Content Header */}
          <div className="content-header">
            <div className="content-controls">
              <div className="view-toggle">
                <Button
                  label="Grid"
                  variant={activeView === "grid" ? "primary" : "outline"}
                  handleClick={() => setActiveView("grid")}
                  size="xs"
                  icon="ri-grid-line"
                />
                <Button
                  label="List"
                  variant={activeView === "list" ? "primary" : "outline"}
                  handleClick={() => setActiveView("list")}
                  size="xs"
                  icon="ri-list-check"
                />
              </div>

              <div className="group-toggle">
                <Button
                  label={groupByType ? "Grouped by Type" : "All Documents"}
                  variant={groupByType ? "primary" : "outline"}
                  handleClick={() => setGroupByType(!groupByType)}
                  size="xs"
                  icon={groupByType ? "ri-folder-line" : "ri-file-list-line"}
                />
              </div>
            </div>

            <div className="content-actions">
              <Button
                label="Select All"
                variant={
                  selectedDocuments.size === documents.length
                    ? "primary"
                    : "outline"
                }
                handleClick={handleSelectAll}
                size="xs"
                icon="ri-checkbox-multiple-line"
              />
              <span className="selection-count">
                {selectedDocuments.size > 0 &&
                  `${selectedDocuments.size} selected`}
              </span>
            </div>
          </div>

          {/* Documents Display */}
          {isLoading ? (
            <ResourceLoader
              isLoading={true}
              message="Loading documents..."
              variant="character"
              size="large"
            >
              <div></div>
            </ResourceLoader>
          ) : documents.length === 0 ? (
            <div className="documents-empty-state">
              <div className="empty-state-icon">
                <i className="ri-folder-open-line"></i>
              </div>
              <div className="empty-state-content">
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
                <div className="empty-state-actions">
                  <Button
                    label="Create Document"
                    variant="primary"
                    handleClick={() => console.log("Create document")}
                    size="sm"
                    icon="ri-add-line"
                  />
                  <Button
                    label="Import Documents"
                    variant="outline"
                    handleClick={() => console.log("Import documents")}
                    size="sm"
                    icon="ri-download-line"
                  />
                  {searchValue ||
                  category ||
                  documentOwner ||
                  department ||
                  action ? (
                    <Button
                      label="Clear Filters"
                      variant="outline"
                      handleClick={() => resetFilters()}
                      size="sm"
                      icon="ri-filter-off-line"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="documents-container">
              {Object.entries(groupedDocuments).map(
                ([groupName, groupDocs]) => (
                  <div key={groupName} className="document-group">
                    {groupByType && (
                      <div className="group-header">
                        <h3 className="group-title">
                          <i className="ri-folder-line"></i>
                          {groupName}
                          <span className="group-count">
                            ({groupDocs.length})
                          </span>
                        </h3>
                      </div>
                    )}

                    <div
                      className={`documents-grid ${
                        activeView === "list" ? "list-view" : ""
                      }`}
                    >
                      {groupDocs.map((document) => (
                        <div key={document.id} className="document-item">
                          <div className="document-selector">
                            <input
                              type="checkbox"
                              checked={selectedDocuments.has(document.id)}
                              onChange={() =>
                                handleDocumentSelection(document.id)
                              }
                              className="document-checkbox"
                            />
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
