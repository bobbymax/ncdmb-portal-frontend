import { useModal } from "app/Context/ModalContext";
import Modal from "../components/Modal";

const ModalPage = () => {
  const { isOpen, content, closeModal, title } = useModal();

  if (!isOpen) return null;

  return (
    <Modal title={title} show={isOpen} close={closeModal} size="lg">
      {content}
    </Modal>
  );
};

export default ModalPage;
