import React from "react";
import "./DownloadTemplate.css";

export default function DownloadTemplate({
    loggedInUser,
    selectedTerm,
    onBack,
}) {
    const server =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const handleDownload = async () => {
        if (!selectedTerm || !selectedTerm.id) {
            alert("Please select an academic term first.");
            return;
        }

        try {
            const response = await fetch(
                `${server}/session-topics/download-template`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        center_code: loggedInUser.center_code,
                        term_id: selectedTerm.id,
                        term_name: selectedTerm.term_name,
                    }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                alert(err.detail || "Unable to download template.");
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;

            const safeTermName = (selectedTerm.term_name || "AcademicTerm")
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "_");

            link.download = `SessionTopicsTemplate_${safeTermName}.csv`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Unable to download template.");
        }
    };

    return (
        <div className="download-template">
            <h2>Download Session Topics Template</h2>

            <p className="description">
                Download a CSV template for the selected academic term containing
                every configured class together with every generated session.
                The administrator only needs to complete the <strong>Topic</strong> column.
            </p>

            {selectedTerm ? (
                <p className="description">
                    <strong>Academic Term:</strong> {selectedTerm.term_name}
                </p>
            ) : (
                <p className="description" style={{ color: "#b45309" }}>
                    Please select an academic term before downloading the template.
                </p>
            )}

            <div className="preview-box">
                <h3>CSV Template Columns</h3>

                <ul>
                    <li>Category</li>
                    <li>Class Year</li>
                    <li>Class Day</li>
                    <li>Session</li>
                    <li>Topic</li>
                </ul>
            </div>

            <div className="button-row">
                <button
                    className="download-btn"
                    onClick={handleDownload}
                    disabled={!selectedTerm}
                >
                    Download CSV
                </button>

                <button
                    className="back-btn"
                    onClick={onBack}
                >
                    Back
                </button>
            </div>
        </div>
    );
}