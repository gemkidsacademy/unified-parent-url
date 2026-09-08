import React, { useEffect, useState } from "react";
import "./ActivityTypes.css";

import AddActivity from "./AddActivity/AddActivity";
import ManageActivities from "./ManageActivities/ManageActivities";

export default function ActivityTypes({ loggedInUser, onBack }) {
    const server =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const [view, setView] = useState("home");
    const [editingActivity, setEditingActivity] = useState(null);

    const [terms, setTerms] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null);

    const loadTerms = async () => {
        try {
            const res = await fetch(
                `${server}/academic-terms/list`,
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

            const data = await res.json();

            if (!res.ok) {
                return;
            }

            const termList = Array.isArray(data) ? data : (data.terms || []);

            setTerms(termList);

            if (termList.length > 0) {
                setSelectedTerm(termList[0]);
            } else {
                setSelectedTerm(null);
            }

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (loggedInUser?.center_code) {
            loadTerms();
        }
    }, [loggedInUser]);

    const handleEdit = (activity) => {
        setEditingActivity(activity);
        setView("add");
    };

    // -----------------------------------
    // Add Activity
    // -----------------------------------
    if (view === "add") {
        return (
            <AddActivity
                loggedInUser={loggedInUser}
                editingActivity={editingActivity}
                selectedTerm={selectedTerm}
                onBack={() => {
                    setEditingActivity(null);
                    setView("home");
                }}
            />
        );
    }

    // -----------------------------------
    // Manage Activities
    // -----------------------------------
    if (view === "manage") {
        return (
            <ManageActivities
                loggedInUser={loggedInUser}
                selectedTerm={selectedTerm}
                onBack={() => setView("home")}
                onEdit={handleEdit}
            />
        );
    }

    return (
        <div className="activity-types">
            <button
                type="button"
                className="activity-types-back-btn"
                onClick={onBack}
            >
                <span className="back-arrow">←</span>
                <span>Back</span>
            </button>

            <h2>Activity Types</h2>

            <p className="page-description">
                Configure the activity types that can be used by the AI when generating
                gamified quizzes for a selected academic term.
            </p>

            <div className="term-selector-box">
                <label className="term-label">Academic Term</label>

                <select
                    className="term-select"
                    value={selectedTerm?.id || ""}
                    onChange={(e) => {
                        const term = terms.find(
                            (item) => String(item.id) === e.target.value
                        );
                        setSelectedTerm(term || null);
                    }}
                >
                    <option value="">Select Academic Term</option>

                    {terms.map((term) => (
                        <option key={term.id} value={term.id}>
                            {term.term_name}
                        </option>
                    ))}
                </select>

                {!selectedTerm && (
                    <p className="term-warning">
                        Please select an academic term before adding or managing activity types.
                    </p>
                )}
            </div>

            <div className="card-grid">
                <div
                    className={`action-card ${!selectedTerm ? "disabled-card" : ""}`}
                    onClick={() => {
                        if (!selectedTerm) return;
                        setEditingActivity(null);
                        setView("add");
                    }}
                >
                    <div className="card-icon">➕</div>

                    <h3>Add Activity</h3>

                    <p>
                        Create a new activity type for the selected academic term.
                    </p>

                    <button
                        className="card-btn"
                        disabled={!selectedTerm}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!selectedTerm) return;
                            setEditingActivity(null);
                            setView("add");
                        }}
                    >
                        Add Activity
                    </button>
                </div>

                <div
                    className={`action-card ${!selectedTerm ? "disabled-card" : ""}`}
                    onClick={() => {
                        if (!selectedTerm) return;
                        setView("manage");
                    }}
                >
                    <div className="card-icon">🎮</div>

                    <h3>Manage Activities</h3>

                    <p>
                        View, edit, delete and enable or disable activity types for the
                        selected academic term.
                    </p>

                    <button
                        className="card-btn"
                        disabled={!selectedTerm}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!selectedTerm) return;
                            setView("manage");
                        }}
                    >
                        Manage Activities
                    </button>
                </div>
            </div>

            
        </div>
    );
}