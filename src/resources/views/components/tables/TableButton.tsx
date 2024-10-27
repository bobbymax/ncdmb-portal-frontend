/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { ConditionalArray, Raw } from "../../../../app/Support/DataTable";
import { ButtonsProp } from "./CustomDataTable";
import Button from "../forms/Button";

interface TableBttnProp {
  raw: Raw;
  button: ButtonsProp;
  action: (raw: Raw, value: string) => void;
}

const TableButton = ({ raw, button, action }: TableBttnProp) => {
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const getOperation = (raw: Raw, conditions: ConditionalArray): boolean => {
    let response = false;

    if (conditions.length !== 3) {
      throw new Error("Array must have exactly 3 elements.");
    }

    const operator = conditions[1];
    const data = raw[conditions[0]];

    switch (operator) {
      case "!=":
        response = data !== conditions[2];
        break;

      case "<":
        response = data < conditions[2];
        break;

      case "<=":
        response = data <= conditions[2];
        break;

      case ">":
        response = data > conditions[2];
        break;

      case ">=":
        response = data >= conditions[2];
        break;

      default:
        response = data === conditions[2];
        break;
    }

    return response;
  };

  const checkBttnStatus = (
    raw: Raw,
    conditions: ConditionalArray[],
    operator: "and" | "or" = "and"
  ) => {
    let isDisabled: boolean = false;

    switch (operator) {
      case "or":
        isDisabled = conditions.some(
          (condition) => getOperation(raw, condition) === true
        );
        break;

      default:
        isDisabled = conditions.every(
          (condition) => getOperation(raw, condition) === true
        );
        break;
    }

    return isDisabled;
  };

  useEffect(() => {
    const checkStatus = (raw: Raw) => {
      let isDisabled = false;
      if (button.conditions.length > 0) {
        isDisabled = checkBttnStatus(raw, button.conditions, button.operator);
      }
      setIsDisabled(isDisabled);
    };

    checkStatus(raw);
  }, [raw, button]);

  return (
    <Button
      label={button?.display}
      icon={button.icon}
      variant={button.variant}
      handleClick={() => action(raw, button.label)}
      isDisabled={isDisabled}
      size="sm"
    />
  );
};

export default TableButton;
