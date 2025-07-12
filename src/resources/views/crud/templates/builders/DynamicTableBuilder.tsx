import { UserResponseData } from "app/Repositories/User/data";
import React from "react";
import {
  TableContentAreaHeaderProps,
  TableContentAreaRowProps,
} from "app/Hooks/useBuilder";

export type ResourcesList = "users" | "";

export type AccessibleResourceResponseData = {
  users: UserResponseData;
};

type Props = {
  headers: TableContentAreaHeaderProps[];
  rows: TableContentAreaRowProps[];
  // onChange: (table: TableContentAreaProps) => void;
};

const Row = ({
  headers,
  row,
}: {
  headers: TableContentAreaHeaderProps[];
  row: TableContentAreaRowProps;
}) => {
  // console.log(`Row: `, row);

  return (
    <tr className="hover:bg-gray-50">
      {headers.map((header) => (
        <td key={header.id} className="p-2 border-b">
          {String(row[header.column] ?? "")}
        </td>
      ))}
    </tr>
  );
};

const DynamicTableBuilder: React.FC<Props> = ({ headers, rows }) => {
  return (
    <table className="table table-bordered table-striped">
      <thead>
        <tr className="bg-gray-100">
          {headers.map((header) => (
            <th key={header.id} className="text-left p-2 border-b">
              {header.display_name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(rows ?? []).length > 0 &&
        (rows ?? []).every((row) => row.isVisible) ? (
          (rows ?? []).map((row, rowIndex) => (
            <Row key={rowIndex} headers={headers} row={row} />
          ))
        ) : (
          <tr>
            <td
              colSpan={headers.length}
              className="text-center py-4 text-gray-500"
            >
              No records added yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default DynamicTableBuilder;
