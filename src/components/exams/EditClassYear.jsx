import React, { useEffect, useState } from "react";
import "./ManageClassYears.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const EditClassYear = ({ centerCode, onClose }) => {
  const [classes, setClasses] = useState([]);
  const [classYears, setClassYears] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    class_name: "",
    year_name: "",
  });

  useEffect(() => {
    loadClasses();
    loadClassYears();
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

  const loadClassYears = async () => {
    try {
        const response = await fetch(
          `${API_BASE}/class-years-exam-module?center_code=${encodeURIComponent(centerCode)}`
        );

        if (!response.ok) {
          throw new Error("Failed to load class years");
        }

        const data = await response.json();

        console.log("Class Years:", data);

        setClassYears(data);
    } catch (err) {
        console.error(err);
    }
    };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/update-class-years-exam-module/${editingId}`,
        {
          method: "PUT",
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
          errorData?.detail || "Unable to update class year."
        );
      }

      alert("Class year updated successfully.");

      setEditingId(null);

      setForm({
        class_name: "",
        year_name: "",
      });

      loadClassYears();

    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to update class year.");
    }
  };

  return (
    <div className="manage-class-years">

      <h2>Edit Class Year</h2>

      <div className="form-card">

        <table className="class-year-table">

          <thead>
            <tr>
              <th>Class</th>
              <th>Year</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {classYears.map((row) => (

              <tr key={row.id}>

                <td>{row.class_name}</td>

                <td>{row.year_name}</td>

                <td>

                  <button
                    onClick={() => {
                      setEditingId(row.id);

                      setForm({
                        class_name: row.class_name,
                        year_name: row.year_name,
                      });
                    }}
                  >
                    Edit
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {editingId && (

          <div
            className="row"
            style={{ marginTop: "20px" }}
          >

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
              onClick={handleUpdate}
              disabled={
                !form.class_name ||
                !form.year_name.trim()
              }
            >
              Update
            </button>

            <button
              onClick={() => {
                setEditingId(null);

                setForm({
                  class_name: "",
                  year_name: "",
                });
              }}
            >
              Cancel
            </button>

          </div>

        )}

        <div style={{ marginTop: "20px" }}>

          <button onClick={onClose}>
            Back
          </button>

        </div>

      </div>

    </div>
  );
};

export default EditClassYear;