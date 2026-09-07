import React, { useState } from "react";
import Dashboard from "./Dashboard";
import AcademicTerm from "./AcademicTerm/AcademicTerm";
import ClassConfiguration from "./ClassConfiguration/ClassConfiguration";



export default function AdminGamifiedQuiz({ interviewAdmin }) {
    const [activeSection, setActiveSection] = useState(null);
    if (activeSection === "academicTerm") {
        return (
            <AcademicTerm
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }
    if (activeSection === "classConfiguration") {
        return (
            <ClassConfiguration
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }

    if (activeSection === "dashboard") {
        return (
            <Dashboard
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }

    return (
        <section className="admin-overview-grid">
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("dashboard")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="3"
                            y="3"
                            width="7"
                            height="7"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <rect
                            x="14"
                            y="3"
                            width="7"
                            height="7"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <rect
                            x="3"
                            y="14"
                            width="7"
                            height="7"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <rect
                            x="14"
                            y="14"
                            width="7"
                            height="7"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Dashboard</h2>
                    <p>
                        View your Gamified Quiz configuration and scheduler status.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("academicTerm")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="3"
                            y="4"
                            width="18"
                            height="16"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <path
                            d="M7 2V6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M17 2V6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M3 9H21"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <path
                            d="M7 13H9"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M11 13H13"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M15 13H17"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Academic Term</h2>
                    <p>
                        Manage academic terms for the Gamified Quiz system.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("classConfiguration")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V5Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <path
                            d="M8 7H16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M8 11H16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M8 15H13"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Class Configuration</h2>
                    <p>
                        Configure and manage classes for the Gamified Quiz system.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
        </section>
    );
}