import React, { ReactNode } from "react";

export interface ModalProps {
  title: string;
  close: () => void;
  show: boolean;
  size: "sm" | "md" | "lg";
  children: ReactNode;
}

const Modal = ({ title, close, show, size, children }: ModalProps) => {
  const isToggled = show ? "modal block" : "modal none";
  return (
    <div className={isToggled}>
      <section
        className={`animate__animated animate__bounceIn ${
          size === "lg" ? "modal-main" : "modal-main-normal"
        } ${size && size === "lg" ? " large" : ""}`}
      >
        <div className="custom__modal-header">
          <h3 className="custom__modal-title">{title}</h3>
          <button type="button" className="custom__modal-btn" onClick={close}>
            <i className="ri-close-large-line"></i>
          </button>
        </div>

        <div className="custom__modal-body">
          <div className="modal__content">
            <div className="container-fluid">
              <div className="row">{children}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Modal;
