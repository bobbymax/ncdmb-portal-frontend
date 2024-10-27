import "../assets/css/app.css";
import Barchart from "./components/charts/BarChart";

const Dashboard = () => {
  const options = {
    labels: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    datasets: [
      {
        label: "Weekly Transactions",
        data: [2000000, 4500000, 8000000, 9328299, 7849211, 2009122, 6372811],
        backgroundColor: ["#4c934c"],
        borderColor: ["#4c934c"],
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="row">
      <div className="col-md-12 mt-3 mb-4">
        <h3
          style={{
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Dashboard
        </h3>
      </div>
      <div className="col-md-8">
        <div className="custom-glass-card">
          <Barchart details={options} />
        </div>
      </div>
      <div className="col-md-4">
        <div className="custom-glass-card summary flex column gap-lg">
          <h5>Summary</h5>

          <div className="summary-item flex align gap-md">
            <i className="ri-group-2-fill" />
            <div className="details">
              <h1>10</h1>
              <small>Registered Users</small>
            </div>
          </div>

          <div className="summary-item flex align gap-md">
            <i className="ri-secure-payment-fill" />
            <div className="details">
              <h1>1230</h1>
              <small>Total Payments</small>
            </div>
          </div>

          <div className="summary-item flex align gap-md">
            <i className="ri-wallet-3-fill" />
            <div className="details">
              <h1>23,392,192.18</h1>
              <small>Total Posted Amount</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
