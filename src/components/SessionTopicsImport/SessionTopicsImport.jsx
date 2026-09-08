import React, { useEffect, useState } from "react";
import "./SessionTopicsImport.css";

import DownloadTemplate from "./DownloadTemplate/DownloadTemplate";
import UploadTopics from "./UploadTopics/UploadTopics";

export default function SessionTopicsImport({ loggedInUser, onBack }) {
    const server =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const [view, setView] = useState("home");

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
                const termList = Array.isArray(data) ? data : [];

                setTerms(termList);

                // Admin chooses the term manually for session-topic planning
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

    const handleBackToHome = () => {
        setView("home");
    };

    // ---------------------------------------
    // Download CSV Screen
    // ---------------------------------------
    if (view === "download") {
        return (
            <DownloadTemplate
                loggedInUser={loggedInUser}
                selectedTerm={selectedTerm}
                onBack={handleBackToHome}
            />
        );
    }

    // ---------------------------------------
    // Upload CSV Screen
    // ---------------------------------------
    if (view === "upload") {
        return (
            <UploadTopics
                loggedInUser={loggedInUser}
                selectedTerm={selectedTerm}
                onBack={handleBackToHome}
            />
        );
    }

    return (
        <div className="session-topics">
            <button
                type="button"
                className="session-topics-back-btn"
                onClick={onBack}
            >
                <span className="back-arrow">←</span>
                <span>Back</span>
            </button>

            <h2>Session Topics</h2>

            <p className="page-description">
                Import session topics for a selected academic term using a CSV file.
                Download the automatically generated template, populate the
                <strong> Topic</strong> column, then upload the completed CSV.
            </p>

            {/* Term Selector */}
            <div className="term-selector-box">
                <label className="term-label">Academic Term</label>

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
                        Please select an academic term before downloading or uploading session topics.
                    </p>
                )}
            </div>

            <div className="card-grid">
                {/* Download Template */}
                <div
                    className={`action-card ${!selectedTerm ? "disabled-card" : ""}`}
                    onClick={() => {
                        if (!selectedTerm) return;
                        setView("download");
                    }}
                >
                    <div className="card-icon">
                        📥
                    </div>

                    <h3>
                        Download CSV
                    </h3>

                    <p>
                        Download a CSV template for the selected academic term
                        containing all configured classes together with every generated session.
                    </p>

                    <button
                        className="card-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!selectedTerm) return;
                            setView("download");
                        }}
                        disabled={!selectedTerm}
                    >
                        Download Template
                    </button>
                </div>

                {/* Upload CSV */}
                <div
                    className={`action-card ${!selectedTerm ? "disabled-card" : ""}`}
                    onClick={() => {
                        if (!selectedTerm) return;
                        setView("upload");
                    }}
                >
                    <div className="card-icon">
                        📤
                    </div>

                    <h3>
                        Upload CSV
                    </h3>

                    <p>
                        Upload the completed CSV for the selected academic term
                        after filling in the Topic column.
                    </p>

                    <button
                        className="card-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!selectedTerm) return;
                            setView("upload");
                        }}
                        disabled={!selectedTerm}
                    >
                        Upload Topics
                    </button>
                </div>
            </div>

            
        </div>
    );
}