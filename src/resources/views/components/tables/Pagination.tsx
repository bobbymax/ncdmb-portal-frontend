import React from "react";

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
  const totalPages = Math.ceil(totalRecords / pageSize);

  const getPaginationGroup = () => {
    const start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
    return new Array(pageLimit)
      .fill(undefined)
      .map((_, idx) => start + idx + 1)
      .filter((page) => page <= totalPages);
  };

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>,
    type: "previous" | "next"
  ) => {
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

  return (
    <div className="pagination flex align end gap-md">
      <div
        className={`pagination-item ${currentPage === 1 ? "is-disabled" : ""}`}
        onClick={(e) => handleClick(e, "previous")}
      >
        <i className="ri-arrow-left-s-line" />
      </div>
      {/* Page numbers */}
      {getPaginationGroup().map((page, i) => (
        <div
          key={page}
          className={`pagination-item ${page === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </div>
      ))}
      {/* Ellipsis for more pages */}
      {currentPage < totalPages && totalPages > pageLimit && (
        <div className="pagination-item">...</div>
      )}
      <div
        className={`pagination-item ${
          currentPage === totalPages ? "is-disabled" : ""
        }`}
        onClick={(e) => handleClick(e, "next")}
      >
        <i className="ri-arrow-right-s-line" />
      </div>
    </div>
  );
};

export default Pagination;
