import { TransactionResponseData } from "app/Repositories/Transaction/data";
import { ModalLoopProps, useModal } from "app/Context/ModalContext";
import TransactionRepository from "app/Repositories/Transaction/TransactionRepository";
import React, { useEffect, useMemo } from "react";
import { formatAmountNoCurrency } from "app/Support/Helpers";
import { ChartOfAccountResponseData } from "app/Repositories/ChartOfAccount/data";
import { EntityResponseData } from "app/Repositories/Entity/data";
import { LedgerResponseData } from "app/Repositories/Ledger/data";
import { UserResponseData } from "app/Repositories/User/data";

type TransactionDependencyProps = {
  chartOfAccounts: ChartOfAccountResponseData[];
  entities: EntityResponseData[];
  ledgers: LedgerResponseData[];
  users: UserResponseData[];
};

const TransactionModal: React.FC<
  ModalLoopProps<TransactionRepository, TransactionResponseData>
> = ({
  modalState,
  data,
  isUpdating,
  handleSubmit,
  repo,
  dependencies,
  extras,
}) => {
  const {
    chartOfAccounts = [],
    entities = [],
    ledgers = [],
    users = [],
  } = dependencies as TransactionDependencyProps;

  const ledger = useMemo(
    () => ledgers.find((led) => led.code === "H"),
    [ledgers]
  );

  const {
    getModalState,
    updateModalState,
    handleInputChange,
    currentIdentifier,
  } = useModal();

  const state: TransactionResponseData = getModalState(currentIdentifier);

  useEffect(() => {
    if (data) {
      updateModalState(currentIdentifier, data);
    }
  }, [data]);

  return (
    <div className="row">
      <div className="col-md-12 mb-3">
        <h3>
          <span
            style={{
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: 2,
              borderBottom: "1px solid lightgray",
              display: "inline-block",
              color: "darkred",
            }}
          >
            Taxable Amount:
          </span>{" "}
          {formatAmountNoCurrency(extras?.taxableAmount)}
        </h3>
      </div>
    </div>
  );
};

export default TransactionModal;
