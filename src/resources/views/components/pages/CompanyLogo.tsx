import { Link } from "react-router-dom";
import logo from "../../../assets/images/logo.png";
import textLogo from "../../../assets/images/logo_frey.png";

interface LogoProps {
  color?: "primary" | "secondary";
  text?: boolean;
}

const CompanyLogo = ({ color, text = false }: LogoProps) => {
  return (
    <>
      <div className="brand flex align gap-md">
        <Link to="/">
          <img
            src={logo}
            style={{
              width: 45,
              // margin: "0 auto",
            }}
            alt="The Logo of the Company"
          />
        </Link>
        {text && (
          <div className="logo__area">
            <img src={textLogo} alt="The Logo of the Company" />
          </div>
        )}
      </div>
      <small
        style={{ padding: "0 20px", letterSpacing: 2, display: "block" }}
        className="small-text"
      >
        Enterprise Staff Portal
      </small>
    </>
  );
};

export default CompanyLogo;
