import { useState } from "react";
import HomeworkBooking from "./HomeworkBooking";
import "./ParentDashboard.css";

function ParentDashboard({ parentData, onLogout }) {
  const [showHomeworkBooking, setShowHomeworkBooking] = useState(false);

  const student = parentData?.students?.[0];

  const studentName = student?.name || "Student";
  const email = parentData?.email || "";

  console.log("ParentDashboard showHomeworkBooking:", showHomeworkBooking);

  if (showHomeworkBooking) {
    return (
      <HomeworkBooking
        parentData={parentData}
        onBack={() => setShowHomeworkBooking(false)}
      />
    );
  }

  return (
    <div className="parent-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">

          <div className="academy-brand">
            <img
              src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
              alt="Gem Kids Academy"
              className="academy-logo"
            />
          </div>

          <div className="student-account">
            <div className="account-info">
              <strong>Hi, {studentName}!</strong>
              <span>{email}</span>
            </div>

            <button className="account-chevron" type="button">
             ⌄
            </button>

            <div className="header-divider"></div>

            <button
              type="button"
              className="logout-button"
              onClick={onLogout}
            >
              <span className="logout-icon">↪</span>
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* Main content */}
      <main className="dashboard-main">

        {/* Welcome */}
        <section className="dashboard-welcome">
          <div className="welcome-left">
            <span className="welcome-wave">👋</span>

            <div>
              <h1>Welcome back, {studentName}!</h1>
              <p>What would you like to do today?</p>
            </div>
          </div>

          <div className="welcome-star">☆</div>
        </section>

        {/* Tool cards */}
        <section className="tool-grid">

          {/* Gem AI */}
          <article className="tool-card chatbot-card">
            <div className="tool-image chatbot-image">
              🤖
            </div>

            <h2>Gem AI Chatbot</h2>

            <p>
              Ask questions, get help
              <br />
              with your concepts and
              <br />
              learning.
            </p>

            <button
              type="button"
              className="tool-button purple-button"
              onClick={() => {
                window.open(
                  `${window.location.origin}${window.location.pathname}?view=chatbot`,
                  "_blank"
                );
              }}
            >
              <span>Open Chatbot</span>
              <span>→</span>
            </button>
          </article>

          {/* Gamified Quiz */}
          <article className="tool-card quiz-card">
            <div className="tool-image quiz-image">
              🎮
            </div>

            <h2>Gamified Quiz</h2>

            <p>
              Practise concepts, earn
              <br />
              points and climb the
              <br />
              leaderboard.
            </p>

            <button
              type="button"
              className="tool-button green-button"
              onClick={() => {
                window.open(
                  `${window.location.origin}${window.location.pathname}?view=gamified-quiz`,
                  "_blank"
                );
              }}
            >
              <span>Start Quiz</span>
              <span>→</span>
            </button>
          </article>

          {/* Exam Module */}
          <article className="tool-card exam-card">
            <div className="tool-image exam-image">
              📋
            </div>

            <h2>Exam Module</h2>

            <p>
              Take your assigned exams
              <br />
              and view upcoming
              <br />
              assessments.
            </p>

            <button
              type="button"
              className="tool-button orange-button"
              onClick={() => {
                window.location.href = "https://exam.gemkidsacademy.com.au/";
              }}
            >
              <span>Open Exams</span>
              <span>→</span>
            </button>
          </article>

          {/* Homework */}
          <article className="tool-card homework-card">
            <div className="tool-image homework-image">
              📅
            </div>

            <h2>Homework Booking</h2>

            <p>
              Book your Homework
              <br />
              Support sessions with
              <br />
              our teachers.
            </p>

            <button
              type="button"
              className="tool-button blue-button"
              onClick={() => {
                console.log("BOOK SESSION CLICKED");
                setShowHomeworkBooking(true);
              }}
            >
              <span>Book Session</span>
              <span>→</span>
            </button>
          </article>

        </section>

        {/* Bottom message */}
        <section className="dashboard-message">
          <div className="message-icon">📣</div>

          <div>
            <strong>Keep learning, keep growing!</strong>
            <p>
              We're here to support your success every step of the way. 💜
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-inner">

          <div className="footer-left">
            <span>?</span>
            <span>Need help?</span>
            <a href="#contact">Contact Gem Kids Academy</a>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-privacy">
            <span>♢</span>
            <a href="#privacy">Terms & Privacy</a>
          </div>

        </div>
      </footer>
    </div>
  );
}

export default ParentDashboard;