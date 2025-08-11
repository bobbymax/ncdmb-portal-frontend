import { useAuth } from "app/Context/AuthContext";
import { useStateContext } from "app/Context/ContentContext";
import {
  ServerSideProcessedDataProps,
  useFileProcessor,
} from "app/Context/FileProcessorProvider";
import { ChartOfAccountResponseData } from "app/Repositories/ChartOfAccount/data";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { EntityResponseData } from "app/Repositories/Entity/data";
import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";
import { LedgerResponseData } from "app/Repositories/Ledger/data";
import { PaymentBatchResponseData } from "app/Repositories/PaymentBatch/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import Alert from "app/Support/Alert";
import { repo } from "bootstrap/repositories";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import useServerSideProcessedData, {
  ServerOptions,
} from "./useServerSideProcessedData";

export type ProcessorProps = {
  paymentIds: number[];
  period: string;
  budget_year: number;
  type: "staff" | "third-party";
  status: "draft" | "posted" | "reversed";
  service: string;
  workflow_id: number;
  trigger_workflow_id: number;
  account_code_id: number;
  department_id: number;
  user_id: number;
  document_id: number;
  document_draft_id: number;
  document_type: string;
  document_category: string;
  progress_tracker_id: number;
  document_action_id: number;
  transaction_type_id: string;
  payment_batch_id: number;
  ledger_id: number;
  entity_id: number;
  entity_type: string; // entity, user, vendor
  mode: "store" | "update" | "destroy" | "generate";
  file_url: string;
  method: string;
};

type DependencyProps = {
  chartOfAccounts: ChartOfAccountResponseData[];
  ledgers: LedgerResponseData[];
  entities: EntityResponseData[];
};

const usePaymentProcessor = (
  payment: PaymentBatchResponseData,
  currentDraft: DocumentDraftResponseData | null,
  tracker: ProgressTrackerResponseData,
  document: DocumentResponseData,
  updateRaw?: (data: DocumentResponseData) => void,
  invoice?: unknown
) => {
  const { staff } = useAuth();
  const { updateServerProcessedData } = useFileProcessor();
  const { isLoading, setIsLoading } = useStateContext();
  const batchRepo = useMemo(() => repo("payment_batch"), []);

  const expenditures: ExpenditureResponseData[] = useMemo(() => {
    if (!payment) return [];
    return payment.expenditures ?? [];
  }, [payment]);

  const options: ServerOptions = useMemo(
    () => ({
      type: payment.type,
      method: "consolidate",
      mode: "store",
      service: "payment",
      period: "",
      file: "",
      budget_year: payment.budget_year ?? 2025,
      workflow_id: tracker?.workflow_id ?? 0,
      state: {
        id: payment.id,
      },
      document_type: "payment-voucher",
      document_category: `${payment.type}-commitment`,
      status: "voucher-generated",
      entity_type: "entity",
      trigger_workflow_id: tracker.internal_process_id,
    }),
    [payment]
  );

  const property = useMemo(() => {
    // Entity Type: entity,user,vendor
    if (!payment) return null;
    return {
      type: "payment-voucher",
      category: `${payment.type}-commitment`,
      service: "payment",
      entity_type: "entity",
      mode: "store" as "store" | "update" | "destroy" | "generate",
      status: "draft" as "draft" | "posted" | "reversed",
      method: "consolidate",
    };
  }, [payment]);

  const { responseState, dataCollections } = useServerSideProcessedData(
    payment,
    currentDraft,
    options,
    tracker
  );

  const [allSelected, setAllSelected] = useState<string>("no");
  const [accountCodes, setAccountCodes] = useState<
    ChartOfAccountResponseData[]
  >([]);
  const [ledgers, setLedgers] = useState<LedgerResponseData[]>([]);
  const [entities, setEntities] = useState<EntityResponseData[]>([]);
  const [state, setState] = useState<ProcessorProps>({} as ProcessorProps);
  const [selectedOptions, setSelectedOptions] = useState<{
    entity: DataOptionsProps | null;
    ledger: DataOptionsProps | null;
    account_code: DataOptionsProps | null;
    transaction_type: DataOptionsProps | null;
  }>({
    entity: null,
    ledger: null,
    account_code: null,
    transaction_type: null,
  });

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) => (newValue: unknown) => {
      const updatedValue = newValue as DataOptionsProps;
      setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));

      setState((prev) => ({
        ...prev,
        [`${key}_id`]: updatedValue.value,
      }));
    },
    []
  );

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setAllSelected(isChecked ? "yes" : "no");
    const ids: number[] = [];
    expenditures.map((exp) => ids.push(exp.id));
    const paymentIds = isChecked ? ids : [];
    setState((prev) => ({
      ...prev,
      paymentIds,
    }));
  };

  const handleCheckbox = (isChecked: boolean, exp: ExpenditureResponseData) => {
    if (isChecked && !(state.paymentIds ?? []).includes(exp.id)) {
      setState((prev) => ({
        ...prev,
        paymentIds: [...(prev.paymentIds ?? []), exp.id],
      }));
    } else {
      setState((prev) => ({
        ...prev,
        paymentIds: prev.paymentIds
          ? prev.paymentIds.filter((id) => id !== exp.id)
          : prev.paymentIds,
      }));
    }
  };

  const updateProcessorState = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // useEffect(() => {
  //   if (property && document && tracker && payment && staff && currentDraft) {
  //     const body: Partial<
  //       ServerSideProcessedDataProps<PaymentBatchResponseData>
  //     > = {
  //       ...property,
  //       document_type: property.type,
  //       document_category: property.category,
  //       document_draft_id: currentDraft.id,
  //       mode: property.mode as "store" | "update",
  //       document_resource_id: payment.id,
  //       document_id: document.id,
  //       workflow_id: document.workflow_id,
  //       trigger_workflow_id: tracker.internal_process_id,
  //       progress_tracker_id: tracker.id,
  //       type: payment.type,
  //       user_id: staff.id,
  //       budget_year: payment.budget_year,
  //       department_id: staff.department_id,
  //     };

  //     updateServerProcessedData(body);
  //   }
  // }, [property, document, tracker, payment, staff, currentDraft]);

  useEffect(() => {
    if (batchRepo) {
      const dependencies = async () => {
        try {
          const response = (await batchRepo.dependencies()) as unknown;
          const {
            chartOfAccounts = [],
            ledgers = [],
            entities = [],
          } = response as DependencyProps;
          setAccountCodes(chartOfAccounts);
          setLedgers(ledgers);
          setEntities(entities);
        } catch (error) {
          console.error(error);
        }
      };

      dependencies();
    }
  }, [batchRepo]);

  useEffect(() => {
    if (expenditures.length > 0 && state.paymentIds) {
      setAllSelected(
        expenditures.length === state.paymentIds.length ? "yes" : "no"
      );
    }
  }, [state.paymentIds, expenditures, allSelected]);

  return {
    property,
    state,
    ledgers,
    entities,
    accountCodes,
    expenditures,
    selectedOptions,
    payment,
    allSelected,
    handleSelectAll,
    handleCheckbox,
    updateProcessorState,
    handleSelectionChange,
    setAllSelected,
  };
};

export default usePaymentProcessor;
