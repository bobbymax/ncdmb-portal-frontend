import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import { CardPageComponentProps } from "bootstrap";
import React, { useState } from "react";
import TextInput from "../components/forms/TextInput";
import FolderComponent from "../components/pages/FolderComponent";
import useFilters from "app/Hooks/useFilters";
import LoginTextInputWithIcon from "../components/forms/LoginTextInputWithIcon";
import TextInputWithIcon from "../components/forms/TextInputWithIcon";
import Select from "../components/forms/Select";
import RangeSlider from "../components/forms/RangeSlider";
import { formatAmountNoCurrency, formatCurrency } from "app/Support/Helpers";
import moment from "moment";
import MultiSelect from "../components/forms/MultiSelect";
import Button from "../components/forms/Button";
import { useStateContext } from "app/Context/ContentContext";

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

  const handleOpenFolder = (document: DocumentResponseData) => {
    setIsLoading(true);
    onManageRawData(document, "manage");
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // delay in milliseconds (e.g., 1500ms = 1.5s)
  };

  console.log(componentLoading);

  return (
    <div className="row">
      <div className="col-md-9 mb-3">
        <div className="row">
          {documents.map((document) => (
            <div key={document.id} className="col-md-3 col-sm-12 mb-3">
              <FolderComponent
                loader={componentLoading}
                document={document}
                openFolder={handleOpenFolder}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Filters Section */}
      <div className="col-md-3 mb-3">
        <div className="filter__box__container custom-card custom-glass-card file__card">
          <div className="row">
            <div className="col-md-12 mb-3">
              <Button
                label="Reset Filters"
                variant="danger"
                handleClick={() => resetFilters()}
                size="xs"
                icon="ri-filter-off-line"
              />
            </div>
            <div className="col-md-12 mt-3 mb-2">
              <TextInput
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search all documents"
                size="sm"
                width={100}
              />
            </div>
            <div className="col-md-12 mb-2">
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
                defaultText="Select Document Type"
              />
            </div>
            <div className="col-md-12 mb-3">
              <div className="mb-2">
                <RangeSlider
                  label="Filter by Amount"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(Number(e.target.value))}
                  min={Number(amountFilter[0])}
                  max={Number(amountFilter[1])}
                  name="amount"
                />
              </div>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "darkgreen",
                }}
              >{`${formatCurrency(currentAmount)}`}</p>
            </div>
            <div className="col-md-12 mt-2 mb-3">
              <div className="mb-3">
                <RangeSlider
                  label="Filter by Dates"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(Number(e.target.value))}
                  min={Number(dateFilter[0]?.getTime())}
                  max={Number(dateFilter[1]?.getTime())}
                  name="date"
                />
              </div>
              <small
                style={{
                  display: "block",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                Before:
              </small>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "darkgreen",
                }}
              >{`${moment(currentDate).format("LL")}`}</p>
            </div>
            <div className="col-md-12 mt-2">
              <MultiSelect
                label="Search By Initiator"
                options={owners}
                value={documentOwner}
                onChange={handleDocumentOwnersChange}
                placeholder="Initiator"
                isSearchable
                isDisabled={isLoading}
              />
            </div>
            <div className="col-md-12 mt-2">
              <MultiSelect
                label="Search By Departments"
                options={departments}
                value={department}
                onChange={handleDeptsChange}
                placeholder="Department"
                isSearchable
                isDisabled={isLoading}
              />
            </div>
            <div className="col-md-12 mt-2">
              <MultiSelect
                label="Filter By Actions"
                options={actions}
                value={action}
                onChange={handleActionsChange}
                placeholder="Action"
                isSearchable
                isDisabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
      {/* End Filters Section */}
    </div>
  );
};

export default Folders;
