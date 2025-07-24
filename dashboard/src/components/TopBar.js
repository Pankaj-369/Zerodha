import React, { useEffect, useState } from "react";
import Menu from "./Menu";
const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

export default function TopBar() {
  const [nifty, setNifty] = useState({ value: 0, change: 0 });
  const [sensex, setSensex] = useState({ value: 0, change: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${backendUrl}/indices`);
        const data = await res.json();
        setNifty(data.nifty);
        setSensex(data.sensex);
      } catch (err) {
        console.error("Frontend Fetch Error:", err);
      }
    };
    fetchData();
  }, []);

  const renderIndex = (name, data) => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{fontWeight:"500", fontSize: "14px",marginRight:"4px", color: "#666" }}>{name}</span>
      <span style={{marginRight:"4px", fontSize: "16px",color: data.change >= 0 ? "green" : "red" }}>{data.value?.toFixed(2)}</span>
      <span style={{ color: data.change >= 0 ? "green" : "red", fontSize: "12px" }}>
        {data.change >= 0 ? "▲" : "▼"} {Math.abs(data.change).toFixed(2)}%
      </span>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 20px",
        backgroundColor: "#fff",
        borderBottom: "2px solid #e0e0e0",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", gap: "40px" }}>
        {renderIndex("NIFTY 50", nifty)}
        {renderIndex("SENSEX", sensex)}
      </div>
      <Menu />
    </div>
  );
}
