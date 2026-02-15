import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { formatUSD } from "../utils/formatters";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const StockAnalytics = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState("1d");
  const [range, setRange] = useState("1mo");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${backendUrl}/history/${symbol}?range=${range}&interval=${interval}`)
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Chart data fetch failed", err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [symbol, range, interval]);

  return (
    <div
      style={{
        maxWidth: 720,
        marginLeft: "62px ",
        padding: 24,
        borderRadius: 14,
        boxShadow: "0 2px 12px #0001",
        background: "#fafbfc",
        minHeight: 540,
      }}
    >
      <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        Back
      </button>

      <span style={{ marginLeft: "26px", marginBottom: 18 }}>
        <select value={interval} onChange={(e) => setInterval(e.target.value)}>
          <option value="1d">Daily</option>
          <option value="1mo">Monthly</option>
        </select>
        <select value={range} onChange={(e) => setRange(e.target.value)} style={{ marginLeft: 8 }}>
          <option value="1mo">1 Month</option>
          <option value="6mo">6 Months</option>
          <option value="1y">1 Year</option>
        </select>
      </span>
      <h2>{symbol} Price Chart</h2>
      {loading && <p>Loading chart...</p>}
      {!loading && data.length === 0 && (
        <p style={{ color: "#666", marginBottom: 12 }}>
          No historical candles available for this symbol right now.
        </p>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            dataKey="close"
            domain={["auto", "auto"]}
            tickFormatter={(val) => formatUSD(val)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value) => formatUSD(parseFloat(value))} />
          <CartesianGrid stroke="#eee" />
          <Line type="monotone" dataKey="close" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockAnalytics;
