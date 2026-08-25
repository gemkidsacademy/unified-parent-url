import { useState } from "react";
import { API_BASE_URL } from "../config/api";
import "./InterviewAdminLogin.css";

function InterviewAdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/interview-booking/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);
      const interviewAdmin = data?.interview_admin || data;

      if (!response.ok) {
        setError(data?.detail || "Unable to log in. Please check your details.");
        return;
      }

      if (interviewAdmin?.role !== "CENTER_ADMIN") {
        setError("Only center administrators can access this page.");
        return;
      }

      localStorage.setItem("interviewAdminData", JSON.stringify(interviewAdmin));
      onLoginSuccess(interviewAdmin);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="interview-admin-login-page">
      <section className="interview-admin-login-card">
        <div className="interview-admin-login-brand">
          <img
            src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
            alt="Gem Kids Academy"
          />
        </div>

        <p className="interview-admin-login-eyebrow">Admin workspace</p>
        <h1>Parent–Teacher Interview Admin</h1>
        <p className="interview-admin-login-description">
          Sign in to manage interview events and teacher availability.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="interview-admin-login-error" role="alert">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default InterviewAdminLogin;
