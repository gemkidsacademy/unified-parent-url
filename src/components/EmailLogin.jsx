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
        const response = await fetch(`${API_BASE_URL}/send-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: trimmedEmail,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setError(
            data?.detail || "Unable to send OTP. Please try again."
          );
          return;
        }

        setOtpSent(true);
        setError("");

        console.log("OTP sent:", data);
      } catch {
        setError("Unable to connect to the server. Please try again.");
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
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          otp: trimmedOtp,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.detail || "Invalid OTP. Please try again.");
        return;
      }

      console.log("OTP verified:", data);

      onLoginSuccess({
        ...data,
        email: trimmedEmail,
      });
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="email-login-page">
      <header className="topbar">
        <div className="brand-mark" aria-label="Gem Kids Academy logo">
          <img
            src="/images/academy-logo.png"
            alt="Gem Kids Academy"
            className="brand-logo"
          />
        </div>
      </header>

      <div className="login-shell">
        <section className="welcome-panel">
          <p className="eyebrow">Welcome to</p>
          <h1 className="hero-title">
            <span className="gradient-text">Gem AI</span>
          </h1>
          <p className="hero-subtitle">
            All your Gem Kids learning tools
            <br />
            in <span className="accent">one smart place.</span>
          </p>

          <div className="email-login-card">
            <div className="email-icon-wrapper">
              <svg className="email-icon" viewBox="0 0 24 24" fill="none">
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

            <h2>Enter your registered email</h2>

            <p className="login-description">
              We'll use this to give you access to
              <br />
              all your learning tools.
            </p>

            <form onSubmit={handleContinue} className="login-form">
              <label htmlFor="email">Registered Email Address</label>

              <div className="email-input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none">
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
                <span>
                  {isLoading
                    ? otpSent
                      ? "Verifying..."
                      : "Sending OTP..."
                    : otpSent
                      ? "Login"
                      : "Generate OTP"}
                </span>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </form>
          </div>
        </section>

        <aside className="visual-panel" aria-label="Gem AI illustration panel">
          <div className="visual-backdrop" aria-hidden="true" />
          <img
            src="/images/gem-ai-home.png"
            alt="Gem AI student illustration"
            className="gem-ai-image"
          />
        </aside>
      </div>

      <div className="feature-strip">
        <div className="feature-item">
          <div className="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3.5 5.2 7v5.1c0 3.2 2.1 6.1 4.9 7.7 2.8-1.6 4.9-4.5 4.9-7.7V7L12 3.5Zm0 0v5.3m0 0L16.6 5.8m-4.6 3.1L7.4 5.8"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="feature-copy">
            <strong>Secure &amp; Private</strong>
            <span>Your data is safe with us.</span>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M3.5 9.5A8.5 8.5 0 0 1 20.5 9.5c0 6.2-4.7 9.9-8.5 11.5-3.8-1.6-8.5-5.3-8.5-11.5Zm8.5 2.2h.1m-4.7 3.5 4.6-4.6 2.3 2.3 4.8-4.8"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="feature-copy">
            <strong>Global Presence</strong>
            <span>Proudly empowering students in Australia 🇦🇺 and USA 🇺🇸</span>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 18.5V9.8m7 8.7V5.5m7 13V11.3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M3.5 18.5h17"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="feature-copy">
            <strong>Built for Learning</strong>
            <span>Designed to support learning and growth.</span>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-left">
          <span>Need help?</span>
          <a href="mailto:hello@gemkidsacademy.com.au">Contact Gem Kids Academy</a>
        </div>

        <div className="footer-right">
          © 2024 Gem Kids Academy. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

export default EmailLogin;