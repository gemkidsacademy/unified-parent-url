import React, { useState } from "react";
import "./bulk-upload.css";

const BulkUserUpload = ({ centerCode, onClose }) => {
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Read center code exactly like Add Student form
  

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    if (!centerCode) {
      setError("Center code not found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("center_code", centerCode);

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/bulk-users-exam-module`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }

      const result = await response.json();

      let message =
        `Upload completed.\n\n` +
        `✅ Success: ${result.success}\n` +
        `❌ Failed: ${result.failed}`;

      if (result.errors && result.errors.length > 0) {
        message += "\n\nFailure Details:\n";

        result.errors.forEach((err) => {
          message +=
            `\nRow ${err.row} (${err.student_id})\n` +
            `${err.error}\n`;
        });
      }

      alert(message);

      setFile(null);
      onClose();

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to upload users. Please check the CSV file."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="bulk-upload-container">
        <button
          type="button"
          className="bulk-upload-back-button"
          onClick={onClose}
          disabled={loading}
        >
          ← Back to User Management
        </button>

        <div className="bulk-upload-title">
          Bulk User Upload
        </div>

      <div className="file-input-wrapper">
        <label className="custom-file-btn">
          Choose File

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>

        <span className="file-name">
          {file ? file.name : "No file chosen"}
        </span>
      </div>

      {error && (
        <p
          style={{
            marginTop: 8,
            color: "#dc2626",
            fontSize: 13,
          }}
        >
          {error}
        </p>
      )}

      <div className="bulk-upload-actions">
        <button
          className="btn-upload"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        <button
          className="btn-cancel"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BulkUserUpload;