import { LedgerResponseData } from "app/Repositories/Ledger/data";
import LedgerRepository from "app/Repositories/Ledger/LedgerRepository";
import { CardPageComponentProps } from "bootstrap";
import React from "react";

const Ledgers: React.FC<
  CardPageComponentProps<LedgerResponseData, LedgerRepository>
> = ({ Repository, collection, onManageRawData, View }) => {
  console.log(collection);

  return (
    <>
      <div className="col-md-12 mb-3">
        <div className="row">
          {collection.length > 0 ? (
            collection.map((ledger, i) => (
              <div className="col-md-4 mb-3" key={i}>
                <div className="custom-card file__card ledger__card">
                  <h2>Ledger {ledger.code}</h2>
                  <small>- {ledger.name}</small>
                </div>
              </div>
            ))
          ) : (
            <div className="col-md-12 mb-3">
              <p>No Ledger at this moment</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Ledgers;
