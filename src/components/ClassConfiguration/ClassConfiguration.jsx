import React, { useEffect, useState } from "react";
import "./ClassConfiguration.css";

import AddClass from "./AddClass/AddClass";
import ManageClasses from "./ManageClass/ManageClass";


export default function ClassConfiguration({ loggedInUser, onBack }) {
    const server =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const [view, setView] = useState("home");
    const [editingClass, setEditingClass] = useState(null);

    const [terms, setTerms] = useState([]);
    const [selectedTermId, setSelectedTermId] = useState("");
    const [selectedTerm, setSelectedTerm] = useState(null);

    // ---------------------------------------
    // Load academic terms for this center
    // ---------------------------------------
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

            if (res.ok) {
                // IMPORTANT:
                // Replace this with the real response key if your API returns
                // academic_terms instead of terms.
                const termList = Array.isArray(data) ? data : [];

                setTerms(termList);

                // Do NOT auto-select active term.
                // Admin must explicitly choose the term in Class Configuration.
                setSelectedTermId("");
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

    const handleTermChange = (e) => {
        const value = e.target.value;
        setSelectedTermId(value);

        const matchedTerm = terms.find(
            (term) => String(term.id) === value
        );

        setSelectedTerm(matchedTerm || null);
    };

    const handleEdit = (item) => {
        setEditingClass(item);
        setView("add");
    };

    const handleBackToHome = () => {
        setEditingClass(null);
        setView("home");
    };

    // ---------------------------------------
    // Add Class Screen
    // ---------------------------------------
    if (view === "add") {
        return (
            <AddClass
                loggedInUser={loggedInUser}
                editingClass={editingClass}
                selectedTerm={selectedTerm}
                onBack={handleBackToHome}
            />
        );
    }

    // ---------------------------------------
    // Manage Classes Screen
    // ---------------------------------------
    if (view === "manage") {
        return (
            <ManageClasses
                loggedInUser={loggedInUser}
                selectedTerm={selectedTerm}
                onEdit={handleEdit}
                onBack={handleBackToHome}
            />
        );
    }

    // ---------------------------------------
    // Home Screen
    // ---------------------------------------
    return (
        <div className="class-configuration">
            <button
                type="button"
                className="class-configuration-back-btn"
                onClick={onBack}
            >
                ← Back
            </button>

            <h2>Class Configuration</h2>

            <p className="page-description">
                Create and manage teaching classes used by the
                Gamified Quiz module. Each class is uniquely identified
                by its <strong>Category</strong>,
                <strong> Class Year</strong> and
                <strong> Class Day</strong> within a selected academic term.
            </p>

            {/* Term Selector */}
            <div className="term-selector-box">
                <div className="term-selector-header">
                    <div className="term-selector-icon">📅</div>

                    <div>
                        <label className="term-label">
                            Academic Term
                        </label>

                        <p className="term-selector-description">
                            Select the academic term you want to configure classes for.
                        </p>
                    </div>
                </div>

                <select
                    value={selectedTermId}
                    onChange={handleTermChange}
                    className="term-select"
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
                        Please select an academic term before adding or managing classes.
                    </p>
                )}
            </div>

            <div className="card-grid">
                {/* Add Class */}
                <div
                    className={`action-card ${!selectedTerm ? "disabled-card" : ""}`}
                    onClick={() => {
                        if (!selectedTerm) return;
                        setEditingClass(null);
                        setView("add");
                    }}
                >
                    <div className="card-icon">➕</div>

                    <h3>Add Class</h3>

                    <p>
                        Create a new class for the selected academic term by selecting
                        Category, Class Year and Class Day.
                    </p>

                    <button
                        className="card-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!selectedTerm) return;
                            setEditingClass(null);
                            setView("add");
                        }}
                        disabled={!selectedTerm}
                    >
                        Add Class
                    </button>
                </div>

                {/* Manage Classes */}
                <div
                    className={`action-card ${!selectedTerm ? "disabled-card" : ""}`}
                    onClick={() => {
                        if (!selectedTerm) return;
                        setView("manage");
                    }}
                >
                    <div className="card-icon">📚</div>

                    <h3>Manage Classes</h3>

                    <p>
                        View, edit and delete configured classes for the selected academic term.
                    </p>

                    <button
                        className="card-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!selectedTerm) return;
                            setView("manage");
                        }}
                        disabled={!selectedTerm}
                    >
                        Manage Classes
                    </button>
                </div>
            </div>


        </div>
    );
}