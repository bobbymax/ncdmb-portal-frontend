import moment from "moment";
import logo from "../assets/images/logo.png";
import { BlockDataType, BlockResponseData } from "app/Repositories/Block/data";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import _ from "lodash";
import { toSmartSingular } from "app/Support/Helpers";
import { ProcessType } from "../views/crud/ContentBuilder";

export const InternalMemoHeader = ({
  to,
  from,
  through,
  ref,
  date,
  title,
  modify,
}: {
  to: TemplateProcessProps | null;
  from: TemplateProcessProps | null;
  through?: TemplateProcessProps | null;
  ref: string | null;
  date: string | null;
  title: string | null;
  modify?: (data: TemplateProcessProps, key: ProcessType) => void;
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
                TO:{" "}
                {`${toSmartSingular(to?.group?.label ?? "")}, ${
                  to?.department?.label ?? ""
                }`}
              </td>
            </tr>
            {through && !_.isEmpty(through) && (
              <tr>
                <td colSpan={2}>
                  THROUGH:{" "}
                  {`${toSmartSingular(through?.group?.label ?? "")}, ${
                    through?.department?.label ?? ""
                  }`}
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={2}>
                FROM:{" "}
                {`${toSmartSingular(from?.group?.label ?? "")}, ${
                  from?.department?.label ?? ""
                }`}
              </td>
            </tr>
            <tr>
              <td>REF: {ref}</td>
              <td>DATE: {date ? moment(date).format("LL") : ""}</td>
            </tr>
            <tr>
              <td colSpan={2}>SUBJECT: {title}</td>
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
  addToSheet: (data: BlockResponseData, type: BlockDataType) => void;
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
