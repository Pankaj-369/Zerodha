import React from "react";

function Footer() {
  const linkStyle = {
    color: "#007bff",
    textDecoration: "none",
    lineHeight: "2",
    fontSize: "15px",
  };

  const sectionHeading = {
    fontWeight: "500",
    marginBottom: "10px",
    fontSize: "16px",
  };

  return (
    <div className="container border-top pt-5 mt-5">
      <div className="row text-start">
        <div className="col-md-3 mb-4">
          <img
            src="/media/images/logo.svg"
            alt="Zerodha logo"
            style={{ width: "55%", marginBottom: "10px" }}
          />
          <p className="text-muted" style={{ fontSize: "14px" }}>
            © 2010 - 2025, Zerodha Broking Ltd. <br />
            All rights reserved.
          </p>
        </div>

        {/* Account */}
        <div className="col-md-3 mb-4">
          <p style={sectionHeading}>Account</p>
          {[
            "Open demat account",
            "Minor demat account",
            "NRI demat account",
            "Commodity",
            "Dematerialisation",
            "Fund transfer",
            "MTF",
            "Referral program",
          ].map((item, idx) => (
            <div key={idx}>
              <a href="#" style={linkStyle}>
                {item}
              </a>
            </div>
          ))}
        </div>

        {/* Support */}
        <div className="col-md-3 mb-4">
          <p style={sectionHeading}>Support</p>
          {[
            "Contact us",
            "Support portal",
            "How to file a complaint?",
            "Status of your complaints",
            "Bulletin",
            "Circular",
            "Z-Connect blog",
            "Downloads",
          ].map((item, idx) => (
            <div key={idx}>
              <a href="#" style={linkStyle}>
                {item}
              </a>
            </div>
          ))}
        </div>

        {/* Company */}
        <div className="col-md-3 mb-4">
          <p style={sectionHeading}>Company</p>
          {[
            "About",
            "Philosophy",
            "Press & media",
            "Careers",
            "Zerodha Cares (CSR)",
            "Zerodha.tech",
            "Open source",
          ].map((item, idx) => (
            <div key={idx}>
              <a href="#" style={linkStyle}>
                {item}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Legal & disclaimer section */}
      <div
        className="text-muted mt-5"
        style={{
          fontSize: "13px",
          lineHeight: "1.8",
          maxWidth: "100%",
        }}
      >
        <p>
          Zerodha Broking Ltd.: Member of NSE, BSE & MCX – SEBI Registration
          no.: INZ000031633 CDSL/NSDL: Depository services through Zerodha
          Broking Ltd. – SEBI Registration no.: IN-DP-431-2019 Commodity Trading
          through Zerodha Commodities Pvt. Ltd. MCX: 46025; NSE-50001 – SEBI
          Registration no.: INZ000038238 Registered Address: Zerodha Broking
          Ltd., #153/154, 4th Cross, Dollars Colony, Opp. Clarence Public
          School, J.P Nagar 4th Phase, Bengaluru - 560078, Karnataka, India. For
          any complaints pertaining to securities broking, please write to{" "}
          <a href="mailto:complaints@zerodha.com">complaints@zerodha.com</a>, or
          for DP related queries to{" "}
          <a href="mailto:dp@zerodha.com">dp@zerodha.com</a>.
        </p>
        <p>
          Procedure to file a complaint on SEBI SCORES: Register on SCORES
          portal. Mandatory details: Name, PAN, Address, Mobile Number, Email.
        </p>
        <p>
          Investments in securities market are subject to market risks. Please
          read all related documents carefully before investing.
        </p>
        <p>
          Attention investors: Stock brokers can accept securities as margins
          only via pledge. Update your mobile/email with your broker to receive
          OTPs for pledge confirmation. Review holdings in your CDSL/NSDL
          account regularly.
        </p>
        <p>
          Prevent unauthorized transactions in your account. Get mobile/email
          updates from your broker. KYC is one-time – once done, no need to
          repeat with new intermediaries. For IPOs, bank mandates are used.
        </p>
      </div>

      {/* Links below */}
      <div className="text-center mt-4 mb-4">
        {[
          "NSE",
          "BSE",
          "MCX",
          "Terms & conditions",
          "Policies & procedures",
          "Privacy policy",
          "Disclaimer",
        ].map((item, idx) => (
          <a
            key={idx}
            href="#"
            style={{
              marginRight: "15px",
              color: "#007bff",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}

export default Footer;
