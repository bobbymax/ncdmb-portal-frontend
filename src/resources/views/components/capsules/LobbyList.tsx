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
  return (
    <div className="flex gap-md" style={{ flexWrap: "wrap" }}>
      <AnimatePresence mode="popLayout">
        {/* AnimatePresence is used to animate the exit of items */}
        {stacks.map((expenditure) => (
          <motion.div
            key={expenditure.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              layout: {
                type: "spring",
                damping: 22,
                stiffness: 60,
              },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
            className="custom-card file__card"
            style={{
              width: "32.5%",
              maxWidth: "32.5%",
            }}
          >
            <div className="queue__item" key={expenditure.id}>
              <div className="queue__item__header flex align between mb-4">
                <span>{expenditure.fund?.budget_code}</span>
                <i
                  style={{ fontSize: 18 }}
                  className="batch__expense__icon ri-add-line"
                  onClick={() => onAddToQueue(expenditure.id)}
                />
              </div>
              <div className="queue__item__body">
                <p className="mb-2">{expenditure.purpose}</p>
                <small
                  style={{
                    backgroundColor:
                      expenditure.fund?.type === "recurrent"
                        ? "purple"
                        : expenditure.fund?.type === "personnel"
                        ? "darkgreen"
                        : "orange",
                  }}
                >
                  {expenditure.fund?.type}
                </small>
                <p className="amount mb-4">
                  {formatCurrency(Number(expenditure?.amount))}
                </p>
                <span
                  style={{
                    textTransform: "uppercase",
                    fontSize: 9,
                    letterSpacing: 1,
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  Beneficiary
                </span>
                <span
                  style={{
                    textTransform: "uppercase",
                    fontSize: 13,
                    letterSpacing: 1,
                    fontWeight: 600,
                    display: "block",
                    color: "darkgreen",
                  }}
                >
                  {expenditure.expenditureable?.type === "claim"
                    ? expenditure?.expenditureable?.owner?.name
                    : expenditure?.expenditureable?.vendor?.name}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginTop: 15,
                    fontWeight: 500,
                    display: "block",
                    color: "orangered",
                  }}
                >
                  Raised On: {moment(expenditure.created_at).format("ll")}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
