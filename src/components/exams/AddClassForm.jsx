import { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";


export default function AddClassForm({ onClose }) {
  const rawCenterCode = sessionStorage.getItem("center_code") || "";

  const centerCode = rawCenterCode.includes("|")
    ? rawCenterCode.split("|")[1].trim()
    : rawCenterCode;

  const [className, setClassName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const payload = {
      center_code: centerCode,
      class_name: className,
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(`${BACKEND_URL}/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to add class");
      }

      alert("Class added successfully!");

      setClassName("");

      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("Error adding class");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-student-container">
      <h2>Add Class</h2>
      <div
        style={{
          backgroundColor: "#fff3cd",
          color: "#856404",
          border: "1px solid #ffeeba",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "20px",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
      >
        <strong>Important:</strong> The class names entered here must exactly match
        the corresponding folder names created in Google Drive. Gem AI uses these
        names to locate and retrieve chatbot learning resources. Any mismatch in
        naming may prevent files from being accessed correctly.
      </div>

      <form onSubmit={handleSubmit}>
        <label>Class Name</label>

        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Enter class name"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? "submit-btn disabled" : "submit-btn"}
        >
          {isSubmitting ? "Saving Class..." : "Save Class"}
        </button>

        <button
          type="button"
          onClick={onClose}
          style={{ marginTop: "10px" }}
        >
          Back
        </button>
      </form>
    </div>
  );
}