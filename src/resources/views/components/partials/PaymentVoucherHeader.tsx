import logo from "../../../assets/images/logo.png";

const PaymentVoucherHeader = ({ code }: { code: string }) => {
  return (
    <div className="voucher__header flex align between mb-4">
      <div className="brand__logo__area flex align gap-md">
        <div className="logo_img">
          <img src={logo} alt="Logo NCDMB" />
        </div>
        <div className="title__area flex column gap-sm">
          <h3>Nigerian Content Development Fund (NCDF)</h3>
          <small>Payment Voucher</small>
        </div>
      </div>
      <div className="code__details__area flex column end align-end">
        <small>{code}</small>
        <span>Database Code: NDF</span>
      </div>
    </div>
  );
};

export default PaymentVoucherHeader;
