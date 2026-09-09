import { useEffect, useState } from "react";
import "./EditClassForm.css";

const BACKEND_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function EditClassForm({ centerCode, onClose }) {
  const [classes, setClasses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [className, setClassName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleClassChange = (e) => {
    const id = e.target.value;

    setSelectedId(id);

    const selected = classes.find(
      (cls) => cls.id === Number(id)
    );

    if (selected) {
      setClassName(selected.class_name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${BACKEND_URL}/admin/update-class/${selectedId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            class_name: className,
            center_code: centerCode,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update class");
      }

      alert("Class updated successfully!");

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error updating class.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-class-page">
      <div className="edit-class-card">
        <div className="edit-class-header">
          <div className="edit-class-icon">✎</div>

          <div>
            <h1>Edit Class</h1>
            <p>
              Select an existing class and update its name.
            </p>
          </div>
        </div>

        <form
          className="edit-class-form"
          onSubmit={handleSubmit}
        >
          <div className="edit-class-field">
            <label htmlFor="select-class">
              Select Class
            </label>

            <select
              id="select-class"
              value={selectedId}
              onChange={handleClassChange}
              required
            >
              <option value="">
                Select a Class
              </option>

              {classes.map((cls) => (
                <option
                  key={cls.id}
                  value={cls.id}
                >
                  {cls.id} - {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          <div className="edit-class-field">
            <label htmlFor="class-name">
              Class Name
            </label>

            <input
              id="class-name"
              type="text"
              value={className}
              onChange={(e) =>
                setClassName(e.target.value)
              }
              placeholder="Enter class name"
              required
            />
          </div>

          <div className="edit-class-actions">
            <button
              type="button"
              className="edit-class-cancel"
              onClick={onClose}
            >
              Back
            </button>

            <button
              type="submit"
              className="edit-class-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Updating..."
                : "Update Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}