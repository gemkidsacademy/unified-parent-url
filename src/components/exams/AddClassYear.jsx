import React, { useEffect, useState } from "react";
import "./ManageClassYears.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const AddClassYear = ({ centerCode, onClose }) => {
  const [classes, setClasses] = useState([]);

  const [form, setForm] = useState({
    class_name: "",
    year_name: "",
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/class-names/classes?center_code=${encodeURIComponent(centerCode)}`
      );

      if (!response.ok) {
        throw new Error("Failed to load classes");
      }

      const data = await response.json();
      setClasses(data.classes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/add-class-years-exam-module`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            center_code: centerCode,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Unable to add class year."
        );
      }

      alert("Class year added successfully.");

      setForm({
        class_name: "",
        year_name: "",
      });

    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to add class year.");
    }
  };

  return (
    <div className="manage-class-years">

      <h2>Add Class Year</h2>

      <div className="form-card">

        <div className="row">

          <select
            value={form.class_name}
            onChange={(e) =>
              setForm({
                ...form,
                class_name: e.target.value,
              })
            }
          >
            <option value="">Select Class</option>

            {classes.map((className) => (
              <option
                key={className}
                value={className}
              >
                {className}
              </option>
            ))}

          </select>

          <input
            type="text"
            placeholder="Year Name"
            value={form.year_name}
            onChange={(e) =>
              setForm({
                ...form,
                year_name: e.target.value,
              })
            }
          />

          <button
            onClick={handleSave}
            disabled={
              !form.class_name ||
              !form.year_name.trim()
            }
          >
            Add
          </button>

          <button onClick={onClose}>
            Back
          </button>

        </div>

      </div>

    </div>
  );
};

export default AddClassYear;