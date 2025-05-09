import { TransactionResponseData } from "app/Repositories/Transaction/data";
import { ModalLoopProps, useModal } from "app/Context/ModalContext";
import TransactionRepository from "app/Repositories/Transaction/TransactionRepository";
import React from "react";

const TransactionModal: React.FC<
  ModalLoopProps<TransactionRepository, TransactionResponseData>
> = ({ modalState, data, isUpdating, handleSubmit, repo }) => {
  const {
    getModalState,
    updateModalState,
    handleInputChange,
    currentIdentifier,
  } = useModal();

  console.log(modalState);

  return <div>TransactionModal</div>;
};

export default TransactionModal;
