import { BlockModalProps, useModal } from "app/Context/ModalContext";
import { TableContentAreaHeaderProps } from "app/Hooks/useBuilder";
import React, { useEffect, useState } from "react";

const HeaderBlockModal: React.FC<BlockModalProps<"training">> = ({
  type,
  blockState,
  data,
  isUpdating,
  addBlockComponent,
}) => {
  const { getModalState, updateModalState } = useModal();
  const state: TableContentAreaHeaderProps = getModalState(type);

  useEffect(() => {
    if (data) {
      updateModalState(type, {
        ...state,
        ...(data as TableContentAreaHeaderProps),
      });
    }
  }, [data]);
  return <div>HeaderBlockModal</div>;
};

export default HeaderBlockModal;
