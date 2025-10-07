import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";
import { formatCurrency } from "app/Support/Helpers";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

interface LobbyItemProps {
  item: ExpenditureResponseData;
  onAddToQueue: (id: number) => void;
}

export const LobbyList = ({
  stacks,
  onAddToQueue,
}: {
  stacks: ExpenditureResponseData[];
  onAddToQueue: (id: number) => void;
}) => {
  return <></>;
};
