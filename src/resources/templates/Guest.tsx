import { ProtectedProps } from "./Protected";

const Guest = ({ children }: ProtectedProps) => {
  return <div className="login-form">{children}</div>;
};

export default Guest;
