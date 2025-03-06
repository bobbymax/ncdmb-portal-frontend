import React, { useEffect, useMemo, useState } from "react";
import { ActionComponentProps } from "../modals/DocumentUpdateModal";
import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";
import { useAuth } from "app/Context/AuthContext";
import { repo } from "bootstrap/repositories";
import { FundResponseData } from "app/Repositories/Fund/data";
import { formatOptions } from "app/Support/Helpers";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import useRepo from "app/Hooks/useRepo";

type DependencyProps = {
  funds: FundResponseData[];
};

const ExpenditureActionComponent: React.FC<
  ActionComponentProps<ExpenditureResponseData>
> = ({
  identifier,
  data,
  action,
  onSubmit,
  updateDocumentState,
  state,
  currentDraft,
}) => {
  const { staff } = useAuth();
  const { dependencies } = useRepo(repo("expenditure"));

  const [funds, setFunds] = useState<DataOptionsProps[]>([]);

  console.log(data);

  /**
   *
   * I have access to the action performed
   * I have access to the resource data (column_name: data)
   * I have access to the state {identifier}
   * I have access to the current draft
   * I have access to the dependencies from the modal
   * i have access to the global modal state {getModalState, updateModalState}
   * through the updateDocumentState
   *
   */
  // console.log(funds);

  useEffect(() => {
    if (dependencies) {
      const { funds } = dependencies as DependencyProps;

      setFunds(formatOptions(funds, "id", "name"));
    }
  }, [dependencies]);

  return <div>ExpenditureActionComponent</div>;
};

export default ExpenditureActionComponent;
