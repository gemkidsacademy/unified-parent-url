import React, { useState, useEffect } from "react";
import "./UsageDashboard.css";

const UsageDashboard = ({ onBack }) => {
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const response = await fetch("https://krishbackend-production-9603.up.railway.app/api/openai-usage"); // Backend endpoint for OpenAI API usage
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsageData(data);
      } catch (err) {
        console.error("Failed to fetch OpenAI API usage data:", err);
        setError("Failed to load OpenAI API usage data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  if (loading) return <div className="loading">Loading OpenAI API usage data...</div>;
  if (error) return <div className="error">{error}</div>;

  // Calculate total usage across all users
  const total = usageData.reduce((sum, item) => sum + item.amount_usd, 0);

  return (
    <div className="usage-dashboard">
          <button
      type="button"
      onClick={onBack}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        width: "fit-content",
        padding: "9px 16px",
        marginBottom: "20px",
        border: "1px solid #d6d9e8",
        borderRadius: "8px",
        background: "#ffffff",
        color: "#4f46e5",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
      }}
    >
      ← Back to Chatbot
    </button>

    <h1>OpenAI API Usage (Last 30 Days)</h1>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Amount (USD)</th>
          </tr>
        </thead>
        <tbody>
          {usageData.map((item, index) => (
            <tr key={index}>
              <td>{item.user}</td>
              <td>${item.amount_usd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total">
        <strong>Total OpenAI API Usage: ${total.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default UsageDashboard;
