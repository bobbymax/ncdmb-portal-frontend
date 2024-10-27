import { Link } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

interface LogoProps {
  color: "primary" | "secondary";
}

const CompanyLogo = ({ color }: LogoProps) => {
  return (
    <div className="brand flex align gap-lg">
      <Link to="/">
        <img
          src={logo}
          style={{
            width: 78,
          }}
          alt="The Logo of the Company"
        />
      </Link>
      <h1 className={`title ${color}`}>
        Nigerian Content Development
        <br /> &amp; Monitoring Board
        <span style={{ fontSize: 30 }}>.</span>
      </h1>
    </div>
  );
};

export default CompanyLogo;
