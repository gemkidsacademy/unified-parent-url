import React, { useState, useEffect } from "react";
import "./DeleteUserModal.css";

function DeleteUserModal({ centerCode, onClose, onUserDeleted }) {
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("");

  const BACKEND_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // Fetch students for this centre
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/students/by-center/${centerCode}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await res.json();

        setStudentOptions(data.students || []);
      } catch (err) {
        console.error(err);
        alert("Unable to load students");
      }
    };

    if (centerCode) {
      fetchStudents();
    }
  }, [centerCode, BACKEND_URL]);

  // Populate read-only student details
  useEffect(() => {
    if (!selectedStudentId) {
      setId("");
      setName("");
      setParentEmail("");
      setClassName("");
      setClassDay("");
      return;
    }

    const student = studentOptions.find(
      (s) => String(s.id) === String(selectedStudentId)
    );

    if (student) {
      setId(student.id);
      setName(student.name);
      setParentEmail(student.parent_email);
      setClassName(student.class_name);
      setClassDay(student.class_day);
    }
  }, [selectedStudentId, studentOptions]);

  // Delete student
  const handleDelete = async () => {
    if (!id) {
      alert("Please select a student to delete");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete:\n\n${name} (${id}) ?`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/delete_student_exam_module/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete student");
      }

      alert("Student deleted successfully");

      onUserDeleted?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error deleting student");
    }
  };

  return (
    <div className="delete-student-container">
      <button
        type="button"
        className="delete-student-back-button"
        onClick={onClose}
      >
        ← Back to User Management
      </button>

      <h2>Delete Student</h2>

      <p className="delete-student-description">
        Select a student to view their details before deleting them.
      </p>

      <div className="delete-student-form">
        <label>Select Student</label>

        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          <option value="">-- Select Student --</option>

          {studentOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.student_id} - {s.name}
            </option>
          ))}
        </select>

        <label>ID</label>

        <input
          type="text"
          value={id}
          readOnly
        />

        <label>Name</label>

        <input
          type="text"
          value={name}
          readOnly
        />

        <label>Class</label>

        <input
          type="text"
          value={className}
          readOnly
        />

        <label>Day</label>

        <input
          type="text"
          value={classDay}
          readOnly
        />

        <label>Parent Email</label>

        <input
          type="email"
          value={parentEmail}
          readOnly
        />

        <button
          className="danger-btn"
          type="button"
          onClick={handleDelete}
          disabled={!id}
        >
          Delete Student
        </button>
      </div>
    </div>
  );
}

export default DeleteUserModal;