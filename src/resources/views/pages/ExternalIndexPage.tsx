/* eslint-disable react-hooks/exhaustive-deps */
import { useResourceActions } from "app/Hooks/useResourceActions";
import { BaseRepository, BaseResponse } from "app/Repositories/BaseRepository";
import { ServiceResponseData } from "app/Repositories/ServiceRepository";
import { ExternalApiService } from "app/Services/ExternalApiService";
import { PageProps } from "bootstrap";
import { useCallback, useEffect, useState } from "react";
import CustomDataTable, {
  ColumnData,
} from "../components/tables/CustomDataTable";
import { toast } from "react-toastify";

interface AxiosResponseData {
  data: any;
  status: string;
  message: string;
}

interface PaymentResponseData extends BaseResponse {
  paymentId: number;
  service_id: number;
  transaction_id: string;
  currency: "NGN" | "USD" | "GBP";
  transaction_amount: number;
  d_c: "D" | "C";
  transaction_description: string;
  transaction_date: string;
  budget_head_code: string;
  department_code: string;
  budget_year: number;
  status: "pending" | "posted";
}

const ExternalIndexPage = ({
  Repository,
  view,
  RepositoryInstance,
  Component,
}: PageProps<BaseRepository>) => {
  const [url, setUrl] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [payments, setPayments] = useState<PaymentResponseData[]>([]);
  const [postedPayments, setPostedPayments] = useState<PaymentResponseData[]>(
    []
  );

  const { raw, redirectTo } = useResourceActions(Repository, {
    url: view.server_url,
    shouldFetch: true,
    hasParam: true,
  });

  const columns: ColumnData[] = [
    {
      label: "ID",
      accessor: "transaction_id",
      type: "text",
    },
    {
      label: "AMOUNT",
      accessor: "transaction_amount",
      type: "text",
    },
    {
      label: "DESCRIPTION",
      accessor: "transaction_description",
      type: "text",
    },
    {
      label: "DATE",
      accessor: "transaction_date",
      type: "text",
    },
    {
      label: "BUDGET HEAD",
      accessor: "budget_head_code",
      type: "text",
    },
    {
      label: "DEPARTMENT CODE",
      accessor: "department_code",
      type: "text",
    },
    {
      label: "PERIOD",
      accessor: "budget_year",
      type: "text",
    },
    {
      label: "STATUS",
      accessor: "status",
      type: "text",
    },
  ];

  const fetchPaymentsData = useCallback(async () => {
    if (!url || !apiKey) return;

    const external = new ExternalApiService(url, apiKey);
    try {
      const response = await external.collect();
      const result = response.data as AxiosResponseData;
      const untreatedPayments = result.data.filter(
        (item: PaymentResponseData) =>
          !postedPayments.some((p) => p.paymentId === item.paymentId)
      );
      setPayments(untreatedPayments);
    } catch (error) {
      console.error("Error fetching external payments:", error);
      toast.error(
        "Failed to fetch payments. Please check your API configuration."
      );
    }
  }, [url, apiKey, postedPayments]);

  const fetchStoredPayments = useCallback(async () => {
    try {
      const response = await RepositoryInstance.customCollection("payments");
      if (response) {
        setPostedPayments(response.data as PaymentResponseData[]);
      }
    } catch (error) {
      console.error("Error fetching stored payments:", error);
    }
  }, [RepositoryInstance]);

  const saveToDatabaseOnExport = useCallback(
    async (data: Record<string, any>[]) => {
      try {
        const response = await RepositoryInstance.customStore(
          view.post_server_url ?? "service/payments",
          { service_id: raw?.id, payments: data }
        );
        if (response) {
          toast.success(response.message);
          redirectTo("/services");
        }
      } catch (error) {
        console.error("Error saving data:", error);
        toast.error("Failed to save data. Please try again.");
      }
    },
    [RepositoryInstance, raw, view.post_server_url, redirectTo]
  );

  useEffect(() => {
    if (raw) {
      const { url, apiKey } = raw as ServiceResponseData;
      setUrl(url);
      setApiKey(apiKey);
      fetchStoredPayments();

      return () => {
        setPayments([]);
        setPostedPayments([]);
      };
    }
  }, [raw, fetchStoredPayments]);

  useEffect(() => {
    fetchPaymentsData();
  }, [fetchPaymentsData]);

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <CustomDataTable
            tag={view?.tag ?? ""}
            pageName={view.title}
            collection={payments}
            columns={columns}
            buttons={[]}
            exportBttn="Post to SunSystems"
            bttnVaraint="danger"
            exportable
            onExportData={saveToDatabaseOnExport}
          />
        </div>
      </div>
    </>
  );
};

export default ExternalIndexPage;
