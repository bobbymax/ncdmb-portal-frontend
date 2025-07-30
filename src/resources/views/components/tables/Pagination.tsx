import React, { useMemo } from "react";

interface PaginationData {
  totalRecords: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (value: number) => void;
}

const Pagination = ({
  totalRecords,
  pageSize,
  currentPage,
  onPageChange,
}: PaginationData) => {
  const pageLimit = 5;

  // Memoized total pages calculation
  const totalPages = useMemo(() => {
    return Math.ceil(totalRecords / pageSize);
  }, [totalRecords, pageSize]);

  // Memoized pagination group calculation
  const paginationGroup = useMemo(() => {
    const start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
    return new Array(pageLimit)
      .fill(undefined)
      .map((_, idx) => start + idx + 1)
      .filter((page) => page <= totalPages);
  }, [currentPage, pageLimit, totalPages]);

  // Don't render pagination if no data or only one page
  if (totalRecords === 0 || totalPages <= 1) {
    return null;
  }

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>,
    type: "previous" | "next"
  ) => {
    e.preventDefault();
    if (e.currentTarget.classList.contains("is-disabled")) {
      return;
    }

    switch (type) {
      case "previous":
        handlePageChange(currentPage - 1);
        break;

      default:
        handlePageChange(currentPage + 1);
        break;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    onPageChange(newPage);
  };

  // Enhanced accessibility
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    type: "previous" | "next"
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e as any, type);
    }
  };

  return (
    <div
      className="pagination flex align end gap-md"
      role="navigation"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <div
        className={`pagination-item ${currentPage === 1 ? "is-disabled" : ""}`}
        onClick={(e) => handleClick(e, "previous")}
        onKeyDown={(e) => handleKeyDown(e, "previous")}
        tabIndex={currentPage === 1 ? -1 : 0}
        role="button"
        aria-label="Go to previous page"
        aria-disabled={currentPage === 1}
      >
        <i className="ri-arrow-left-s-line" />
      </div>

      {/* Page numbers */}
      {paginationGroup.map((page) => (
        <div
          key={page}
          className={`pagination-item ${page === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(page)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handlePageChange(page);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </div>
      ))}

      {/* Ellipsis for more pages */}
      {currentPage < totalPages && totalPages > pageLimit && (
        <div className="pagination-item" aria-hidden="true">
          ...
        </div>
      )}

      {/* Next Button */}
      <div
        className={`pagination-item ${
          currentPage === totalPages ? "is-disabled" : ""
        }`}
        onClick={(e) => handleClick(e, "next")}
        onKeyDown={(e) => handleKeyDown(e, "next")}
        tabIndex={currentPage === totalPages ? -1 : 0}
        role="button"
        aria-label="Go to next page"
        aria-disabled={currentPage === totalPages}
      >
        <i className="ri-arrow-right-s-line" />
      </div>

      {/* Page info */}
      <div className="pagination-info text-sm text-gray-600 ml-4">
        Page {currentPage} of {totalPages} ({totalRecords} records)
      </div>
    </div>
  );
};

export default Pagination;
