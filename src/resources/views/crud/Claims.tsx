import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { CardPageComponentPropos } from "bootstrap";
import React from "react";
import AnimatedButton from "../components/forms/AnimatedButton";

const Claims: React.FC<
  CardPageComponentPropos<ClaimResponseData, ClaimRepository>
> = ({ Repository, collection, onManageRawData, View }) => {
  // console.log(View);

  return (
    <>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="custom-card claims-card">
            <div className="claims-card-header mb-4">
              <div className="flex align gap-lg">
                <p className="code">SC14686</p>
                <p className="status-badge">pending</p>
              </div>
              <h2>
                Engagement of Stakeholders and ICT Support at Abuja Liaison
                Office.
              </h2>
              <small className="date_created">
                Registered on: 8th Dec, 2024
              </small>
            </div>
            <div className="claims-card-body">
              <div className="row">
                <div className="col-md-12 mb-3">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <small className="title">Amount Due:</small>
                    <p className="amount">
                      <small>NGN</small> 1,450,900.54
                    </p>
                  </div>
                </div>
                <div className="col-md-12 mt-3 mb-4">
                  <p className="duration">
                    Duration:{" "}
                    <span>
                      8<sup>th</sup>
                    </span>{" "}
                    Aug, 2024 - 19<sup>th</sup> Aug, 2024
                  </p>
                </div>
              </div>
            </div>
            {/* animate__bounceInLeft */}
            <div className="claims-card-footer mt-3">
              <div className="heartbeat-container">
                <div className="heartbeat"></div>
                <div className="manage-button">
                  <AnimatedButton
                    label="Manage"
                    handleClick={() => {}}
                    size="xs"
                    animation="fadeInLeft"
                    flag="faster"
                    speedup
                    variant="danger"
                    icon="ri-settings-line"
                  />
                  <AnimatedButton
                    label="Track"
                    handleClick={() => {}}
                    size="xs"
                    flag="fast"
                    animation="fadeInLeft"
                    speedup
                    icon="ri-pushpin-line"
                  />
                  <AnimatedButton
                    label="Print"
                    handleClick={() => {}}
                    animation="fadeInLeft"
                    size="xs"
                    variant="success"
                    icon="ri-printer-line"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Claims;
