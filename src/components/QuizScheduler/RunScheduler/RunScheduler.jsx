import React, { useEffect, useState } from "react";
import "./RunScheduler.css";

export default function RunScheduler({ onBack }) {
    const [isRunning, setIsRunning] = useState(false);
    const [runDate, setRunDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [selectedDay, setSelectedDay] = useState("");
    const scheduler = {

        enabled: true,

        lastRun: "27 Jun 2026 06:00 PM",

        nextRun: "29 Jun 2026 06:00 PM",

        status: "Success",

        quizzesGenerated: 48,

        studentsAffected: 327,

        executionTime: "3.8 seconds"

    };

    const handleRunNow = () => {

        // TODO
        // Call backend endpoint

        alert("Scheduler started.");

    };
    useEffect(() => {
        if (!runDate) return;

        const day = new Date(runDate).toLocaleDateString(
            "en-AU",
            {
                weekday: "long",
                timeZone: "Australia/Sydney",
            }
        );

        setSelectedDay(day);

    }, [runDate]);

    return (

        <div className="run-scheduler">

            <h2>Scheduler Monitoring</h2>

            <p className="description">

                Monitor scheduler execution and manually trigger
                quiz generation for testing or administrative purposes.

            </p>

            <div className="status-grid">

                <div className="status-card">

                    <h4>Scheduler Status</h4>

                    <span className="success">
                        {scheduler.enabled ? "Enabled" : "Disabled"}
                    </span>

                </div>

                <div className="status-card">

                    <h4>Last Run</h4>

                    <span>{scheduler.lastRun}</span>

                </div>

                <div className="status-card">

                    <h4>Next Scheduled Run</h4>

                    <span>{scheduler.nextRun}</span>

                </div>

                <div className="status-card">

                    <h4>Last Result</h4>

                    <span className="success">
                        {scheduler.status}
                    </span>

                </div>

                <div className="status-card">

                    <h4>Quizzes Generated</h4>

                    <span>{scheduler.quizzesGenerated}</span>

                </div>

                <div className="status-card">

                    <h4>Students Affected</h4>

                    <span>{scheduler.studentsAffected}</span>

                </div>

                <div className="status-card">

                    <h4>Execution Time</h4>

                    <span>{scheduler.executionTime}</span>

                </div>

            </div>

            <div className="button-row">

                <button
                    className="run-btn"
                    onClick={handleRunNow}
                >
                    ▶ Run Scheduler Now
                </button>

                <button
                    className="back-btn"
                    onClick={onBack}
                >
                    ← Back
                </button>

            </div>

            <div className="assumption-box">

                <h3>

                    Implementation Assumption (Please Confirm)

                </h3>

                <ul>

                    <li>
                        Clicking <strong>Run Scheduler Now</strong> performs exactly the same process as the scheduled execution.
                    </li>

                    <li>
                        The scheduler determines the current academic week from the active term.
                    </li>

                    <li>
                        It retrieves the corresponding session and topic.
                    </li>

                    <li>
                        One enabled activity type is randomly selected.
                    </li>

                    <li>
                        AI generates quizzes which are stored for the appropriate Category → Class Year → Class Day students.
                    </li>

                    <li>
                        Execution statistics shown above are refreshed after every run.
                    </li>

                </ul>

            </div>

        </div>

    );

}