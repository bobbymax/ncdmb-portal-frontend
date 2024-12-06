import { FormPageComponentProps } from "bootstrap";
import { UserResponseData } from "app/Repositories/User/data";

const User: React.FC<FormPageComponentProps<UserResponseData>> = ({
  state,
  handleChange,
  mode,
  loading,
  error,
}) => {
  return <h1>User</h1>;
};

export default User;
