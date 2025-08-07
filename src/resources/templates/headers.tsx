import moment from "moment";
import logo from "../assets/images/logo.png";
import { BlockDataType, BlockResponseData } from "app/Repositories/Block/data";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import _ from "lodash";
import defaultIcon from "../assets/images/apps/template.png";
import { ConfigState, ProcessType } from "app/Hooks/useTemplateHeader";

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
  configState: ConfigState;
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
  to: TemplateProcessProps | null;
  from: TemplateProcessProps | null;
  through?: TemplateProcessProps | null;
  ref: string | null;
  date: string | null;
  title: string | null;
  modify?: (data: TemplateProcessProps, key: ProcessType) => void;
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
                    {`${to?.stage?.label ?? ""}${
                      !isDisplay ? `, ${to?.department?.label ?? ""}` : ""
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
                      {`${through?.stage?.label ?? ""}${
                        isDisplay ? `, ${through?.department?.label ?? ""}` : ""
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
                    {`${from?.stage?.label ?? ""}${
                      !isDisplay ? `, ${from?.department?.label ?? ""}` : ""
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
