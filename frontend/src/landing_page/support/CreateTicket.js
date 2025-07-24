import React from "react";

function CreateTicket() {
  const headingStyle = {
    fontWeight: "500",
    fontSize: "1.1rem",
    marginBottom: "10px",
  };

  const iconStyle = {
    color: "#6c757d", // Bootstrap gray-600
    marginRight: "8px",
  };

  const linkStyle = {
    textDecoration: "none",
    lineHeight: "2",
    color: "#007bff",
    display: "block",
  };

  return (
    <div className="container my-5">
      <h1 className="fs-3 text-center mb-5">
        To create a ticket, select a relevant topic
      </h1>

      <div className="row text-start">
        {/* Column 1 */}
        <div className="col-md-4 mb-4">
          <h5 style={headingStyle}>
            <i className="fa fa-plus-circle" style={iconStyle}></i>
            Account Opening
          </h5>
          <a href="#" style={linkStyle}>Resident individual</a>
          <a href="#" style={linkStyle}>Minor</a>
          <a href="#" style={linkStyle}>Non Resident Indian (NRI)</a>
          <a href="#" style={linkStyle}>Company, Partnership, HUF and LLP</a>
          <a href="#" style={linkStyle}>Glossary</a>
        </div>

        {/* Column 2 */}
        <div className="col-md-4 mb-4">
          <h5 style={headingStyle}>
            <i className="fa-solid fa-user" style={iconStyle}></i>
            Your Zerodha Account
          </h5>
          <a href="#" style={linkStyle}>Your Profile</a>
          <a href="#" style={linkStyle}>Account modification</a>
          <a href="#" style={linkStyle}>Client Master Report (CMR) and DP</a>
          <a href="#" style={linkStyle}>Nomination</a>
          <a href="#" style={linkStyle}>Transfer and conversion of securities</a>
        </div>

        {/* Column 3 */}
        <div className="col-md-4 mb-4">
          <h5 style={headingStyle}>
            <i className="fa-solid fa-chart-simple" style={iconStyle}></i>
            Kite
          </h5>
          <a href="#" style={linkStyle}>IPO</a>
          <a href="#" style={linkStyle}>Trading FAQs</a>
          <a href="#" style={linkStyle}>Margin Trading Facility (MTF) and Margins</a>
          <a href="#" style={linkStyle}>Charts and orders</a>
          <a href="#" style={linkStyle}>Alerts and Nudges</a>
          <a href="#" style={linkStyle}>General</a>
        </div>

        {/* Column 4 */}
        <div className="col-md-4 mb-4">
          <h5 style={headingStyle}>
            <i className="fa-solid fa-money-check" style={iconStyle}></i>
            Funds
          </h5>
          <a href="#" style={linkStyle}>Add money</a>
          <a href="#" style={linkStyle}>Withdraw money</a>
          <a href="#" style={linkStyle}>Add bank accounts</a>
          <a href="#" style={linkStyle}>eMandates</a>
        </div>

        {/* Column 5 */}
        <div className="col-md-4 mb-4">
          <h5 style={headingStyle}>
            <i className="fa-regular fa-floppy-disk" style={iconStyle}></i>
            Console
          </h5>
          <a href="#" style={linkStyle}>Portfolio</a>
          <a href="#" style={linkStyle}>Corporate actions</a>
          <a href="#" style={linkStyle}>Funds statement</a>
          <a href="#" style={linkStyle}>Reports</a>
          <a href="#" style={linkStyle}>Segments</a>
        </div>

        {/* Column 6 */}
        <div className="col-md-4 mb-4">
          <h5 style={headingStyle}>
            <i className="fa-solid fa-coins" style={iconStyle}></i>
            Coin
          </h5>
          <a href="#" style={linkStyle}>Mutual funds</a>
          <a href="#" style={linkStyle}>National Pension Scheme (NPS)</a>
          <a href="#" style={linkStyle}>Fixed Deposit (FD)</a>
          <a href="#" style={linkStyle}>Payments and Orders</a>
          <a href="#" style={linkStyle}>General</a>
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;
