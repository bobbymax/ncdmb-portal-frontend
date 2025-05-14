import React, { useMemo, useState } from "react";
import { DraftPageProps } from "../../tabs/FilePagesTab";
import { PaymentResponseData } from "app/Repositories/Payment/data";
import PaymentRepository from "app/Repositories/Payment/PaymentRepository";
import logo from "../../../../assets/images/logo.png";
import Button from "resources/views/components/forms/Button";
import { TransactionResponseData } from "app/Repositories/Transaction/data";
import { useModal } from "app/Context/ModalContext";
import TransactionModal from "../../modals/TransactionModal";
import { repo } from "bootstrap/repositories";
import useTransactions from "app/Hooks/useTransactions";
import { useAuth } from "app/Context/AuthContext";
import { ProcessedDataProps } from "app/Context/FileProcessorProvider";

const PaymentVoucherTemplate: React.FC<
  DraftPageProps<PaymentResponseData, PaymentRepository>
> = ({
  resource: payment_voucher,
  currentDraft,
  group,
  actions,
  resolveAction,
  activeSignatory,
  signatures,
}) => {
  //   console.log(payment_voucher);

  const { openLoop, setSize, closeModal } = useModal();
  const { staff } = useAuth();
  const { taxableAmount, dependencies } = useTransactions(payment_voucher);
  const transactionRepo = useMemo(() => repo("transaction"), []);

  //   console.log(taxableAmount);

  const [transactions, setTransactions] = useState<TransactionResponseData[]>(
    []
  );

  const handleModalSubmits = (
    response: ProcessedDataProps<TransactionResponseData>
  ) => {
    //
  };

  const toggleModal = (raw: TransactionResponseData | null = null) => {
    openLoop(TransactionModal, "transaction", {
      title: `${raw ? "Adjust" : "Add"} Transaction`,
      modalState: transactionRepo.getState(),
      data: raw,
      repo: transactionRepo,
      isUpdating: raw !== null,
      handleSubmit: handleModalSubmits,
      dependencies,
      extras: {
        taxableAmount,
        voucher: payment_voucher,
        loggedInUser: staff,
      },
    });
  };

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          {/* Voucher Header */}
          <div className="voucher__header flex align between mb-4">
            <div className="brand__logo__area flex align gap-md">
              <div className="logo_img">
                <img src={logo} alt="Logo NCDMB" />
              </div>
              <div className="title__area flex column gap-sm">
                <h3>Nigerian Content Development Fund (NCDF)</h3>
                <small>Payment Voucher</small>
              </div>
            </div>
            <div className="code__details__area flex column end align-end">
              <small>{payment_voucher.code}</small>
              <span>Database Code: NDF</span>
            </div>
          </div>
          {/* End Voucher Header */}

          {/* Payment Details Here */}
          <div className="mandate__details flex align between mb-4">
            <div className="beneficiary__details flex column gap-md">
              <div className="line beneficiary_name mb-2">
                <small>Please Pay</small>
                <h5>Beneficiary Name</h5>
              </div>
              <div className="line exp__description mb-2">
                <small>In Respect of</small>
                <h5>Expenditure Payment</h5>
              </div>
              <div className="line exp__description">
                <small>Department</small>
                <h5>1003</h5>
              </div>
            </div>
            <div className="expenditure__details flex column gap-sm">
              <div className="exp__details__payment flex align start gap-md">
                <p>Batch ID:</p>
                <p>TPP32221</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Account Code:</p>
                <p>900033212</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Transaction Ref:</p>
                <p>TPP32221</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Budget Head:</p>
                <p>R345677</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Period:</p>
                <p>10/2024</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Date:</p>
                <p>11/10/2024</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Currency:</p>
                <p>NGN</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Budget Year:</p>
                <p>2024</p>
              </div>
            </div>
          </div>
          {/* End Payment Details Here */}

          {/* Transaction Table */}
          <Button
            label="Add Transaction"
            handleClick={() => toggleModal()}
            size="xs"
            variant="dark"
            icon="ri-wallet-3-line"
          />
          <table className="table table-bordered table-striped mt-4">
            <thead>
              <tr>
                <th>Journal</th>
                <th>Description</th>
                <th>Transaction Amount</th>
                <th>Debit/Credit</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          {/* End Transaction Table */}
        </div>
      </div>
    </>
  );
};

export default PaymentVoucherTemplate;
