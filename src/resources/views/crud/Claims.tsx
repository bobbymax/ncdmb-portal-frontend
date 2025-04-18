import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { CardPageComponentProps } from "bootstrap";
import React from "react";
import ClaimCard from "../components/partials/ClaimCard";

const Claims: React.FC<
  CardPageComponentProps<ClaimResponseData, ClaimRepository>
> = ({ Repository, collection, onManageRawData, View }) => {
  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <div className="row">
            {collection.length > 0 ? (
              collection.map((claim, i) => (
                <div className="col-md-3 mb-3" key={i}>
                  <ClaimCard
                    claim={claim}
                    onManage={onManageRawData}
                    actions={Repository.actions}
                    grid={3}
                    mb={3}
                  />
                </div>
              ))
            ) : (
              <div className="col-md-12 mb-3">
                <p>No Claims at this moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Claims;
