import { ProtectedProps } from "./Protected";

const Guest = ({ children }: ProtectedProps) => {
  return (
    <>
      <div className="login-bg"></div>
      <div
        className="login-form flex align"
        style={{ justifyContent: "center" }}
      >
        {children}
      </div>
    </>
  );
};

export default Guest;
