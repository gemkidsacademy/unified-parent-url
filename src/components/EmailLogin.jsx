import { useState } from "react";
import "./EmailLogin.css";

function EmailLogin() {
  const [email, setEmail] = useState("");

  const handleContinue = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    console.log("Registered email:", email);
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

          <button
            type="submit"
            className="continue-button"
          >
            <span>Continue</span>
            <span className="arrow">→</span>
          </button>

        </form>

      </div>

    </main>
  );
}

export default EmailLogin;