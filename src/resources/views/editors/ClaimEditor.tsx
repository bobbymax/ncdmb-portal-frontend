import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ResourceEditorProps } from "../components/partials/ResourceEditableComponent";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { ExpenseResponseData } from "app/Repositories/Expense/data";
import moment from "moment";
import { template } from "resources/assets";
import { formatCurrency, getEarliestAndLatestDates } from "app/Support/Helpers";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import Button from "../components/forms/Button";
import { useModal } from "app/Context/ModalContext";
import AlterExpense from "../crud/modals/AlterExpense";
import {
  ProcessedDataProps,
  ServerSideProcessedDataProps,
} from "app/Context/FileProcessorProvider";
import useEditorResources from "app/Hooks/useEditorResources";
import { ResourceEditorResponseData } from "app/Repositories/ResourceEditor/data";

const ExpenseCard = ({
  expense,
  actions,
  manage,
  editable,
  editor,
}: {
  expense: ExpenseResponseData;
  actions: DocumentActionResponseData[];
  editable: boolean;
  editor: ResourceEditorResponseData | null;
  manage: (
    exp: ExpenseResponseData,
    status: "cleared" | "altered" | "rejected"
  ) => void;
}) => {
  const durationFormat = () => {
    if (expense.start_date === "" || expense.end_date === "") {
      return "The date period for this claim has not been set!";
    }

    const start = moment(expense.start_date);
    const end = moment(expense.end_date);

    return `${start.format("ll")} - ${end.format("ll")}`;
  };
  return (
    <div className="expense__new__card mb-3">
      <div className="claim__header__details flex align gap-md mb-2">
        <div className="icon__area">
          <img src={template.status.pending.image} alt="Status Badge" />
        </div>
        <div className="expense__new__details">
          <p>{expense.description}</p>
          <span>{durationFormat()}</span>
        </div>
        <div className="badge__area"></div>
      </div>
      <div className="amount__analysis mt-4">
        <div className="row">
          <div className="col-md-4">
            <small className="owner">Spent:</small>
            <span>{formatCurrency(expense.total_amount_spent)}</span>
          </div>
          <div className="col-md-4">
            <small className="treasury">Cleared:</small>
            <span>{formatCurrency(expense.cleared_amount)}</span>
          </div>
          <div className="col-md-4">
            <small className="audit">Audited:</small>
            <span>{formatCurrency(expense.audited_amount)}</span>
          </div>
        </div>
      </div>
      {editable && (
        <div className="action__area mt-4 flex align gap-md end">
          {actions.map((action, i) => (
            <Button
              key={i}
              label={action.button_text}
              handleClick={() =>
                manage(
                  expense,
                  action?.draft_status as "cleared" | "altered" | "rejected"
                )
              }
              icon={action.icon}
              variant={action.variant}
              size="xs"
              isDisabled={
                (expense[
                  editor?.resource_column_name as keyof typeof expense
                ] as number) > 0 || expense.status === "rejected"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ClaimEditor: React.FC<
  ResourceEditorProps<ClaimRepository, ClaimResponseData>
> = ({
  repo,
  resource: claim,
  state,
  setState,
  handleChange,
  service,
  staff,
  editor,
  processor,
  actions,
  dependencies,
  editable,
}) => {
  const { openLoop, closeModal } = useModal();
  const { currentServerState, transmit } = useEditorResources(repo);
  const [localState, setLocalState] = useState<
    ServerSideProcessedDataProps<ClaimResponseData>
  >({} as ServerSideProcessedDataProps<ClaimResponseData>);
  const [dataProcessed, setDataProcessed] = useState<
    ProcessedDataProps<ExpenseResponseData>[]
  >([]);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [consolidated, setConsolidated] = useState<boolean>(false);

  const [period, setPeriod] = useState<{ value: string }[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponseData[]>([]);
  const [cannotConfirmAll, setCannotConfirmAll] = useState<boolean>(false);

  const grouped = useMemo(() => {
    if (expenses.length < 1) return {};

    return expenses.reduce<Record<string, typeof expenses>>((acc, item) => {
      const key = item.allowance ?? "Unknown";
      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(item);
      return acc;
    }, {});
  }, [expenses]);

  const confirmAll = () => {
    if (!editor) return;

    const updatedExpenses: ExpenseResponseData[] = expenses.map((expx) => {
      const spent = Number(expx.total_amount_spent);
      const cleared =
        Number(expx.cleared_amount) > 0 ? Number(expx.cleared_amount) : spent;

      return {
        ...expx,
        status: "cleared",
        variation_type: "exact",
        [editor.resource_column_name]: cleared,
      };
    });

    const processedData: ProcessedDataProps<ExpenseResponseData>[] =
      updatedExpenses.map((exp) => ({
        raw: exp,
        status: "cleared",
        actionPerformed: "exact",
      }));

    setExpenses(updatedExpenses);
    setDataProcessed(processedData);
    setCannotConfirmAll(true);
  };

  const modify = (props: ProcessedDataProps<ExpenseResponseData>) => {
    if (!editor) return;

    const exp: ExpenseResponseData = {
      ...props.raw,
      variation_type: props.actionPerformed as
        | "add"
        | "subtract"
        | "exact"
        | "removed",
      status: props.status,
      [editor.resource_column_name]:
        props.actionPerformed !== "removed"
          ? Number(props.raw.total_amount_paid) > 0
            ? Number(props.raw.total_amount_paid)
            : Number(props.raw.total_amount_spent)
          : 0,
    };

    setExpenses((prevExpenses) =>
      prevExpenses.map((expx) => (expx.id === exp.id ? exp : expx))
    );

    // Updated Processed Data State
    const processed: ProcessedDataProps<ExpenseResponseData> = {
      ...props,
      raw: exp,
    };

    setDataProcessed((prev) => {
      const exists = prev.some((item) => item.raw.id === processed.raw.id);

      if (exists) {
        // Replace existing item
        return prev.map((item) =>
          item.raw.id === processed.raw.id ? processed : item
        );
      } else {
        // Add new item
        return [...prev, processed];
      }
    });

    if (!cannotConfirmAll) {
      setCannotConfirmAll(true);
    }
    // Close Modal
    // console.log("modified");

    closeModal();
  };

  const clearPaymentAction = useMemo(() => {
    if (!actions) return;

    return actions.find((action) => action.label === "clear");
  }, [actions]);

  const resolveClaimPayments = useCallback(
    (action: DocumentActionResponseData) => {
      transmit(action, localState, dataProcessed, processor);
      // Do other things
    },
    [localState, dataProcessed]
  );

  const manageExpense = (
    exp: ExpenseResponseData,
    status: "cleared" | "altered" | "rejected"
  ) => {
    if (status === "altered") {
      openLoop(AlterExpense, "expense", {
        title: "Audit Expense",
        modalState: state,
        data: exp,
        repo: repo,
        isUpdating: true,
        handleSubmit: modify,
        dependencies: dependencies as object,
        extras: [period, status],
      });
    } else {
      const processedData: ProcessedDataProps<ExpenseResponseData> = {
        raw: exp,
        status,
        actionPerformed: status === "cleared" ? "exact" : "removed",
      };

      modify(processedData);
    }
  };

  useEffect(() => {
    if (claim.expenses && claim.expenses.length > 0) {
      const { earliest } = getEarliestAndLatestDates(
        claim.expenses.map((expense) => expense.start_date)
      );

      const { latest } = getEarliestAndLatestDates(
        claim.expenses.map((expense) => expense.end_date)
      );

      const duration: { value: string }[] = [
        { value: earliest },
        { value: latest },
      ];

      setExpenses(claim.expenses);
      setPeriod(duration);
    }
  }, [claim.expenses]);

  useEffect(() => {
    const serverState: ServerSideProcessedDataProps<ClaimResponseData> =
      currentServerState as unknown as ServerSideProcessedDataProps<ClaimResponseData>;
    setLocalState((prev) => ({
      ...prev,
      ...serverState,
      service: "expense",
      method: "processExpenses",
      state: {
        ...serverState.state,
        editor_id: editor?.id,
        claim_id: claim.id,
      },
      status: editor
        ? editor.resource_column_name.replace("_amount", "")
        : "pending",
    }));
  }, [currentServerState, editor]);

  useEffect(() => {
    const processedIds = new Set(dataProcessed.map((p) => p.raw.id));
    const allProcessed = expenses.every((e) => processedIds.has(e.id));
    const amountAccessible = expenses.every((e: ExpenseResponseData) => {
      const key = editor?.resource_column_name as keyof ExpenseResponseData;
      const value = e[key];
      return Number(value) > 0;
    });

    setIsProcessed(amountAccessible);
    setConsolidated(amountAccessible);
  }, [expenses, dataProcessed, editor]);

  return (
    <>
      {editable && (
        <div className="claim__header flex align gap-md">
          <Button
            label="Clear All Expenses"
            handleClick={confirmAll}
            variant="dark"
            size="xs"
            icon="ri-verified-badge-line"
            isDisabled={cannotConfirmAll || consolidated}
          />
          {clearPaymentAction && (
            <Button
              label="Verify Payment"
              handleClick={() => resolveClaimPayments(clearPaymentAction)}
              variant={clearPaymentAction.variant}
              size="xs"
              icon={clearPaymentAction.icon}
              isDisabled={!isProcessed || claim.total_amount_approved > 0}
            />
          )}
        </div>
      )}

      <div className="claim__expenses mt-4">
        {Object.entries(grouped).map(([allowanceName, expenses]) => (
          <div className="expense__editor__container" key={allowanceName}>
            <div className="allowance__sumation flex align between mb-3">
              <p>{allowanceName}</p>
              <p>
                {formatCurrency(
                  expenses.reduce(
                    (sum, exp) => sum + Number(exp.total_amount_spent),
                    0
                  )
                )}{" "}
              </p>
            </div>
            <div className="expenses__area">
              {expenses.map((expense, i) => (
                <ExpenseCard
                  key={i}
                  expense={expense}
                  actions={actions}
                  manage={manageExpense}
                  editable={editable}
                  editor={editor}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="claim__total"></div>
    </>
  );
};

export default ClaimEditor;
