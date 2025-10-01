import moment from "moment";
import logo from "../assets/images/logo.png";
import coa from "../assets/images/coa.png";
import { BlockResponseData } from "app/Repositories/Block/data";
import _ from "lodash";
import defaultIcon from "../assets/images/apps/template.png";
import { ProcessType } from "app/Hooks/useTemplateHeader";
import { ProcessFlowConfigProps } from "../views/crud/DocumentWorkflow";
import { CategoryProgressTrackerProps } from "@/app/Repositories/DocumentCategory/data";
import { DeskComponentPropTypes } from "../views/pages/DocumentTemplateContent";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { useEffect, useMemo, useState } from "react";
import { useStateContext } from "app/Context/ContentContext";
import { FundResponseData } from "@/app/Repositories/Fund/data";
import { PaymentBatchContentProps } from "../views/components/ContentCards/PaymentBatchContentCard";
import { getContentBlockByType } from "app/Utils/ContentBlockUtils";

export const WhiteFormHeader = ({
  code,
  tagline,
  title,
}: {
  code?: string | null;
  tagline?: string | null;
  title?: string | null;
}) => {
  const { state } = usePaperBoard();
  const { config } = useStateContext();

  const [fund, setFund] = useState<FundResponseData | null>(null);
  const [noOfPayments, setNoOfPayments] = useState(0);

  const getPaymentBatchContent = (): PaymentBatchContentProps | null => {
    const contentBlock = getContentBlockByType(state.body, "payment_batch");
    return (
      (contentBlock?.content?.payment_batch as PaymentBatchContentProps) || null
    );
  };

  const department = useMemo(() => {
    const from = state.configState?.from;
    if (!from) return null;
    return state.resources.departments.find(
      (department) => department.id === from.department_id
    );
  }, [state.configState]);

  const directorate = useMemo(() => {
    if (!department) return null;

    return (
      state.resources.departments.find(
        (dept) => dept.id === department.parentId
      ) ?? department
    );
  }, [department]);

  useEffect(() => {
    const paymentBatchContent = getPaymentBatchContent();
    if (paymentBatchContent) {
      setNoOfPayments(paymentBatchContent.no_of_payments);
    }
  }, [state.body]);

  useEffect(() => {
    if (state.fund && state.resources.funds.length > 0) {
      const fund = state.resources.funds.find(
        (fund) => fund.id === state.fund?.value
      );
      if (fund) {
        setFund(fund);
      }
    }
  }, [state.fund, state.resources.funds]);

  return (
    <div className="printable__page__header mb-4">
      <div className="flex column align">
        <div className="top__banner flex align gap-lg between">
          <img src={logo} alt="page header logo" />
          <h2
            style={{
              fontSize: 24,
              lineHeight: 1.1,
              fontWeight: 700,
              textAlign: "center",
              color: "#137547",
            }}
          >
            Nigerian Content Development Fund (NCDF)
          </h2>
          <img
            src={coa}
            style={{ width: 97, height: 82 }}
            alt="page header logo"
          />
        </div>
      </div>

      <div className="mid__banner flex align between mt-4">
        <p>
          NCDF {state.category?.type ?? "Type not set"} Payment Approval Form
        </p>
        <p>
          Batch No:{" "}
          {state.existingDocument?.ref ??
            `${state.category?.type === "staff" ? "SP" : "TPP"}{#####}`}
        </p>
      </div>

      <div className="payment__details__section mt-5">
        <div className="payment_detail__item flex align between">
          <span>Originating Department:</span>
          <span className="payment_detail__value">
            {department?.name ?? "Department not set"}
          </span>
        </div>
        <div className="payment_detail__item flex align between">
          <span>Directorate:</span>
          <span className="payment_detail__value">
            {directorate?.name ?? "Directorate not set"}
          </span>
        </div>

        {state.category?.type !== "staff" && (
          <>
            <div className="payment_detail__item flex align between">
              <span>Purpose:</span>
              <span className="payment_detail__value">
                {state.existingDocument?.ref ?? "System Generated"}
              </span>
            </div>
            <div className="payment_detail__item flex align between">
              <span>Payment Type:</span>
              <span className="payment_detail__value">
                {state.category?.type ?? "Type not set"} Payment
              </span>
            </div>
            <div className="payment_detail__item flex align between">
              <span>Budget Head:</span>
              <span className="payment_detail__value">
                {state.category?.type ?? "Type not set"} Payment
              </span>
            </div>
            <div className="payment_detail__item flex align between">
              <span>Budget Code:</span>
              <span className="payment_detail__value">
                {state.category?.type ?? "Type not set"} Payment
              </span>
            </div>
          </>
        )}

        <div className="payment_detail__item flex align between">
          <span>Budget Period:</span>
          <span className="payment_detail__value">
            {state.existingDocument?.budget_year ?? config("jolt_budget_year")}
          </span>
        </div>

        {state.category?.type !== "staff" && (
          <>
            <div className="payment_detail__item flex align between">
              <span>Amount:</span>
              <span className="payment_detail__value">
                {state.category?.type ?? "Type not set"} Payment
              </span>
            </div>
            <div className="payment_detail__item flex align between">
              <span>Beneficiary:</span>
              <span className="payment_detail__value">
                {state.category?.type ?? "Type not set"} Payment
              </span>
            </div>
          </>
        )}

        <div className="payment_detail__item flex align between">
          <span>No. of Payments:</span>
          <span className="payment_detail__value">{noOfPayments}</span>
        </div>
      </div>
    </div>
  );
};

