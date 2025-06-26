import React, { useEffect, useMemo, useState } from "react";
import { DraftPageProps } from "../../tabs/FilePagesTab";
import { PaymentResponseData } from "app/Repositories/Payment/data";
import PaymentRepository from "app/Repositories/Payment/PaymentRepository";
import { TransactionResponseData } from "app/Repositories/Transaction/data";
import { useModal } from "app/Context/ModalContext";
import TransactionModal from "../../modals/TransactionModal";
import { repo } from "bootstrap/repositories";
import useTransactions from "app/Hooks/useTransactions";
import { useAuth } from "app/Context/AuthContext";
import {
  ProcessedDataProps,
  useFileProcessor,
} from "app/Context/FileProcessorProvider";
import PaymentVoucherHeader from "resources/views/components/partials/PaymentVoucherHeader";
import {
  covertToWords,
  extractFourDigitsAfterFirstChar,
  fetchResourceObjectOrValue,
  formatAmountNoCurrency,
  formatCurrency,
  generateUniqueString,
  syncPartialIntoLocal,
} from "app/Support/Helpers";
import moment from "moment";
import useServerSideProcessedData, {
  ServerOptions,
} from "app/Hooks/useServerSideProcessedData";
import Button from "resources/views/components/forms/Button";
import useRepo from "app/Hooks/useRepo";
import { SignatureRequestResponseData } from "app/Repositories/SignatureRequest/data";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import useSignatures, { ApprovalCardProps } from "app/Hooks/useSignatures";
import { SignatureResponseData } from "app/Repositories/Signature/data";
import SignatureSlot from "resources/views/components/partials/SignatureSlot";
import ApprovalCard from "resources/views/components/partials/ApprovalCard";

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
  signatories,
  tracker,
  document,
}) => {
  const { openLoop, closeModal } = useModal();
  const { staff } = useAuth();
  const { taxableAmount, dependencies, adjustableLedger } =
    useTransactions(payment_voucher);

  const transactionRepo = useMemo(() => repo("transaction"), []);

  const {
    stageSignatory: signatory,
    canSign,
    arrangeApprovals,
  } = useSignatures(
    signatories ?? [],
    tracker as ProgressTrackerResponseData,
    currentDraft
  );

  const options: ServerOptions = useMemo(
    () => ({
      type: payment_voucher.type,
      method: "settleTransactions",
      mode:
        (payment_voucher.transactions ?? []).length > 0 ? "update" : "store",
      service: "transaction",
      period: moment(payment_voucher.period).format("MM/YYYY"),
      file: "",
      budget_year: payment_voucher.expenditure?.budget_year ?? 0,
      workflow_id: tracker?.workflow_id ?? 0,
      state: {
        payment_id: payment_voucher.id,
        ledger_id: adjustableLedger ? adjustableLedger.id : 4,
      },
      status:
        (payment_voucher.transactions ?? []).length > 0
          ? "auditing-transactions"
          : "transactions-generated",
    }),
    [adjustableLedger, payment_voucher, tracker]
  );

  const { responseState, dataCollections } = useServerSideProcessedData(
    payment_voucher,
    currentDraft,
    options,
    tracker
  );

  const appendSignatureAction = useMemo(() => {
    return (
      actions?.find(
        (action) =>
          action.category === "signature" && action.action_status === "passed"
      ) ?? null
    );
  }, [actions]);

  const {
    paymentTransactions,
    convertToProcessingDataProps,
    replaceProcessedData,
  } = useFileProcessor();

  const approvals: ApprovalCardProps[] = arrangeApprovals(
    [
      "Prepared By:",
      "Checked By Treasury:",
      "Approved By:",
      "Authorised For Payment:",
    ],
    signatories
  );

  // console.log(approvals);

  const [transactions, setTransactions] = useState<TransactionResponseData[]>(
    []
  );
  const [enableSigning, setEnableSigning] = useState<boolean>(false);
  const [totalAmountPayable, setTotalAmountPayable] = useState<number>(0);

  const handleModalSubmits = (
    response: ProcessedDataProps<TransactionResponseData>
  ) => {
    setTransactions((prev) =>
      prev.map((pay) => (pay.id === response.raw.id ? response.raw : pay))
    );
    closeModal();
  };

  const toggleModal = (raw: TransactionResponseData | null = null) => {
    openLoop(TransactionModal, "transaction", {
      title: `${raw ? "Adjust" : "Add"} Transaction`,
      modalState: transactionRepo.getState(),
      data: raw,
      repo: transactionRepo,
      isUpdating: !!raw,
      handleSubmit: handleModalSubmits,
      dependencies,
      extras: {
        taxableAmount,
        voucher: payment_voucher,
        loggedInUser: staff,
      },
    });
  };

  useEffect(() => {
    const hasTransactions = (payment_voucher.transactions ?? []).length > 0;
    const audited =
      Number(payment_voucher.total_amount_paid) > 0 &&
      Number(payment_voucher.total_amount_paid) !==
        Number(payment_voucher.total_approved_amount);

    const fallback = hasTransactions && !audited;

    // console.log(fallback);

    setTransactions((prevLocal) =>
      syncPartialIntoLocal(
        fallback ? payment_voucher.transactions ?? [] : paymentTransactions,
        prevLocal,
        "reference"
      )
    );
  }, [paymentTransactions, payment_voucher.transactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      const total = transactions
        .filter((pay) => pay.type === "credit" && pay.flag === "payable")
        .reduce((sum, pay) => sum + Number(pay.amount), 0);

      setTotalAmountPayable(total);

      const dataProcessed = convertToProcessingDataProps(
        transactions,
        "cleared",
        "add"
      );

      replaceProcessedData(dataProcessed);
    }
  }, [transactions]);

  useEffect(() => {
    setEnableSigning(document.status === "processing");
  }, [document]);

  // console.log(transactions);

  const hasValidTransactions =
    transactions.length > 0 && totalAmountPayable > 0;

  return (
    <div className="canvas__container">
      <div className="row">
        <div className="col-md-12">
          {/* Voucher Header */}
          <PaymentVoucherHeader code={payment_voucher.code ?? ""} />
          {/* End Voucher Header */}

          {/* Payment Details Here */}
          <div className="mandate__details flex align between mb-4">
            <div className="beneficiary__details flex column gap-md">
              <div className="line beneficiary_name mb-2">
                <small>Please Pay</small>
                <h5>
                  {
                    payment_voucher.expenditure?.expenditureable?.beneficiary
                      .name
                  }
                </h5>
              </div>
              <div className="line exp__description mb-2">
                <small>In Respect of</small>
                <h5>{payment_voucher.expenditure?.purpose}</h5>
              </div>
              <div className="line exp__description">
                <small>Department</small>
                <h5>
                  {extractFourDigitsAfterFirstChar(
                    payment_voucher.expenditure?.fund?.budget_code ?? ""
                  )}
                </h5>
              </div>
            </div>
            <div className="expenditure__details flex column gap-sm">
              <div className="exp__details__payment flex align start gap-md">
                <p>Batch ID:</p>
                <p>{payment_voucher.batch?.code}</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Account Code:</p>
                <p>{payment_voucher.batch?.account_code}</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Transaction Ref:</p>
                <p>{payment_voucher.batch?.code}</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Budget Head:</p>
                <p>{payment_voucher.batch?.budget_code}</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Period:</p>
                <p>{moment(payment_voucher.period).format("MM/YYYY")}</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Date:</p>
                <p>{moment(payment_voucher.created_at).format("DD/MM/YYYY")}</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Currency:</p>
                <p>{payment_voucher.currency ?? "NGN"}</p>
              </div>
              <div className="exp__details__payment flex align start gap-md">
                <p>Budget Year:</p>
                <p>{payment_voucher.fiscal_year}</p>
              </div>
            </div>
          </div>
          {/* End Payment Details Here */}

          {/* Transaction Table */}
          <table
            className="table table-bordered table-striped mt-4"
            style={{
              backgroundColor: "transparent",
            }}
          >
            <thead>
              <tr
                style={{
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                <th
                  style={{
                    width: "18%",
                    textAlign: "start",
                  }}
                >
                  Book
                </th>
                <th>Account Code</th>
                <th
                  style={{
                    width: "20%",
                    textAlign: "end",
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    width: "15%",
                    textAlign: "end",
                  }}
                >
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((py, i) => (
                <tr key={i}>
                  <td
                    style={{
                      width: "18%",
                      textAlign: "start",
                    }}
                  >
                    {py.narration}
                  </td>
                  <td
                    style={{
                      padding: 15,
                    }}
                  >
                    <div className="description__container">
                      <div className="transaction__header">
                        <small>Account Code</small>
                        <p className="mb-4">
                          {py.chart_of_account_id < 1
                            ? "Not Set"
                            : fetchResourceObjectOrValue(
                                dependencies.chartOfAccounts,
                                py.chart_of_account_id
                              )?.name}
                        </p>
                        {(payment_voucher.transactions ?? []).length < 1 && (
                          <Button
                            size="xs"
                            variant="dark"
                            handleClick={() => toggleModal(py)}
                            label="Manage"
                            icon="ri-link"
                          />
                        )}
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      width: "20%",
                      textAlign: "end",
                    }}
                  >
                    {formatAmountNoCurrency(Number(py.amount))}
                  </td>
                  <td
                    style={{
                      width: "10%",
                      textAlign: "end",
                      fontWeight: "bold",
                    }}
                  >
                    {py.type === "debit" ? "D" : "C"}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={2}
                  style={{
                    textAlign: "end",
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    fontWeight: 700,
                    color: "darkgreen",
                  }}
                >
                  Amount Payable:
                </td>
                <td
                  style={{
                    textAlign: "end",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: "darkgreen",
                  }}
                >
                  {formatAmountNoCurrency(totalAmountPayable)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
          {/* End Transaction Table */}

          <div className="amount__in__words mt-4 mb-5">
            <div className="row">
              <div className="col-md-3 mb-3">
                <h3>Amount In Words:</h3>
              </div>
              <div className="col-md-9 mb-3">
                <h3>{covertToWords(totalAmountPayable)}</h3>
              </div>
            </div>
          </div>

          <ApprovalCard
            canSign={canSign}
            approvals={approvals}
            action={appendSignatureAction}
            signatures={signatures ?? []}
            tracker={tracker}
            resolveAction={resolveAction}
            isDisabled={enableSigning}
            signIf={hasValidTransactions}
            showName
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentVoucherTemplate;
