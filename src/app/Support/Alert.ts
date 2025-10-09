import Swal from "sweetalert2";

const flash = (title: string, status: any, mssg: string) => {
  const warning = Swal.fire({
    icon: status,
    title: title,
    text: mssg,
    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    backdrop: `
      rgba(0, 0, 0, 0.4)
      left top
      no-repeat
    `,
    customClass: {
      popup: "flushed-alert-popup",
      title: "flushed-alert-title",
      htmlContainer: "flushed-alert-content",
      confirmButton: "flushed-alert-confirm-btn",
      cancelButton: "flushed-alert-cancel-btn",
      icon: "flushed-alert-icon",
      actions: "flushed-alert-actions",
    },
    buttonsStyling: false,
    showClass: {
      popup: "animate__animated animate__fadeInDown animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp animate__faster",
    },
  });

  // Add custom styles for flushed collection design - completely override SweetAlert2 defaults
  const style = document.createElement("style");
  style.textContent = `
    /* Remove any conflicting styles and override SweetAlert2 defaults */
    .flushed-alert-popup {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%) !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 12px !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
      padding: 2rem !important;
      max-width: 400px !important;
      font-family: inherit !important;
    }
    
    .flushed-alert-popup .swal2-header {
      margin-bottom: 1.5rem !important;
      padding: 0 !important;
    }
    
    .flushed-alert-title {
      color: #1e293b !important;
      font-weight: 600 !important;
      font-size: 1.25rem !important;
      margin: 0 0 0.5rem 0 !important;
      padding: 0 !important;
      line-height: 1.4 !important;
    }
    
    .flushed-alert-content {
      color: #64748b !important;
      font-size: 0.875rem !important;
      line-height: 1.5 !important;
      font-weight: 400 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .flushed-alert-actions {
      display: flex !important;
      gap: 0.75rem !important;
      margin-top: 2rem !important;
      justify-content: center !important;
      align-items: center !important;
    }
    
    .flushed-alert-confirm-btn,
    .flushed-alert-cancel-btn {
      background: #059669 !important;
      border: 1px solid #059669 !important;
      color: white !important;
      font-weight: 500 !important;
      font-size: 0.875rem !important;
      padding: 0.75rem 1.5rem !important;
      border-radius: 8px !important;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
      min-width: 80px !important;
      text-align: center !important;
      outline: none !important;
      text-decoration: none !important;
    }
    
    .flushed-alert-confirm-btn:hover {
      background: #047857 !important;
      border-color: #047857 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
    }
    
    .flushed-alert-cancel-btn {
      background: #6b7280 !important;
      border: 1px solid #6b7280 !important;
    }
    
    .flushed-alert-cancel-btn:hover {
      background: #4b5563 !important;
      border-color: #4b5563 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
    }
    
    .flushed-alert-icon {
      color: #059669 !important;
      margin-bottom: 1rem !important;
    }
    
    /* Override SweetAlert2 icon positioning and centering */
    .flushed-alert-popup .swal2-icon {
      margin: 0 auto 1rem auto !important;
      display: block !important;
      text-align: center !important;
    }
    
    .flushed-alert-popup .swal2-icon.swal2-warning,
    .flushed-alert-popup .swal2-icon.swal2-info,
    .flushed-alert-popup .swal2-icon.swal2-question,
    .flushed-alert-popup .swal2-icon.swal2-success,
    .flushed-alert-popup .swal2-icon.swal2-error {
      margin: 0 auto 1rem auto !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    /* Ensure no green borders or conflicting styles */
    .flushed-alert-popup * {
      border-color: inherit !important;
    }
    
    /* Remove any default SweetAlert2 styling conflicts */
    .flushed-alert-popup .swal2-styled {
      background: inherit !important;
      color: inherit !important;
      border: inherit !important;
    }
  `;
  document.head.appendChild(style);

  return warning;
};

const success = (title: string, mssg: string) => {
  Swal.fire({
    icon: "success",
    title: title,
    text: mssg,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: "custom-alert-popup custom-alert-success",
      title: "custom-alert-title",
      htmlContainer: "custom-alert-content",
      icon: "custom-alert-icon",
    },
    buttonsStyling: false,
    showClass: {
      popup: "animate__animated animate__fadeInRight animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutRight animate__faster",
    },
  });
};

const warning = (title: string, mssg: string) => {
  Swal.fire({
    icon: "warning",
    title: title,
    text: mssg,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: "custom-alert-popup custom-alert-warning",
      title: "custom-alert-title",
      htmlContainer: "custom-alert-content",
      icon: "custom-alert-icon",
    },
    buttonsStyling: false,
    showClass: {
      popup: "animate__animated animate__fadeInRight animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutRight animate__faster",
    },
  });
};

const error = (title: string, mssg: string) => {
  Swal.fire({
    icon: "error",
    title: title,
    text: mssg,
    timer: 4000,
    timerProgressBar: true,
    customClass: {
      popup: "custom-alert-popup custom-alert-error",
      title: "custom-alert-title",
      htmlContainer: "custom-alert-content",
      icon: "custom-alert-icon",
    },
    buttonsStyling: false,
    showClass: {
      popup: "animate__animated animate__shakeX animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutRight animate__faster",
    },
  });
};

const conditional = () => {
  flash(
    "Are you sure?",
    "warning",
    "You will not be able to reverse this action!"
  );
};

const Alert = {
  flash,
  success,
  warning,
  error,
  conditional,
};

export default Alert;
