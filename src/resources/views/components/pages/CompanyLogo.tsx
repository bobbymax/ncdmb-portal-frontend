import { Link } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

interface LogoProps {
  color: "primary" | "secondary";
  text: boolean;
}

const CompanyLogo = ({ color, text = false }: LogoProps) => {
  return (
    <div className="brand flex align gap-md">
      <Link to="/">
        <img
          src={logo}
          style={{
            width: 60,
          }}
          alt="The Logo of the Company"
        />
      </Link>
      {text && (
        <div className="flex column">
          <h1
            className={`title ${color}`}
            style={{
              flexGrow: 1,
            }}
          >
            Nigerian Content <br />
            Development &amp; Monitoring Board
          </h1>
          <small className="small-text">Enterprise Staff Portal</small>
        </div>
      )}
    </div>
  );
};

export default CompanyLogo;
