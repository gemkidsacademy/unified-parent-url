import { useEffect, useState } from "react";
import "./AddStudentForm.css";

export default function ViewUserModal({ centerCode, onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/students/active/by-center/${centerCode}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await res.json();

        setStudents(data.students || []);
      } catch (err) {
        console.error(err);
        alert("Unable to load students");
      } finally {
        setLoading(false);
      }
    };

    if (centerCode) {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, [centerCode, BACKEND_URL]);

  return (
    <div className="add-student-container full-width">
      <button
        type="button"
        className="view-students-back-button"
        onClick={onClose}
      >
        ← Back to User Management
      </button>

      <h2>View Students</h2>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Year</th>
                <th>Day</th>
                <th>Parent Email</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.student_id}</td>
                  <td>{s.name}</td>
                  <td>{s.class_name}</td>
                  <td>{s.student_year}</td>
                  <td>{s.class_day}</td>
                  <td>{s.parent_email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        className="view-students-close-button"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}