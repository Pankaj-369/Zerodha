import React, { useEffect, useState } from "react";
import Menu from "./Menu";
const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const DEFAULT_INDEX = { value: 0, change: 0 };

export default function TopBar() {
  const [nifty, setNifty] = useState(DEFAULT_INDEX);
  const [sensex, setSensex] = useState(DEFAULT_INDEX);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${backendUrl}/indices`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to fetch indices");
        }

        setNifty(data?.nifty || DEFAULT_INDEX);
        setSensex(data?.sensex || DEFAULT_INDEX);
      } catch (err) {
        console.error("Frontend Fetch Error:", err);
        setNifty(DEFAULT_INDEX);
        setSensex(DEFAULT_INDEX);
      }
    };

    fetchData();
  }, []);

  const renderIndex = (name, data = DEFAULT_INDEX) => {
    const safeChange = Number.isFinite(data?.change) ? data.change : 0;
    const safeValue = Number.isFinite(data?.value) ? data.value : 0;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontWeight: "500", fontSize: "14px", marginRight: "4px", color: "#666" }}>{name}</span>
        <span style={{ marginRight: "4px", fontSize: "16px", color: safeChange >= 0 ? "green" : "red" }}>{safeValue.toFixed(2)}</span>
        <span style={{ color: safeChange >= 0 ? "green" : "red", fontSize: "12px" }}>
          {safeChange >= 0 ? "+" : "-"} {Math.abs(safeChange).toFixed(2)}%
        </span>
      </div>
    );
  };

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
