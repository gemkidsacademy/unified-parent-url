import React, { useEffect, useState } from "react";
import "./Dashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function Dashboard({ loggedInUser, onBack }) {

    const [dashboard, setDashboard] = useState({

        activeTerm: "",

        configuredClasses: 0,

        enabledActivities: 0,

        importedTopics: 0,

        schedulerEnabled: false,

        nextRun: "",

        lastRun: "",

        lastRunStatus: "",

        systemSummary: []

    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (loggedInUser?.center_code) {

            loadDashboardSummary();

        }

    }, [loggedInUser]);

    const loadDashboardSummary = async () => {

        try {

            setLoading(true);

            const response = await fetch(
                `${API_BASE}/dashboard/summary`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        center_code: loggedInUser.center_code,
                    }),
                }
            );

            const data = await response.json();

            console.log("Dashboard summary:", data);

            setDashboard({

                activeTerm:
                    data.academic_term || "Not Configured",

                configuredClasses:
                    data.configured_classes || 0,

                enabledActivities:
                    data.enabled_activity_types || 0,

                importedTopics:
                    data.topics_imported || 0,

                schedulerEnabled:
                    data.scheduler_enabled || false,

                // Hardcoded
                nextRun: "Monday 6:00 PM",

                lastRun:
                    data.last_scheduler_run || "Never",

                lastRunStatus:
                    data.last_run_result || "Not Run",

                systemSummary:
                    data.system_summary || []

            });

        }

        catch (error) {

            console.error(
                "Failed to load dashboard summary:",
                error
            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="dashboard">

            <button
                type="button"
                className="gamified-dashboard-back-btn"
                onClick={onBack}
            >
                <span className="back-arrow">←</span>
                <span>Back</span>
            </button>

            <h2>

                Gamified Quiz Dashboard

            </h2>

            <p className="dashboard-description">

                This dashboard provides a quick overview of the current
                Gamified Quiz configuration and scheduler status.

            </p>

            <div className="dashboard-grid">

                <div className="dashboard-card">

                    <h4>Academic Term</h4>

                    <span>
                        {loading ? "Loading..." : dashboard.activeTerm}
                    </span>

                </div>

                <div className="dashboard-card">

                    <h4>Configured Classes</h4>

                    <span>
                        {loading ? "Loading..." : dashboard.configuredClasses}
                    </span>

                </div>

                <div className="dashboard-card">

                    <h4>Enabled Activity Types</h4>

                    <span>
                        {loading ? "Loading..." : dashboard.enabledActivities}
                    </span>

                </div>

                <div className="dashboard-card">

                    <h4>Topics Imported</h4>

                    <span>
                        {loading ? "Loading..." : dashboard.importedTopics}
                    </span>

                </div>

                <div className="dashboard-card">

                    <h4>Scheduler</h4>

                    <span
                        className={
                            dashboard.schedulerEnabled
                                ? "green"
                                : "orange"
                        }
                    >

                        {loading
                            ? "Loading..."
                            : dashboard.schedulerEnabled
                                ? "Enabled"
                                : "Disabled"}

                    </span>

                </div>

                <div className="dashboard-card">

                    <h4>Next Scheduled Run</h4>

                    <span>
                        {loading ? "Loading..." : dashboard.nextRun}
                    </span>

                </div>

                <div className="dashboard-card">

                    <h4>Last Scheduler Run</h4>

                    <span>
                        {loading ? "Loading..." : dashboard.lastRun}
                    </span>

                </div>

                <div className="dashboard-card">

                    <h4>Last Run Result</h4>

                    <span
                        className={
                            dashboard.lastRunStatus === "Success"
                                ? "green"
                                : dashboard.lastRunStatus === "Failed"
                                    ? "red"
                                    : "orange"
                        }
                    >

                        {loading ? "Loading..." : dashboard.lastRunStatus}

                    </span>

                </div>

            </div>

            <div className="summary-box">

                <h3>

                    System Summary

                </h3>

                {loading ? (

                    <p>Loading summary...</p>

                ) : dashboard.systemSummary.length === 0 ? (

                    <p>No summary available.</p>

                ) : (

                    <ul>

                        {dashboard.systemSummary.map(
                            (item, index) => (

                                <li key={index}>

                                    {item}

                                </li>

                            )
                        )}

                    </ul>

                )}

            </div>

        </div>

    );

}