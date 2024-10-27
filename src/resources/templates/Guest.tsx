import { ProtectedProps } from "./Protected";

const Guest = ({ children }: ProtectedProps) => {
  return (
    <>
      <div id="login-wrapper">
        <div className="login-bg"></div>
        <div
          className="login-form flex align"
          style={{ justifyContent: "center" }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default Guest;
