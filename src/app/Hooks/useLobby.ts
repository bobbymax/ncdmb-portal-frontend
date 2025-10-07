import {
  ExpenditureResponseData,
  FundProps,
} from "app/Repositories/Expenditure/data";
import { PaymentBatchResponseData } from "app/Repositories/PaymentBatch/data";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import usePageComponents from "./usePageComponents";

const staffPayments = ["claim", "retirement", "estacode"];
const useLobby = (
  bundle: ExpenditureResponseData[],
  setLocalState?: Dispatch<SetStateAction<PaymentBatchResponseData>>
) => {
  const page = usePageComponents();
  const [stacks, setStacks] = useState<ExpenditureResponseData[]>([]);
  const [queue, setQueue] = useState<
    {
      item: ExpenditureResponseData;
      originalIndex: number;
    }[]
  >([]);
  const [queueType, setQueueType] = useState<string | null>(null);
  const [fund, setFund] = useState<(FundProps & { id: number }) | null>(null);
  const [totalQueuedAmount, setTotalQueuedAmount] = useState(0);

  const category = useMemo(() => {
    if (!page) return null;

    const { categories = [] } = page;

    return categories.find((category) => category.type === "staff");
  }, [page]);

  const addToQueue = (itemId: number) => {
    const index = stacks.findIndex((item) => item.id === itemId);
    if (index === -1) return;

    const item = stacks[index];

    // // Set type and fund_id from the first added item
    // if (queue.length === 0) {
    //   const paymentType = staffPayments.includes(
    //     item?.expenditureable?.type ?? ""
    //   )
    //     ? "staff"
    //     : "third-party";
    //   setQueueType(paymentType);
    //   setFund({
    //     ...item?.fund,
    //     id: item?.fund_id,
    //   } as FundProps & { id: number });
    // }

    // Check constraints
    const limit = queueType === "staff" ? 6 : 1;
    if (queue.length >= limit) {
      toast.error(
        "You can only add 6 staff payments or 1 third-party payment to the queue."
      );
      return;
    }
    if (fund !== null && item.fund?.budget_code !== fund.budget_code) {
      toast.error(
        "You can only add expenditures with the same fund to the queue."
      );
      return;
    }

    setQueue((prev) => [...prev, { item, originalIndex: index }]);
    setStacks((prev) => prev.filter((_, i) => i !== index));
    if (setLocalState) {
      setLocalState((prevState) => ({
        ...prevState,
        expenditures: [...prevState.expenditures, item],
      }));
    }
  };

  const removeFromQueue = (itemId: number) => {
    const indexInQueue = queue.findIndex((q) => q.item.id === itemId);
    if (indexInQueue === -1) return;

    const removed = queue[indexInQueue];
    const newQueue = queue.filter((_, i) => i !== indexInQueue);

    setQueue(newQueue);

    // Restore to original position
    setStacks((prev) => {
      const newLobby = [...prev];
      newLobby.splice(removed.originalIndex, 0, removed.item);
      return newLobby;
    });

    // Reset type/fund_id if queue becomes empty
    if (newQueue.length === 0) {
      setQueueType(null);
      setFund(null);
    }

    if (setLocalState) {
      setLocalState((prevState) => ({
        ...prevState,
        expenditures: prevState.expenditures.filter(
          (expenditure) => expenditure.id !== itemId
        ),
      }));
    }
  };

  const resetLobbyQueue = () => {
    setStacks(bundle);
    setQueue([]);
    setQueueType(null);
    setFund(null);
    setTotalQueuedAmount(0);
    if (setLocalState) {
      setLocalState((prevState) => ({
        ...prevState,
        expenditures: [],
      }));
    }
  };

  useEffect(() => {
    if (bundle.length > 0) {
      setStacks((prev) => {
        const mergedLobby = [...bundle];

        // Remove anything that exists in queue
        return mergedLobby.filter(
          (item) => !queue.some((q) => q.item.id === item.id)
        );
      });
    }
    setTotalQueuedAmount(
      queue.reduce((acc, exp) => acc + Number(exp.item.amount), 0)
    );
  }, [bundle, queue]);

  return {
    stacks,
    queue: queue.map((q) => q.item),
    queueType,
    fund,
    totalQueuedAmount,
    category,
    addToQueue,
    removeFromQueue,
    resetLobbyQueue,
  };
};

export default useLobby;
