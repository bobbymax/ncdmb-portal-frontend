import { useAuth } from "app/Context/AuthContext";
import useLobby from "app/Hooks/useLobby";
import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";
import { PaymentBatchResponseData } from "app/Repositories/PaymentBatch/data";
import { formatCurrency } from "app/Support/Helpers";
import { FormPageComponentProps } from "bootstrap";
import { repo } from "bootstrap/repositories";
import React, { useEffect, useMemo, useState } from "react";
import { LobbyList } from "../components/capsules/LobbyList";
import safe from "../../assets/images/safe.png";
import Button from "../components/forms/Button";
import usePageComponents from "app/Hooks/usePageComponents";

const PaymentBatch: React.FC<
  FormPageComponentProps<PaymentBatchResponseData>
> = ({ state, setState, handleChange }) => {
  const { staff } = useAuth();
  const page = usePageComponents();
  const draftRepo = useMemo(() => repo("document_draft"), []);
  const [expenditures, setExpenditures] = useState<ExpenditureResponseData[]>(
    []
  );
  const [isLoadingExpenditures, setIsLoadingExpenditures] = useState(true);

  const {
    stacks,
    queue,
    queueType,
    fund,
    totalQueuedAmount,
    category,
    addToQueue,
    removeFromQueue,
    resetLobbyQueue,
  } = useLobby(expenditures, setState);

  useEffect(() => {
    const fetchDraftsInBatchQueue = async () => {
      try {
        setIsLoadingExpenditures(true);
        const response = await draftRepo.collection(
          "document/documentDrafts/in-batch-queue"
        );
        if (response) {
          setExpenditures(response.data as ExpenditureResponseData[]);
        }
      } catch (error) {
        // Error processing payment batch
      } finally {
        setIsLoadingExpenditures(false);
      }
    };

    fetchDraftsInBatchQueue();
  }, []);

  useEffect(() => {
    if (setState && staff && fund && category) {
      setState((prevState) => ({
        ...prevState,
        user_id: staff.id,
        department_id: staff.department_id,
        fund_id: fund?.id,
        budget_year: 2024,
        type: queueType as "staff" | "third-party",
        workflow_id: category.workflow_id,
        document_category_id: category.id,
        document_type_id: category.document_type_id,
        status: "batched",
      }));
    }
  }, [staff, fund, category]);

  // Skeleton loading component for lobby
  const LobbySkeleton = () => (
    <div className="lobby__container">
      <div className="top__area flex align between mb-3">
        <div
          className="skeleton-line skeleton-title"
          style={{ height: "24px", width: "80px" }}
        ></div>
        <div
          className="skeleton-line skeleton-button"
          style={{ height: "32px", width: "120px", borderRadius: "6px" }}
        ></div>
      </div>
      <div className="queue">
        <div className="row">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="col-md-4 mb-3">
              <div
                className="custom-card file__card skeleton-card"
                style={{ minHeight: "200px" }}
              >
                <div
                  className="skeleton-line"
                  style={{ height: "16px", width: "80%", marginBottom: "12px" }}
                ></div>
                <div
                  className="skeleton-line"
                  style={{ height: "14px", width: "60%", marginBottom: "8px" }}
                ></div>
                <div
                  className="skeleton-line"
                  style={{ height: "14px", width: "40%", marginBottom: "16px" }}
                ></div>
                <div
                  className="skeleton-line skeleton-button"
                  style={{
                    height: "28px",
                    width: "100px",
                    borderRadius: "4px",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="col-md-8 mb-3">
        {isLoadingExpenditures ? (
          <LobbySkeleton />
        ) : (
          <div className="lobby__container">
            <div className="top__area flex align between mb-3">
              <h3 className="mb-4">Lobby</h3>
              <Button
                label="Reset Lobby"
                variant="danger"
                icon="ri-refresh-line"
                handleClick={resetLobbyQueue}
                size="xs"
              />
            </div>
            <div className="queue">
              <div className="row">
                <LobbyList stacks={stacks} onAddToQueue={addToQueue} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="col-md-4 mb-3">
        <div className="queue__board__title">
          <h3 className="mb-4">Batch</h3>
        </div>
        <div className="queue">
          <div className="batch__details mb-3">
            <p>
              Batch Number:{" "}
              <span style={{ backgroundColor: "darkgrey" }}>
                System Generated
              </span>
            </p>
            <p>
              Payment Type:{" "}
              <span style={{ backgroundColor: "navy" }}>
                {queueType ?? "Not Set"}
              </span>
            </p>
            <p>
              Budget Head:{" "}
              <span style={{ backgroundColor: "darkgreen" }}>
                {fund ? fund.sub_budget_head : "Not Set"}
              </span>
            </p>
            <p>
              Budget Code:{" "}
              <span style={{ backgroundColor: "orange" }}>
                {fund ? fund.budget_code : "Not Set"}
              </span>
            </p>
            <p>
              No. of Payments:{" "}
              <span
                style={{
                  backgroundColor: "salmon",
                }}
              >
                {queue.length}
              </span>
            </p>
            <div className="amount__details mb-3">
              <small>Total Batched Amount:</small>
              <h2>{formatCurrency(totalQueuedAmount)}</h2>
            </div>
          </div>
          {queue.length > 0 ? (
            queue.map((expenditure) => (
              <div
                key={expenditure.id}
                className="queue_board custom-card file__card mb-3"
              >
                <span className="exp-title">{expenditure.purpose}</span>
                <p>{formatCurrency(Number(expenditure.amount))}</p>
                <div className="action__bttn flex align end">
                  <Button
                    label="Remove"
                    variant="danger"
                    icon="ri-delete-bin-5-line"
                    handleClick={() => removeFromQueue(expenditure.id)}
                    size="xs"
                  />
                </div>
              </div>
            ))
          ) : (
            <img
              src={safe}
              alt="Safe"
              style={{ width: "100%", height: "auto", opacity: 0.6 }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentBatch;
