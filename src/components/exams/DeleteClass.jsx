import { useEffect, useState } from "react";
import "./DeleteClass.css";

const BACKEND_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function DeleteClass({ centerCode, onClose }) {
  const [classes, setClasses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/classes/${centerCode}`
      );

      if (!response.ok) {
        throw new Error("Failed to load classes");
      }

      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load classes.");
    }
  };

  const handleDelete = async () => {
    if (!selectedId) {
      alert("Please select a class.");
      return;
    }

    const selectedClass = classes.find(
      (cls) => cls.id === Number(selectedId)
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedClass?.class_name}"?`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const response = await fetch(
        `${BACKEND_URL}/admin/delete-class/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            center_code: centerCode,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete class");
      }

      alert("Class deleted successfully!");

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error deleting class.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="delete-class-page">
      <div className="delete-class-card">
        <div className="delete-class-header">
          <div className="delete-class-icon">−</div>

          <div>
            <h1>Delete Class</h1>
            <p>
              Select an existing class to remove it from your centre.
            </p>
          </div>
        </div>

        <div className="delete-class-warning">
          <strong>Warning</strong>
          <span>
            Deleting a class may remove it from the class list.
            Please make sure you have selected the correct class.
          </span>
        </div>

        <div className="delete-class-field">
          <label htmlFor="delete-class-select">
            Select Class
          </label>

          <select
            id="delete-class-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Select a Class</option>

            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.id} - {cls.class_name}
              </option>
            ))}
          </select>
        </div>

        <div className="delete-class-actions">
          <button
            type="button"
            className="delete-class-cancel"
            onClick={onClose}
          >
            Back
          </button>

          <button
            type="button"
            className="delete-class-submit"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Class"}
          </button>
        </div>
      </div>
    </div>
  );
}