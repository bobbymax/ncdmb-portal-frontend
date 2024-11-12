import Swal from "sweetalert2";

const flash = (title: string, status: any, mssg: string) => {
  const warning = Swal.fire({
    icon: status,
    title: title,
    text: mssg,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes! Confirm",
  });

  return warning;
};

const success = (title: string, mssg: string) => {
  Swal.fire({
    icon: "success",
    title: title,
    text: mssg,
    timer: 3000,
  });
};

const warning = (title: string, mssg: string) => {
  Swal.fire({
    icon: "warning",
    title: title,
    text: mssg,
    timer: 3000,
  });
};

const error = (title: string, mssg: string) => {
  Swal.fire({
    icon: "error",
    title: title,
    text: mssg,
    timer: 3000,
  });
};

const conditional = () => {
  flash("Are you sure?", "warning", "You will not be able to reverse this!!");
};

const Alert = {
  flash,
  success,
  warning,
  error,
  conditional,
};

export default Alert;
