import { useState } from "react";
import axios from "axios";
import "./AddBulkActivity.css";

export default function AddBulkActivity() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload Excel to backend
  const handleUpload = async () => {
  if (!file) {
    setMessage("Please select a CSV file first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  console.log("Uploading file:", file.name, file.type, file.size);

  try {
    setUploading(true);
    setMessage("");

    const response = await axios.post(
      "https://web-production-481a5.up.railway.app/add-activities-from-csv",
      formData
    );

    setMessage(`${response.data.message}`);
  } catch (err) {
    console.error("Upload error:", err);
    if (err.response && err.response.data && err.response.data.detail) {
      setMessage(`Failed: ${err.response.data.detail}`);
    } else {
      setMessage("Failed to upload activities. Please try again.");
    }
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="bulk-activity-container">
      <h3>Add Bulk Activities</h3>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload CSV"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
