import { useState } from "react";
import HomeworkBooking from "./HomeworkBooking";
import ParentTeacherInterviews from "./ParentTeacherInterviews";
import "./ParentDashboard.css";

function ParentDashboard({ parentData, onLogout }) {
  const [showHomeworkBooking, setShowHomeworkBooking] = useState(false);
  const [showParentTeacherInterviews, setShowParentTeacherInterviews] =
    useState(false);

  const student = parentData?.student;
  console.log("PARENT DASHBOARD parentData:", parentData);
console.log("PARENT DASHBOARD student:", student);
  const studentName = student?.name || "Student";
  const email = student?.parent_email || "";

  console.log("ParentDashboard showHomeworkBooking:", showHomeworkBooking);

  if (showHomeworkBooking) {
    return (
      <HomeworkBooking
        parentData={parentData}
        onBack={() => setShowHomeworkBooking(false)}
      />
    );
  }

  if (showParentTeacherInterviews) {
    return (
      <ParentTeacherInterviews
        parentData={parentData}
        onBack={() => setShowParentTeacherInterviews(false)}
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

            <div className="header-divider"></div>

            <button
              type="button"
              className="logout-button"
              onClick={onLogout}
              aria-label="Logout"
            >
              <span className="logout-icon">↪</span>
              <span className="logout-label">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main content */}
      <main
        className="dashboard-main"
        style={{
          width: "100%",
          height: "100dvh",
          maxHeight: "100dvh",
          overflowY: "scroll",
          overflowX: "hidden",
          boxSizing: "border-box",
          flex: "1 1 auto",
          minHeight: 0,
          scrollbarWidth: "auto",
          scrollbarColor: "#666 #e5e7eb",
        }}
      >

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
                window.open("https://exam.gemkidsacademy.com.au/", "_blank", "noopener,noreferrer");
              }}
            >
              <span>Open Exams</span>
              <span>→</span>
            </button>
          </article>

          {/* Homework */}
          <article className="tool-card homework-card">
            <div className="tool-image homework-image">
              <svg
                viewBox="0 0 64 64"
                width="78"
                height="78"
                aria-hidden="true"
              >
                <rect
                  x="10"
                  y="14"
                  width="44"
                  height="42"
                  rx="6"
                  fill="#ffffff"
                  stroke="#176fd4"
                  strokeWidth="3"
                />
                <rect
                  x="10"
                  y="14"
                  width="44"
                  height="12"
                  rx="6"
                  fill="#176fd4"
                />
                <line
                  x1="21"
                  y1="9"
                  x2="21"
                  y2="19"
                  stroke="#176fd4"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <line
                  x1="43"
                  y1="9"
                  x2="43"
                  y2="19"
                  stroke="#176fd4"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="22" cy="35" r="3" fill="#176fd4" />
                <circle cx="32" cy="35" r="3" fill="#176fd4" />
                <circle cx="42" cy="35" r="3" fill="#176fd4" />
                <circle cx="22" cy="45" r="3" fill="#176fd4" />
                <circle cx="32" cy="45" r="3" fill="#176fd4" />
                <circle cx="42" cy="45" r="3" fill="#176fd4" />
              </svg>
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

          {/* Parent–Teacher Interviews */}
          <article className="tool-card parent-teacher-card">
            <div className="tool-image parent-teacher-image">
              👩‍🏫
            </div>

            <h2>Parent–Teacher Interviews</h2>

            <p>
              Book a convenient time
              <br />
              to meet your child's teacher
              <br />
              for the upcoming interview.
            </p>

            <button
              type="button"
              className="tool-button parent-teacher-button"
              onClick={() => {
                console.log("PARENT-TEACHER INTERVIEW CLICKED");
                setShowParentTeacherInterviews(true);
              }}
            >
              <span>Book Interview</span>
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