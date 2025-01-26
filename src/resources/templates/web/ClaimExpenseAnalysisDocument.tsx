import logo from "../../assets/images/logo.png";
import claimLogo from "../../assets/images/modules/claim.png";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import {
  covertToWords,
  formatAmountNoCurrency,
  formatDateToPeriodString,
} from "app/Support/Helpers";

interface AnalysisDocProps {
  data: ClaimResponseData;
  signature?: string;
}

const ClaimExpenseAnalysisDocument = ({
  data,
  signature,
}: AnalysisDocProps) => {
  return (
    <div className="canvas__container">
      <div className="top__layer">
        <div className="brand__identity">
          <img src={logo} alt="Logo" />
          <div className="brand__name">
            <h1>
              Nigerian Content Development
              <br />
              &amp; Monitoring Board
            </h1>
            <p className="subtxt">
              Finance &amp; Account Directorate Analysis of Expenditure
            </p>
          </div>
        </div>
        <div className="claim__identity">
          <img src={claimLogo} alt="Claim Logo" />
          <p>{data.code}</p>
        </div>
      </div>
      <div className="rest__layer">
        <div className="title__section">
          <p className="subtxt">Purpose of Claim:</p>
          <h1>{data.title}</h1>
        </div>

        <div className="print__expense__wrapper mt-4">
          {data.expenses.map((expense, i) => (
            <div key={i} className="print__expense__container">
              <div className="description__section">
                <div className="expense__dot" />
                <div className="expense__description">
                  <h4>{expense.description}</h4>
                  <p className="subtxt">
                    {formatDateToPeriodString(
                      expense.start_date,
                      expense.end_date
                    )}
                  </p>
                </div>
              </div>
              <div className="amount__section">
                {formatAmountNoCurrency(expense.total_amount_spent)}
              </div>
            </div>
          ))}
        </div>

        <div className="total__expense_section">
          <div className="total__expense__container">
            <p className="subtxt">Total Amount Spent:</p>
            <h1>{formatAmountNoCurrency(data.total_amount_spent)}</h1>
          </div>
          <div className="total__expense__container">
            <p className="subtxt">Amount in Words:</p>
            <h4>{covertToWords(data.total_amount_spent)}</h4>
          </div>
          <div className="signatures__section mt-5">
            <div className="claimant__signature__container">
              <div className="claimant__staff__details">
                <h5 className="subtxt">{data.owner?.staff_no}</h5>
                <h3>{data.owner?.grade_level}</h3>
                <h1>{data.owner?.name}</h1>
              </div>
              <div className="signature__pad__claimant">
                {signature && (
                  <img
                    src={signature}
                    className="signature__item"
                    alt="Signature"
                  />
                )}
              </div>
            </div>
            <div className="approval__signature__container">
              <div className="signature__pad__approval mb-5">
                <div className="long__dash" />
                <h4>Approved</h4>
              </div>
              <div className="approving__staff__details">
                <div className="long__dash" />
                <h4>Name in Blocks:</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimExpenseAnalysisDocument;
