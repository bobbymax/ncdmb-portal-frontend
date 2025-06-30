import moment from "moment";
import logo from "../assets/images/logo.png";

type HandlerProps = {
  user_id: number;
  staff_name: string;
  staff_id: string;
  department_id: number;
  group_id: number;
  carder_id: number;
  designation: string;
  flag: "to" | "from" | "through";
};

export const InternalMemoHeader = ({
  to,
  from,
  through,
  ref,
  date,
  title,
}: {
  to: HandlerProps | null;
  from: HandlerProps | null;
  through?: HandlerProps | null;
  ref: string | null;
  date: string | null;
  title: string | null;
}) => {
  return (
    <div className="printable__page__header">
      <div className="top__banner flex align gap-lg center">
        <img src={logo} alt="page header logo" />
        <h1>Internal Memo</h1>
      </div>
      <div className="top__distribution__table mt-4">
        <table className="custom__table__style">
          <tr>
            <td colSpan={2}>TO: {to?.designation}</td>
          </tr>
          <tr>
            <td colSpan={2}>FROM: {from?.designation}</td>
          </tr>
          <tr>
            <td>REF: {ref}</td>
            <td>DATE: {date ? moment(date).format("LL") : ""}</td>
          </tr>
          <tr>
            <td colSpan={2}>{title}</td>
          </tr>
        </table>
      </div>
    </div>
  );
};
