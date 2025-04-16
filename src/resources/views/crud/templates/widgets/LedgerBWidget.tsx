import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { SidebarProps } from "../sidebars/AnalysisSidebar";
import { PaymentBatchResponseData } from "app/Repositories/PaymentBatch/data";
import { repo } from "bootstrap/repositories";
import { ChartOfAccountResponseData } from "app/Repositories/ChartOfAccount/data";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import { formatCurrency, formatOptions } from "app/Support/Helpers";
import { useStateContext } from "app/Context/ContentContext";
import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";
import Box from "resources/views/components/forms/Box";
import { LedgerResponseData } from "app/Repositories/Ledger/data";

type DependencyProps = {
  chartOfAccounts: ChartOfAccountResponseData[];
  ledgers: LedgerResponseData[];
};

const LedgerBWidget: React.FC<SidebarProps<PaymentBatchResponseData>> = ({
  tracker,
  resource,
  widget,
  uploadCount,
  docType,
  document,
}) => {
  const { isLoading, setIsLoading } = useStateContext();
  const batchRepo = useMemo(() => repo("payment_batch"), []);
  const batch = useMemo(() => resource as PaymentBatchResponseData, [resource]);
  const [accountCodes, setAccountCodes] = useState<
    ChartOfAccountResponseData[]
  >([]);
  const [ledgers, setLedgers] = useState<LedgerResponseData[]>([]);
  const [accCode, setAccCode] = useState<DataOptionsProps | null>(null);
  const [allSelected, setAllSelected] = useState<string>("no");
  const [paymentIds, setPaymentIds] = useState<number[]>([]);

  const handleRequirementsChange = (newValue: unknown) => {
    const result = newValue as DataOptionsProps;
    setAccCode(result);
  };

  const expenditures: ExpenditureResponseData[] = useMemo(() => {
    if (!batch) return [];
    // const batch = resource as PaymentBatchResponseData;
    return batch.expenditures ?? [];
  }, [batch]);

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setAllSelected(isChecked ? "yes" : "no");
    const ids: number[] = [];
    expenditures.map((exp) => ids.push(exp.id));
    const paymentIds = isChecked ? ids : [];
    setPaymentIds(paymentIds);
  };

  useEffect(() => {
    if (batchRepo) {
      const dependencies = async () => {
        try {
          const response = (await batchRepo.dependencies()) as unknown;
          const { chartOfAccounts = [], ledgers = [] } =
            response as DependencyProps;
          setAccountCodes(chartOfAccounts);
          setLedgers(ledgers);
        } catch (error) {
          console.error(error);
        }
      };

      dependencies();
    }
  }, [batchRepo]);

  console.log(paymentIds);

  return (
    <>
      <div className="payment__voucher">
        <h4 className="voucher__title mb-5">{widget.title}</h4>

        <div className="row mt-4">
          <div className="col-md-12 mb-3">
            <MultiSelect
              label="Account Code"
              options={formatOptions(accountCodes, "id", "name")}
              value={accCode}
              onChange={handleRequirementsChange}
              placeholder="Account Code"
              isSearchable
              isDisabled={isLoading}
            />
          </div>
          <div className="col-md-12 mb-3">
            <Box
              label="Select All"
              value={allSelected}
              onChange={handleSelectAll}
              isChecked={
                allSelected === "yes" ||
                (paymentIds.length > 0 &&
                  paymentIds.length === expenditures.length)
              }
            />
          </div>
          <div className="col-md-12 mb-3">
            {expenditures.length > 0 ? (
              expenditures.map((exp, i) => (
                <div key={i} className="payment_exps flex align between gap-md">
                  <Box
                    value={exp.id}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      if (isChecked && !paymentIds.includes(exp.id)) {
                        setPaymentIds((prev) => [...prev, exp.id]);
                      } else {
                        setPaymentIds((prev) =>
                          prev.filter((id) => id !== exp.id)
                        );
                      }
                    }}
                    type="checkbox"
                    isChecked={paymentIds.includes(exp.id)}
                  />
                  <div className="detts flex column">
                    <small>
                      {batch.type === "staff"
                        ? exp.expenditureable?.owner?.name
                        : exp.expenditureable?.vendor?.name}
                    </small>
                    <span>{exp.purpose}</span>
                    <p>{formatCurrency(Number(exp.amount))}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No Expenditures</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LedgerBWidget;
