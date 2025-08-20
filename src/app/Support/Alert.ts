import Swal from "sweetalert2";

const flash = (title: string, status: any, mssg: string) => {
  const warning = Swal.fire({
    icon: status,
    title: title,
    text: mssg,
    showCancelButton: true,
    confirmButtonColor: "#4caf50",
    cancelButtonColor: "#f44336",
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "custom-alert-popup",
      title: "custom-alert-title",
      htmlContainer: "custom-alert-content",
      confirmButton: "custom-alert-confirm-btn",
      cancelButton: "custom-alert-cancel-btn",
      icon: "custom-alert-icon",
    },
    buttonsStyling: false,
    showClass: {
      popup: "animate__animated animate__fadeInDown animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp animate__faster",
    },
  });

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