export const ResourceHeader = ({
  code,
  configState,
  tagline,
  title,
  date,
  ref,
  icon,
}: {
  code?: string | null;
  configState: ProcessFlowConfigProps | null;
  tagline?: string | null;
  title?: string | null;
  date?: string | null;
  ref?: string | null;
  icon?: string;
}) => {
  return (
    <div className="printable__page__header mb-4">
      <div className="flex between align">
        <div className="top__banner flex align gap-lg start">
          <img src={logo} alt="page header logo" />
          <div className="flex column">
            <h3 style={{ fontSize: 21, lineHeight: 1.1, fontWeight: 700 }}>
              Nigerian Content Development <br />
              &amp; Monitoring Board
            </h3>
            <small
              style={{
                letterSpacing: 2,
                textTransform: "uppercase",
                fontSize: 10,
                fontWeight: 400,
              }}
            >
              {tagline ?? "Tagline not set"}
            </small>
          </div>
        </div>
        <div className="icon__container flex align column gap-sm">
          <img src={icon ?? defaultIcon} alt="default icon" />
          <small
            style={{
              letterSpacing: 2,
              textTransform: "uppercase",
              fontSize: 10,
              fontWeight: 400,
            }}
          >
            {code ?? "Code"}
          </small>
        </div>
      </div>
    </div>
  );
};

export const InternalMemoHeader = ({
  to,
  from,
  through,
  ref,
  date,
  title,
  modify,
  isDisplay = false,
}: {
  to: CategoryProgressTrackerProps | null;
  from: CategoryProgressTrackerProps | null;
  through?: CategoryProgressTrackerProps | null;
  ref: string | null;
  date: string | null;
  title: string | null;
  modify?: (data: CategoryProgressTrackerProps, key: ProcessType) => void;
  isDisplay?: boolean;
}) => {
  return (
    <div className="printable__page__header mb-4">
      <div className="top__banner flex align gap-lg center">
        <img src={logo} alt="page header logo" />
        <h1>Internal Memo</h1>
      </div>
      <div className="top__distribution__table mt-4">
        <table className="custom__table__style">
          <tbody>
            <tr>
              <td colSpan={2}>
                <div className="flex align gap-md">
                  <span>TO:</span>
                  <span style={{ textTransform: "uppercase" }}>
                    {`${to?.workflow_stage_id ?? ""}${
                      !isDisplay ? `, ${to?.department_id ?? ""}` : ""
                    }`}
                  </span>
                </div>
              </td>
            </tr>
            {through && !_.isEmpty(through) && (
              <tr>
                <td colSpan={2}>
                  <div className="flex align gap-md">
                    <span>THROUGH:</span>
                    <span style={{ textTransform: "uppercase" }}>
                      {`${through?.workflow_stage_id ?? ""}${
                        isDisplay ? `, ${through?.department_id ?? ""}` : ""
                      }`}
                    </span>
                  </div>
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={2}>
                <div className="flex align gap-md">
                  <span>FROM:</span>
                  <span style={{ textTransform: "uppercase" }}>
                    {`${from?.workflow_stage_id ?? ""}${
                      !isDisplay ? `, ${from?.department_id ?? ""}` : ""
                    }`}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ width: "50%" }}>
                <div className="flex align gap-md">
                  <span>REF:</span>
                  <span style={{ textTransform: "uppercase" }}>{ref}</span>
                </div>
              </td>
              <td style={{ width: "50%" }}>
                <div className="flex align gap-md">
                  <span>DATE:</span>
                  <span style={{ textTransform: "uppercase" }}>
                    {date ? moment(date).format("LL") : ""}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <div className="flex align gap-md">
                  <span>SUBJECT:</span>
                  <span
                    style={{
                      letterSpacing: 0.6,
                    }}
                  >
                    {title?.toUpperCase()}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const BlockBuilderCard = ({
  raw,
  addToSheet,
}: {
  raw: BlockResponseData;
  addToSheet: (data: BlockResponseData, type: DeskComponentPropTypes) => void;
}) => {
  return (
    <div
      className="block__toolbar"
      onClick={() => addToSheet(raw, raw.data_type)}
    >
      <div className="flex align column gap-sm">
        <i className={`block__toolbar__icon ${raw.icon}`} />
        <span className="block__toolbar__title">{raw.title}</span>
      </div>
    </div>
  );
};
