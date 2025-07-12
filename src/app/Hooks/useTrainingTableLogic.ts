import { UserResponseData } from "app/Repositories/User/data";
import { TableContentAreaProps, TableContentAreaRowProps } from "./useBuilder";
import useClaimCalculator from "./useClaimCalculator";
import { useEffect, useState } from "react";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { formatCurrency } from "app/Support/Helpers";

export const useTrainingTableLogic = (
  staff: UserResponseData[],
  state: TableContentAreaProps
): {
  rows: TableContentAreaRowProps[];
  total: number;
  distance: number;
  mode: "road" | "flight";
} => {
  const { getDistance, calculate } = useClaimCalculator();

  const [distance, setDistance] = useState(0);
  const [mode, setMode] = useState<"road" | "flight">("road");

  const [rows, setRows] = useState<TableContentAreaRowProps[]>([]);
  const [total, setTotal] = useState(0);

  // Recalculate rows + expense

  return {
    rows,
    total,
    distance,
    mode,
  };
};
