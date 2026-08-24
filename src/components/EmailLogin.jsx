import { useState } from "react";

import "./EmailLogin.css";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
function EmailLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

    const handleContinue = async (event) => {
      event.preventDefault();

      if (isLoading) {
        return;
      }

      const trimmedEmail = email.trim();

      if (!trimmedEmail) {
        setError("Please enter your registered email.");
        return;
      }

      if (!otpSent) {
        setError("");
        setIsLoading(true);

        try {
          const response = await fetch(
            `${API_BASE_URL}/send-otp`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: trimmedEmail,
              }),
            },
          );

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            setError(
              data?.detail ||
              "Unable to send OTP. Please try again."
            );
            return;
          }

          setOtpSent(true);
          setError("");

          console.log("OTP sent:", data);
        } catch {
          setError(
            "Unable to connect to the server. Please try again."
          );
        } finally {
          setIsLoading(false);
        }

        return;
      }

      const trimmedOtp = otp.trim();

      if (!trimmedOtp) {
        setError("Please enter the OTP.");
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/verify-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: trimmedEmail,
              otp: trimmedOtp,
            }),
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setError(
            data?.detail ||
            "Invalid OTP. Please try again."
          );
          return;
        }

        console.log("OTP verified:", data);

        onLoginSuccess({
          ...data,
          email: trimmedEmail,
        });
      } catch {
        setError(
          "Unable to connect to the server. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <main className="email-login-page">

      {/* Gem AI illustration */}
      <img
        src="/images/gem-ai-home.png"
        alt="Gem Kids Academy"
        className="gem-ai-image"
      />

      {/* Email login card */}
      <div className="email-login-card">

        <div className="email-icon-wrapper">
          <svg
            className="email-icon"
            viewBox="0 0 24 24"
            fill="none"
          >
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M4 7L12 13L20 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1>Enter your registered email</h1>

        <p className="login-description">
          We'll use this to give you access to
          <br />
          all your learning tools.
        </p>

        <form onSubmit={handleContinue}>

          <label htmlFor="email">
            Registered Email Address
          </label>

          <div className="email-input-wrapper">

            <svg
              className="input-icon"
              viewBox="0 0 24 24"
              fill="none"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.7"
              />

              <path
                d="M4 7L12 13L20 7"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@example.com"
              autoComplete="email"
            />

          </div>

          {otpSent && (
            <div className="otp-input-wrapper">
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter OTP"
                autoComplete="one-time-code"
              />
            </div>
          )}

          {error && (
            <p className="email-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="continue-button"
            disabled={isLoading}
          >
              <span>{isLoading
                ? otpSent
                  ? "Verifying..."
                  : "Sending OTP..."
                : otpSent
                  ? "Login"
                  : "Generate OTP"}</span>
            <span className="arrow">→</span>
          </button>

        </form>

      </div>

    </main>
  );
}

export default EmailLogin;