import React, { ReactNode, useEffect } from "react";

export interface ModalProps {
  title: string;
  close: () => void;
  show: boolean;
  size: "sm" | "md" | "lg";
  children: ReactNode;
}

const Modal = ({ title, close, show, size, children }: ModalProps) => {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && show) {
        close();
      }
    };

    if (show) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [show, close]);

  if (!show) return null;

  return (
    <div className="modal__overlay" onClick={close}>
      <div
        className={`modal__container modal__container--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__backdrop">
          <div className="modal__backdrop__pattern"></div>
        </div>

        <div className="modal__content">
          <div className="modal__header">
            <div className="modal__title__container">
              <h3 className="modal__title">{title}</h3>
              <div className="modal__title__accent"></div>
            </div>
            <button
              type="button"
              className="modal__close__btn"
              onClick={close}
              aria-label="Close modal"
            >
              <div className="modal__close__icon">
                <span></span>
                <span></span>
              </div>
            </button>
          </div>

          <div className="modal__body">
            <div className="modal__body__content">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
