import React, { useEffect, useState } from "react";

function ChatbotLoginSettings({ onBack }) {
  const [loginMode, setLoginMode] = useState("otp_only");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const API_BASE = "https://krishbackend-production-9603.up.railway.app";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/chatbot-login-settings`);

        if (!res.ok) {
          throw new Error("Failed to fetch chatbot login settings");
        }

        const data = await res.json();
        setLoginMode(data.login_mode || "otp_only");
      } catch (err) {
        console.error(err);
        alert("Unable to load chatbot login settings.");
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/chatbot-login-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login_mode: loginMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to update login settings");
      }

      alert("Chatbot login settings updated successfully.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ padding: "20px" }}>Loading login settings...</div>;
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        background: "#fff",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,.1)",
      }}
    >
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 16px",
          marginBottom: "20px",
          border: "1px solid #d6d9e8",
          borderRadius: "8px",
          background: "#ffffff",
          color: "#4f46e5",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        ← Back to Chatbot
      </button>

      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: "25px",
        }}
      >
        Chatbot Login Settings
      </h2>

      <div style={{ marginTop: "20px" }}>
        <label htmlFor="loginMode">Login Mode:</label>

        <select
          id="loginMode"
          value={loginMode}
          onChange={(e) => setLoginMode(e.target.value)}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "14px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            fontSize: "16px",
            color: "#333",
            boxSizing: "border-box",
          }}
        >
          <option value="otp_only">OTP Login Only</option>
          <option value="id_only">ID Login Only</option>
          <option value="both">Both OTP and ID Login</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          marginTop: "25px",
          width: "100%",
          padding: "12px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>

      <p
        style={{
          marginTop: "10px",
          marginBottom: "20px",
          padding: "12px",
          backgroundColor: "#fff8e1",
          border: "1px solid #f0c36d",
          borderRadius: "6px",
          color: "#8a6d3b",
          fontSize: "14px",
        }}
      >
        <strong>Note:</strong> This controls which login options are shown on the chatbot login screen.
      </p>
    </div>
  );
}

export default ChatbotLoginSettings;